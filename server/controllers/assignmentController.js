import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import { createNotification } from './notificationController.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get assignments for authenticated user (Role/Department filtered & Division/Section matched)
// @route   GET /api/assignments
// @access  Private (All authenticated users)
export const getAssignments = async (req, res, next) => {
  try {
    const { role, department } = req.user;
    let query = {};

    if (role === 'student') {
      // Find the student's active academic class / division enrollment
      const enrollment = await StudentEnrollment.findOne({ student: req.user._id, status: 'active' }).populate('academicClass');
      const studentClassName = enrollment?.academicClass?.name || '';
      const studentSection = req.user.profileInfo?.section || '';

      const allowedSections = ['', 'all', 'All', 'All Divisions', 'all divisions'];
      if (studentClassName) allowedSections.push(studentClassName);
      if (studentSection) allowedSections.push(studentSection);

      // Generate flexible division tokens (e.g., "Div 1", "Div 2", "IT-D1", "IT-D2")
      const divisionRegexes = [];
      const combinedDivString = `${studentClassName} ${studentSection}`;
      if (/D1|Div 1|Division 1|\b1\b|\bA\b|Sec A|Section A/i.test(combinedDivString)) {
        allowedSections.push('Div 1', 'Division 1', 'D1', 'Section A');
        divisionRegexes.push(/1|d1|div 1|division 1|sec a|section a/i);
      }
      if (/D2|Div 2|Division 2|\b2\b|\bB\b|Sec B|Section B/i.test(combinedDivString)) {
        allowedSections.push('Div 2', 'Division 2', 'D2', 'Section B');
        divisionRegexes.push(/2|d2|div 2|division 2|sec b|section b/i);
      }

      const orConditions = [
        { section: { $in: allowedSections } },
        { section: '' },
        { section: null },
        { section: { $exists: false } },
      ];

      for (const rx of divisionRegexes) {
        orConditions.push({ section: { $regex: rx } });
      }

      query = {
        department: department,
        $or: orConditions,
      };
    } else if (role === 'faculty') {
      query = {
        $or: [
          { faculty: req.user._id },
          { department: department },
        ],
      };
    } // Admin sees all assignments

    const assignments = await Assignment.find(query)
      .populate('faculty', 'name email role department')
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private (All authenticated users)
export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('faculty', 'name email role department profileInfo');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Role visibility check: Students can only view assignments for their department
    if (req.user.role === 'student' && assignment.department !== req.user.department) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view this assignment' });
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Faculty/Admin)
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subject, department, semester, section, dueDate, totalMarks, status } = req.body;

    if (!title || !description || !subject || !dueDate || !totalMarks) {
      return res.status(400).json({ message: 'Please provide title, description, subject, due date, and total marks' });
    }

    if (Number(totalMarks) < 1) {
      return res.status(400).json({ message: 'Total marks must be at least 1' });
    }

    // AUTOMATIC DEPARTMENT ENFORCEMENT: Faculty's department is automatically enforced from their JWT identity
    let targetDepartment = department ? department.trim() : req.user.department;
    if (req.user.role === 'faculty') {
      targetDepartment = req.user.department;
    }

    const targetSection = section ? section.trim() : 'All Divisions';

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      department: targetDepartment,
      semester: semester ? Number(semester) : 1,
      section: targetSection,
      dueDate: new Date(dueDate),
      totalMarks: Number(totalMarks),
      status: status || 'active',
      faculty: req.user._id, // Set automatically from authenticated user
    });

    // Log system activity
    await logActivity({
      action: 'ASSIGNMENT_CREATED',
      performedBy: req.user._id,
      details: `Created assignment "${assignment.title}" for department "${targetDepartment}", division "${targetSection}" (${assignment.subject})`,
      targetId: assignment._id,
      targetType: 'Assignment',
    });

    // Notify all students in the assigned department
    const departmentStudents = await User.find({ role: 'student', department: targetDepartment }).select('_id');
    for (const student of departmentStudents) {
      await createNotification({
        recipient: student._id,
        title: 'New Assignment',
        message: `A new assignment "${title.trim()}" (${targetSection}) has been posted for your course (${assignment.subject}).`,
        type: 'assignment',
        relatedId: assignment._id,
        relatedType: 'Assignment',
      });
    }

    const populatedAssignment = await Assignment.findById(assignment._id).populate(
      'faculty',
      'name email role department'
    );

    res.status(201).json(populatedAssignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing assignment
// @route   PUT /api/assignments/:id
// @access  Private (Creator Faculty or Admin only)
export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Authorization check: Only creator faculty or Admin can update
    const isCreator = assignment.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to update this assignment',
      });
    }

    assignment.title = req.body.title ? req.body.title.trim() : assignment.title;
    assignment.description = req.body.description ? req.body.description.trim() : assignment.description;
    assignment.subject = req.body.subject ? req.body.subject.trim() : assignment.subject;
    assignment.department = req.body.department ? req.body.department.trim() : assignment.department;
    assignment.section = req.body.section ? req.body.section.trim() : assignment.section;
    assignment.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : assignment.dueDate;
    assignment.totalMarks = req.body.totalMarks !== undefined ? Number(req.body.totalMarks) : assignment.totalMarks;
    assignment.status = req.body.status || assignment.status;

    const updatedAssignment = await assignment.save();
    const populatedAssignment = await Assignment.findById(updatedAssignment._id).populate(
      'faculty',
      'name email role department'
    );

    res.json(populatedAssignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Creator Faculty or Admin only)
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Authorization check: Only creator faculty or Admin can delete
    const isCreator = assignment.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to delete this assignment',
      });
    }

    // Clean up related submission documents
    await Submission.deleteMany({ assignment: assignment._id });

    await Assignment.deleteOne({ _id: assignment._id });
    res.json({ message: 'Assignment and related submissions deleted successfully' });
  } catch (error) {
    next(error);
  }
};

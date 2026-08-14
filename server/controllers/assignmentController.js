import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get assignments for authenticated user (Role/Department filtered)
// @route   GET /api/assignments
// @access  Private (All authenticated users)
export const getAssignments = async (req, res, next) => {
  try {
    const { role, department } = req.user;
    let query = {};

    if (role === 'student') {
      query = { department: department };
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

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      department: targetDepartment,
      semester: semester ? Number(semester) : 1,
      section: section ? section.trim() : '',
      dueDate: new Date(dueDate),
      totalMarks: Number(totalMarks),
      status: status || 'active',
      faculty: req.user._id, // Set automatically from authenticated user
    });

    // Log system activity
    await logActivity({
      action: 'ASSIGNMENT_CREATED',
      performedBy: req.user._id,
      details: `Created assignment "${assignment.title}" for department "${targetDepartment}" (${assignment.subject})`,
      targetId: assignment._id,
      targetType: 'Assignment',
    });

    // Notify all students in the assigned department
    const departmentStudents = await User.find({ role: 'student', department: targetDepartment }).select('_id');
    for (const student of departmentStudents) {
      await createNotification({
        recipient: student._id,
        title: 'New Assignment',
        message: `A new assignment "${title.trim()}" has been posted for your course (${assignment.subject}).`,
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

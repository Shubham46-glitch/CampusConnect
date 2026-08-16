import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import AcademicClass from '../models/AcademicClass.js';
import Department from '../models/Department.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationController.js';
import { logActivity } from '../utils/activityLogger.js';

const escapeRegex = (text) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// @desc    Get assignments for authenticated user (Role/Department filtered & Division/Section matched)
// @route   GET /api/assignments
// @access  Private (All authenticated users)
export const getAssignments = async (req, res, next) => {
  try {
    const { role, department } = req.user;
    let query = {};

    if (role === 'student') {
      const studentId = req.user._id;

      // 1. Fetch IDs of assignments ALREADY submitted by this student
      const submittedAssignmentIds = await Submission.find({ student: studentId }).distinct('assignment');

      // 2. Resolve student's active enrollment & academic class
      let enrollment = await StudentEnrollment.findOne({ student: studentId, status: 'active' })
        .populate('academicClass');

      // Auto-enroll if missing
      if (!enrollment && req.user.department) {
        const targetDept = req.user.department.trim();
        const code = targetDept.split(' ').map((w) => w[0]).join('').toUpperCase();
        let deptDoc = await Department.findOne({ name: new RegExp(`^${escapeRegex(targetDept)}$`, 'i') });
        if (!deptDoc) {
          deptDoc = await Department.create({ name: targetDept, code, description: `${targetDept} Department` });
        }
        let classDoc = await AcademicClass.findOne({ department: deptDoc._id, name: `${code}-D1` });
        if (!classDoc) {
          classDoc = await AcademicClass.create({ name: `${code}-D1`, department: deptDoc._id, year: 'Second Year', semester: 3 });
        }
        enrollment = await StudentEnrollment.create({
          student: studentId,
          academicClass: classDoc._id,
          department: deptDoc._id,
          rollNumber: req.user.profileInfo?.rollNumber || `${code}-01`,
          status: 'active',
        });
        enrollment = await StudentEnrollment.findById(enrollment._id).populate('academicClass');
      }

      const studentClassId = enrollment?.academicClass?._id;
      const studentClassName = enrollment?.academicClass?.name || '';
      const isD1 = /D1|Div 1|Division 1|\bSec A\b/i.test(studentClassName);
      const isD2 = /D2|Div 2|Division 2|\bSec B\b/i.test(studentClassName);

      const deptRegex = new RegExp(`^${escapeRegex(department.trim())}$`, 'i');

      const orConditions = [];

      // If assignment has academicClass matching student's class ID
      if (studentClassId) {
        orConditions.push({ academicClass: studentClassId });
      }

      // Or assignment is for All Divisions (no specific academicClass set)
      const allDivisionsSubQuery = {
        $and: [
          { $or: [{ academicClass: null }, { academicClass: { $exists: false } }] },
          {
            $or: [
              { section: { $in: ['All Divisions', 'all', 'ALL', '', null] } },
              { section: { $exists: false } },
              { section: new RegExp(`^${escapeRegex(studentClassName)}$`, 'i') },
              ...(isD1 ? [{ section: /D1|Div 1|Division 1|Sec A/i }] : []),
              ...(isD2 ? [{ section: /D2|Div 2|Division 2|Sec B/i }] : []),
            ],
          },
        ],
      };

      orConditions.push(allDivisionsSubQuery);

      query = {
        department: deptRegex,
        _id: { $nin: submittedAssignmentIds },
        $or: orConditions,
      };
    } else if (role === 'faculty') {
      const deptRegex = new RegExp(`^${escapeRegex(department.trim())}$`, 'i');
      query = {
        $or: [
          { faculty: req.user._id },
          { department: deptRegex },
        ],
      };
    }

    const assignments = await Assignment.find(query)
      .populate('faculty', 'name email role department')
      .populate('academicClass', 'name year semester')
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
      .populate('faculty', 'name email role department profileInfo')
      .populate('academicClass', 'name year semester');

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
    const { title, description, subject, academicClass, department, semester, section, dueDate, totalMarks, status } = req.body;

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

    const assignmentData = {
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
    };

    if (academicClass) {
      assignmentData.academicClass = academicClass;
    }

    const assignment = await Assignment.create(assignmentData);

    // Log system activity (fail-safe)
    try {
      if (typeof logActivity === 'function') {
        await logActivity({
          action: 'ASSIGNMENT_CREATED',
          performedBy: req.user._id,
          details: `Created assignment "${assignment.title}" for department "${targetDepartment}", division "${targetSection}" (${assignment.subject})`,
          targetId: assignment._id,
          targetType: 'Assignment',
        });
      }
    } catch (logErr) {
      console.error('[AssignmentController] Activity logging ignored failure:', logErr.message);
    }

    // Notify students in the assigned class or department
    let recipientQuery = { role: 'student', department: targetDepartment };
    if (academicClass) {
      const classEnrollments = await StudentEnrollment.find({ academicClass, status: 'active' }).select('student');
      const studentIds = classEnrollments.map((e) => e.student);
      if (studentIds.length > 0) {
        recipientQuery = { _id: { $in: studentIds } };
      }
    }
    const targetStudents = await User.find(recipientQuery).select('_id');
    for (const student of targetStudents) {
      await createNotification({
        recipient: student._id,
        title: 'New Assignment',
        message: `A new assignment "${title.trim()}" (${targetSection}) has been posted for your course (${assignment.subject}).`,
        type: 'assignment',
        relatedId: assignment._id,
        relatedType: 'Assignment',
      });
    }

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('faculty', 'name email role department')
      .populate('academicClass', 'name year semester');

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
    if (req.body.academicClass !== undefined) {
      assignment.academicClass = req.body.academicClass || null;
    }
    assignment.section = req.body.section ? req.body.section.trim() : assignment.section;
    assignment.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : assignment.dueDate;
    assignment.totalMarks = req.body.totalMarks !== undefined ? Number(req.body.totalMarks) : assignment.totalMarks;
    assignment.status = req.body.status || assignment.status;

    const updatedAssignment = await assignment.save();
    const populatedAssignment = await Assignment.findById(updatedAssignment._id)
      .populate('faculty', 'name email role department')
      .populate('academicClass', 'name year semester');

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

    // Clean up related submission & notification documents
    await Submission.deleteMany({ assignment: assignment._id });
    await Notification.deleteMany({ relatedId: assignment._id, relatedType: 'Assignment' });

    await Assignment.deleteOne({ _id: assignment._id });
    res.json({ message: 'Assignment, related submissions, and notifications deleted successfully' });
  } catch (error) {
    next(error);
  }
};

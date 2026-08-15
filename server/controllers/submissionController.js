import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import { createNotification } from './notificationController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/submissions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${uniquePrefix}_${safeBaseName}`);
  },
});

const ALLOWED_EXTENSIONS = /\.(pdf|ppt|pptx|doc|docx|xls|xlsx|zip|png|jpg|jpeg|webp|gif|svg)$/i;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'), false);
  }
};

export const multerUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // Exact 25 MB limit
  fileFilter,
});

// Fail-safe Multer Middleware Wrapper to capture file size & extension errors cleanly
export const handleMulterUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size must be 25 MB or less.' });
        }
        if (err.message === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            message: 'Invalid file type. Allowed formats: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, ZIP, and Images (.png, .jpg, .jpeg, .webp, .gif, .svg)',
          });
        }
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }
      next();
    });
  };
};

// @desc    Submit assignment work or replace submission (Student only)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.status === 'closed') {
      return res.status(400).json({ message: 'Assignment is closed for submissions' });
    }

    if (assignment.department !== req.user.department) {
      return res.status(403).json({ message: 'Forbidden: You do not belong to the target department' });
    }

    console.log('[Backend Submit] req.file:', req.file);
    console.log('[Backend Submit] req.body:', req.body);

    let finalFileUrl = req.body.fileUrl ? req.body.fileUrl.trim() : '';
    let finalFileName = req.body.fileName ? req.body.fileName.trim() : '';
    let finalContent = req.body.content ? req.body.content.trim() : req.body.notes ? req.body.notes.trim() : req.body.comment ? req.body.comment.trim() : req.body.submissionContent ? req.body.submissionContent.trim() : '';

    // If file was uploaded directly in this multipart request
    if (req.file) {
      const storedFileName = req.file.filename;
      finalFileUrl = `/api/submissions/download/${storedFileName}`;
      finalFileName = req.file.originalname.trim();
    }

    // A submission is VALID if EITHER a file exists OR text content exists
    if (!req.file && !finalFileUrl && !finalContent) {
      return res.status(400).json({ message: 'Please upload a file or provide submission content.' });
    }

    // Deadline check: status set to 'late' if submitted after dueDate
    const isLate = new Date() > new Date(assignment.dueDate);
    const submissionStatus = isLate ? 'late' : 'submitted';

    let submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });

    if (submission) {
      // Replace existing submission
      if (finalContent) submission.content = finalContent;
      if (finalFileUrl) submission.fileUrl = finalFileUrl;
      if (finalFileName) submission.fileName = finalFileName;
      submission.submittedAt = new Date();
      if (submission.status !== 'graded' && submission.status !== 'evaluated') {
        submission.status = submissionStatus;
      }
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: assignment._id,
        student: req.user._id,
        content: finalContent,
        fileName: finalFileName,
        fileUrl: finalFileUrl,
        submittedAt: new Date(),
        status: submissionStatus,
      });
    }

    // Fail-safe notifications
    try {
      await createNotification({
        recipient: req.user._id,
        title: 'Assignment Submitted',
        message: `Your submission for "${assignment.title}" has been submitted successfully.`,
        type: 'assignment',
        relatedId: assignment._id,
        relatedType: 'Assignment',
      });

      if (assignment.faculty && assignment.faculty.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: assignment.faculty,
          title: 'New Assignment Submission',
          message: `Student "${req.user.name}" submitted work for "${assignment.title}".`,
          type: 'assignment',
          relatedId: assignment._id,
          relatedType: 'Assignment',
        });
      }
    } catch (notifErr) {
      console.error('[SubmissionController] Notification warning:', notifErr.message);
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email department profileInfo')
      .populate('assignment', 'title totalMarks dueDate subject department section');

    res.status(200).json({
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      submission: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student submissions & roster statistics for an assignment (Faculty/Admin)
// @route   GET /api/assignments/:id/submissions
// @access  Private (Creator Faculty or Admin only)
export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('faculty', 'name email department');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const isCreator = assignment.faculty?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to view submissions for this assignment',
      });
    }

    // Fetch department students
    const allDeptStudents = await User.find({
      role: 'student',
      department: assignment.department,
    }).select('name email department profileInfo status');

    // Fetch student enrollments for roll numbers
    const enrollments = await StudentEnrollment.find({ department: assignment.department }).select('student rollNumber');
    const rollMap = new Map();
    enrollments.forEach((e) => {
      if (e.student) rollMap.set(e.student.toString(), e.rollNumber);
    });

    // Fetch existing submissions for this assignment
    const submissions = await Submission.find({ assignment: assignment._id })
      .populate('student', 'name email department profileInfo')
      .sort({ submittedAt: -1 });

    const submissionMap = new Map();
    submissions.forEach((sub) => {
      if (sub.student) {
        submissionMap.set(sub.student._id.toString(), sub);
      }
    });

    const roster = allDeptStudents.map((st) => {
      const sub = submissionMap.get(st._id.toString());
      const rollNumber = st.profileInfo?.rollNumber || rollMap.get(st._id.toString()) || 'N/A';
      return {
        student: {
          _id: st._id,
          name: st.name,
          email: st.email,
          department: st.department,
          profileInfo: {
            ...st.profileInfo,
            rollNumber,
          },
        },
        hasSubmitted: !!sub,
        submissionId: sub?._id || null,
        submittedAt: sub?.submittedAt || null,
        fileName: sub?.fileName || (sub?.fileUrl ? path.basename(sub.fileUrl) : ''),
        fileUrl: sub?.fileUrl || '',
        content: sub?.content || '',
        status: sub ? (sub.status === 'graded' ? 'evaluated' : sub.status) : 'pending',
        marks: sub?.marks !== undefined ? sub.marks : null,
        feedback: sub?.feedback || '',
        gradedAt: sub?.gradedAt || null,
      };
    });

    const stats = {
      totalStudents: roster.length,
      submittedCount: roster.filter((r) => r.hasSubmitted && r.status === 'submitted').length,
      lateCount: roster.filter((r) => r.status === 'late').length,
      evaluatedCount: roster.filter((r) => r.status === 'evaluated' || r.status === 'graded').length,
      notSubmittedCount: roster.filter((r) => !r.hasSubmitted).length,
    };

    res.json({
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      department: assignment.department,
      section: assignment.section || 'All Divisions',
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      count: submissions.length,
      stats,
      roster,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions of logged-in student (Student only)
// @route   GET /api/submissions/my
// @access  Private (Student)
export const getMySubmissions = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their submission history' });
    }

    const submissions = await Submission.find({ student: req.user._id })
      .populate({
        path: 'assignment',
        populate: { path: 'faculty', select: 'name email department' },
      })
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single submission by ID
// @route   GET /api/submissions/:id
// @access  Private (Student owner, Creator Faculty, or Admin)
export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email department profileInfo')
      .populate('assignment', 'title description subject totalMarks dueDate faculty department section');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const isStudentOwner = submission.student._id.toString() === req.user._id.toString();
    const isFacultyCreator = submission.assignment?.faculty?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isFacultyCreator && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate / Grade student submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Creator Faculty or Admin only)
export const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = submission.assignment;
    const isCreator = assignment.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to grade this submission',
      });
    }

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      return res.status(400).json({ message: 'Marks cannot be negative' });
    }

    if (numMarks > assignment.totalMarks) {
      return res.status(400).json({
        message: `Marks (${numMarks}) cannot exceed assignment total marks (${assignment.totalMarks})`,
      });
    }

    submission.marks = numMarks;
    submission.feedback = feedback ? feedback.trim() : '';
    submission.gradedAt = new Date();
    submission.status = 'evaluated';

    const gradedSubmission = await submission.save();

    try {
      const studentRecipientId = submission.student._id || submission.student;
      await createNotification({
        recipient: studentRecipientId,
        title: 'Assignment Evaluated',
        message: `Your submission for "${assignment.title}" (${assignment.subject}) has been evaluated. Marks: ${numMarks}/${assignment.totalMarks}.`,
        type: 'assignment',
        relatedId: assignment._id,
        relatedType: 'Assignment',
      });
    } catch (notifErr) {
      console.error('[SubmissionController] Notification warning:', notifErr.message);
    }

    const populatedSubmission = await Submission.findById(gradedSubmission._id)
      .populate('student', 'name email department profileInfo')
      .populate('assignment', 'title totalMarks subject department section');

    res.json({
      message: 'Submission evaluated successfully',
      submission: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure upload of assignment submission file (Supports multipart/form-data & base64)
// @route   POST /api/submissions/upload
// @access  Private (Student)
export const uploadSubmissionFile = async (req, res, next) => {
  try {
    // 1. Check if file was uploaded via multipart/form-data (multer)
    if (req.file) {
      const storedFileName = req.file.filename;
      const fileUrl = `/api/submissions/download/${storedFileName}`;
      return res.json({
        fileUrl,
        fileName: req.file.originalname.trim(),
        storedFileName,
      });
    }

    // 2. Base64 JSON payload fallback
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ message: 'File content payload or multipart file is required' });
    }

    const uploadDir = path.join(__dirname, '../uploads/submissions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storedFileName = `${uniquePrefix}_${safeBaseName}`;
    const filePath = path.join(uploadDir, storedFileName);

    const base64Data = fileData.replace(/^data:.*?;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/api/submissions/download/${storedFileName}`;
    res.json({
      fileUrl,
      fileName: fileName.trim(),
      storedFileName,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Securely download/view submission file
// @route   GET /api/submissions/download/:filename
// @access  Private (Student Owner, Creator Faculty, or Admin)
export const downloadSubmissionFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/submissions', path.basename(filename));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

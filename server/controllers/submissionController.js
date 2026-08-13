import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import { createNotification } from './notificationController.js';

// @desc    Submit assignment work (Student only)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res, next) => {
  try {
    const { content, fileUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if assignment is closed
    if (assignment.status === 'closed') {
      return res.status(400).json({ message: 'Assignment is closed for submissions' });
    }

    // Department match check
    if (assignment.department !== req.user.department) {
      return res.status(403).json({ message: 'Forbidden: You do not belong to the assignment department' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Submission content is required' });
    }

    // Deadline check: set status to 'late' if current time is after dueDate
    const isLate = new Date() > new Date(assignment.dueDate);
    const submissionStatus = isLate ? 'late' : 'submitted';

    let submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });

    if (submission) {
      // Update existing submission if student submits again before closed
      submission.content = content.trim();
      submission.fileUrl = fileUrl ? fileUrl.trim() : submission.fileUrl;
      submission.submittedAt = new Date();
      if (submission.status !== 'graded') {
        submission.status = submissionStatus;
      }
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: assignment._id,
        student: req.user._id,
        content: content.trim(),
        fileUrl: fileUrl ? fileUrl.trim() : '',
        submittedAt: new Date(),
        status: submissionStatus,
      });
    }

    // Notify student owner confirming submission
    await createNotification({
      recipient: req.user._id,
      title: 'Assignment Submitted',
      message: `Your submission for "${assignment.title}" has been submitted successfully.`,
      type: 'assignment',
      relatedId: assignment._id,
      relatedType: 'Assignment',
    });

    // Notify faculty creator about student submission
    if (assignment.faculty && assignment.faculty.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: assignment.faculty,
        title: 'New Assignment Submission',
        message: `Student "${req.user.name}" has submitted work for "${assignment.title}".`,
        type: 'assignment',
        relatedId: assignment._id,
        relatedType: 'Assignment',
      });
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email department profileInfo')
      .populate('assignment', 'title totalMarks dueDate');

    res.status(200).json({
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      submission: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Creator Faculty or Admin only)
export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Authorization: Only creator faculty or Admin can view all submissions
    const isCreator = assignment.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to view submissions for this assignment',
      });
    }

    const submissions = await Submission.find({ assignment: assignment._id })
      .populate('student', 'name email department profileInfo')
      .sort({ submittedAt: -1 });

    res.json({
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      totalMarks: assignment.totalMarks,
      count: submissions.length,
      submissions,
    });
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
      .populate('assignment', 'title description subject totalMarks dueDate faculty department');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Authorization check
    const isStudentOwner = submission.student._id.toString() === req.user._id.toString();
    const isFacultyCreator = submission.assignment.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isFacultyCreator && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Grade student submission with marks & feedback
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

    // Authorization check: Only assignment creator or Admin can grade
    const isCreator = assignment.faculty.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to grade this submission',
      });
    }

    // Marks validation
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
    submission.status = 'graded';

    const gradedSubmission = await submission.save();

    // Notify student whose submission was graded
    const studentRecipientId = submission.student._id || submission.student;
    await createNotification({
      recipient: studentRecipientId,
      title: 'Assignment Graded',
      message: `Your submission for "${assignment.title}" has been graded. Please check your feedback.`,
      type: 'assignment',
      relatedId: assignment._id,
      relatedType: 'Assignment',
    });

    const populatedSubmission = await Submission.findById(gradedSubmission._id)
      .populate('student', 'name email department profileInfo')
      .populate('assignment', 'title totalMarks');

    res.json({
      message: 'Submission graded successfully',
      submission: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

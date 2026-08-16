import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// @desc    Get Student Performance overview for Faculty / Admin
// @route   GET /api/faculty/performance
// @access  Private (Faculty/Admin)
export const getStudentPerformance = async (req, res, next) => {
  try {
    const { role, department } = req.user;
    const facultyId = req.user._id;

    // 1. Determine assignments scope for this faculty or department
    let assignmentQuery = {};
    if (role === 'faculty') {
      // Faculty accesses assignments created by them OR in their department
      assignmentQuery = {
        $or: [{ faculty: facultyId }, { department: department }],
      };
    }

    const assignments = await Assignment.find(assignmentQuery).select('_id title subject totalMarks department faculty');
    const assignmentIds = assignments.map((a) => a._id);

    // Build assignment lookup map for total marks calculation
    const assignmentMap = new Map();
    assignments.forEach((a) => {
      assignmentMap.set(a._id.toString(), a.totalMarks || 100);
    });

    const totalAssignmentsCount = assignments.length;

    const escapeRegex = (text) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // 2. Fetch students authorized for this faculty/department scope
    let studentQuery = { role: 'student' };
    if (role === 'faculty') {
      const dept = department ? department.trim() : 'Computer Science';
      studentQuery.department = new RegExp(`^${escapeRegex(dept)}$`, 'i');
    } else if (role === 'admin' && req.query.department && req.query.department !== 'all') {
      const dept = req.query.department.trim();
      studentQuery.department = new RegExp(`^${escapeRegex(dept)}$`, 'i');
    }

    // Optional Search Filter (by student name, email, department, or rollNumber)
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      const searchOr = [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { 'profileInfo.rollNumber': searchRegex },
      ];

      if (studentQuery.$or) {
        studentQuery = {
          $and: [{ role: 'student' }, { $or: studentQuery.$or }, { $or: searchOr }],
        };
      } else {
        studentQuery.$or = searchOr;
      }
    }


    const students = await User.find(studentQuery).select('-password').sort({ name: 1 });
    const studentIds = students.map((s) => s._id);

    // 3. Fetch all submissions for these students against the relevant assignments
    const submissions = await Submission.find({
      student: { $in: studentIds },
      assignment: { $in: assignmentIds },
    });

    // Group submissions by student ID
    const studentSubmissionsMap = new Map();
    submissions.forEach((sub) => {
      const key = sub.student.toString();
      if (!studentSubmissionsMap.has(key)) {
        studentSubmissionsMap.set(key, []);
      }
      studentSubmissionsMap.get(key).push(sub);
    });

    // 4. Calculate real performance metrics per student
    let performanceList = students.map((student) => {
      const sId = student._id.toString();
      const studentSubs = studentSubmissionsMap.get(sId) || [];

      // Completed assignments (submitted, graded, or late)
      const completedCount = studentSubs.length;
      const pendingCount = Math.max(0, totalAssignmentsCount - completedCount);

      // Marks calculation
      let totalMarksEarned = 0;
      let totalMarksPossible = 0;

      studentSubs.forEach((sub) => {
        const possible = assignmentMap.get(sub.assignment.toString()) || 100;
        totalMarksEarned += sub.marks || 0;
        totalMarksPossible += possible;
      });

      const averageMarks = completedCount > 0 ? (totalMarksEarned / completedCount).toFixed(1) : 0;
      const averagePercentage = totalMarksPossible > 0
        ? Number(((totalMarksEarned / totalMarksPossible) * 100).toFixed(1))
        : 0;

      const submissionRate = totalAssignmentsCount > 0
        ? Number(((completedCount / totalAssignmentsCount) * 100).toFixed(1))
        : 0;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        rollNumber: student.profileInfo?.rollNumber || 'N/A',
        totalAssignments: totalAssignmentsCount,
        completedAssignments: completedCount,
        pendingAssignments: pendingCount,
        averageMarks: Number(averageMarks),
        averagePercentage,
        submissionRate,
      };
    });

    // 5. Apply Sorting
    const sortBy = req.query.sortBy || 'name';
    if (sortBy === 'highest_marks') {
      performanceList.sort((a, b) => b.averagePercentage - a.averagePercentage);
    } else if (sortBy === 'lowest_marks') {
      performanceList.sort((a, b) => a.averagePercentage - b.averagePercentage);
    } else if (sortBy === 'highest_submission') {
      performanceList.sort((a, b) => b.submissionRate - a.submissionRate);
    } else if (sortBy === 'lowest_submission') {
      performanceList.sort((a, b) => a.submissionRate - b.submissionRate);
    }

    res.json({
      totalStudents: performanceList.length,
      totalAssignments: totalAssignmentsCount,
      students: performanceList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed assignment-by-assignment performance for a single student
// @route   GET /api/faculty/performance/student/:studentId
// @access  Private (Faculty/Admin)
export const getStudentPerformanceDetails = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Determine relevant assignments scope
    let assignmentQuery = {};
    if (req.user.role === 'faculty') {
      assignmentQuery = {
        $or: [{ faculty: req.user._id }, { department: req.user.department }],
      };
    }

    const assignments = await Assignment.find(assignmentQuery)
      .populate('faculty', 'name email department')
      .sort({ dueDate: -1 });

    const assignmentIds = assignments.map((a) => a._id);

    // Fetch student's submissions for these assignments
    const submissions = await Submission.find({
      student: studentId,
      assignment: { $in: assignmentIds },
    });

    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.assignment.toString(), sub);
    });

    let totalMarksEarned = 0;
    let totalPossibleMarks = 0;
    let submittedCount = 0;
    let gradedCount = 0;

    const assignmentBreakdown = assignments.map((assignment) => {
      const sub = submissionMap.get(assignment._id.toString());
      const isSubmitted = Boolean(sub);

      if (isSubmitted) {
        submittedCount += 1;
        if (sub.status === 'graded') {
          gradedCount += 1;
        }
        totalMarksEarned += sub.marks || 0;
        totalPossibleMarks += assignment.totalMarks || 100;
      }

      return {
        _id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        department: assignment.department,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks || 100,
        status: isSubmitted ? sub.status : 'pending',
        submittedAt: isSubmitted ? sub.submittedAt : null,
        marksObtained: isSubmitted ? sub.marks : null,
        feedback: isSubmitted ? sub.feedback : '',
        facultyName: assignment.faculty?.name || 'Faculty',
      };
    });

    const totalCount = assignments.length;
    const pendingCount = Math.max(0, totalCount - submittedCount);
    const overallPercentage = totalPossibleMarks > 0
      ? Number(((totalMarksEarned / totalPossibleMarks) * 100).toFixed(1))
      : 0;

    const submissionRate = totalCount > 0
      ? Number(((submittedCount / totalCount) * 100).toFixed(1))
      : 0;

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        rollNumber: student.profileInfo?.rollNumber || 'N/A',
        createdAt: student.createdAt,
      },
      summary: {
        totalAssignments: totalCount,
        submittedAssignments: submittedCount,
        pendingAssignments: pendingCount,
        gradedAssignments: gradedCount,
        totalMarksEarned,
        totalPossibleMarks,
        overallPercentage,
        submissionRate,
      },
      assignments: assignmentBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

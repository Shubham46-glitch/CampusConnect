import User from '../models/User.js';
import Event from '../models/Event.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Complaint from '../models/Complaint.js';
import Announcement from '../models/Announcement.js';

// @desc    Get Student Dashboard Statistics & Data
// @route   GET /api/dashboard/student
// @access  Private (Student only)
export const getStudentDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const studentDepartment = req.user.department || 'Computer Science';
    const now = new Date(new Date().setHours(0, 0, 0, 0));

    // 1. Upcoming Events (future or today's date, not cancelled)
    const upcomingEventsCount = await Event.countDocuments({
      status: { $ne: 'cancelled' },
      date: { $gte: now },
    });

    // 2. Registered Events (student ID in participants array)
    const registeredEventsCount = await Event.countDocuments({
      participants: studentId,
    });

    // 3. Active Assignments for student's department
    const activeAssignments = await Assignment.find({
      department: studentDepartment,
      status: 'active',
    }).select('_id title subject dueDate faculty totalMarks department');

    const activeAssignmentsCount = activeAssignments.length;

    // 4. Pending Assignments (active assignments not yet submitted by student)
    const activeAssignmentIds = activeAssignments.map((a) => a._id);

    const submittedAssignmentIds = await Submission.find({
      student: studentId,
      assignment: { $in: activeAssignmentIds },
    }).distinct('assignment');

    const submittedIdsSet = new Set(submittedAssignmentIds.map((id) => id.toString()));

    const pendingAssignmentsList = activeAssignments
      .filter((a) => !submittedIdsSet.has(a._id.toString()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const pendingAssignmentsCount = pendingAssignmentsList.length;

    // 5. My Complaints (submitted by req.user._id)
    const myComplaintsCount = await Complaint.countDocuments({
      submittedBy: studentId,
    });

    // 6. Pending/In-Progress Complaints
    const pendingComplaintsCount = await Complaint.countDocuments({
      submittedBy: studentId,
      status: { $in: ['pending', 'in_progress'] },
    });

    // Recent announcements for student
    const recentAnnouncements = await Announcement.find({
      status: 'published',
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetAudience: 'department', department: studentDepartment },
      ],
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .populate('publishedBy', 'name role department');

    // Recent upcoming events for student preview
    const upcomingEventsList = await Event.find({
      status: { $ne: 'cancelled' },
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .limit(5)
      .populate('createdBy', 'name email department');

    // Student's recent complaints
    const recentComplaints = await Complaint.find({
      submittedBy: studentId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      upcomingEvents: upcomingEventsCount,
      registeredEvents: registeredEventsCount,
      activeAssignments: activeAssignmentsCount,
      pendingAssignments: pendingAssignmentsCount,
      myComplaints: myComplaintsCount,
      pendingComplaints: pendingComplaintsCount,
      announcementsCount: recentAnnouncements.length,
      recentAnnouncements,
      pendingAssignmentsList: pendingAssignmentsList.slice(0, 5),
      upcomingEventsList,
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Faculty Dashboard Statistics & Data
// @route   GET /api/dashboard/faculty
// @access  Private (Faculty only)
export const getFacultyDashboardStats = async (req, res, next) => {
  try {
    const facultyId = req.user._id;
    const facultyDepartment = req.user.department;

    // 1. Events Created by faculty
    const eventsCreatedCount = await Event.countDocuments({
      createdBy: facultyId,
    });

    // 2. Active Assignments created by faculty
    const activeAssignmentsCount = await Assignment.countDocuments({
      faculty: facultyId,
      status: 'active',
    });

    // Fetch all assignment IDs belonging to this faculty for submission calculations
    const facultyAssignments = await Assignment.find({
      faculty: facultyId,
    }).select('_id title subject department status dueDate');

    const facultyAssignmentIds = facultyAssignments.map((a) => a._id);

    // 3. Total Student Submissions for faculty's assignments
    const totalSubmissionsCount = await Submission.countDocuments({
      assignment: { $in: facultyAssignmentIds },
    });

    // 4. Pending Grading (submissions awaiting grading, i.e. status is submitted or late)
    const pendingGradingCount = await Submission.countDocuments({
      assignment: { $in: facultyAssignmentIds },
      status: { $in: ['submitted', 'late'] },
    });

    // 5. Announcements Published by faculty
    const announcementsPublishedCount = await Announcement.countDocuments({
      publishedBy: facultyId,
    });

    // 6. Department / Assigned Complaints count requiring attention
    const studentComplaintsCount = await Complaint.countDocuments({
      $or: [
        { department: facultyDepartment },
        { assignedTo: facultyId },
      ],
      status: { $in: ['pending', 'in_progress'] },
    });

    // Recent announcements published by faculty
    const recentAnnouncements = await Announcement.find({
      publishedBy: facultyId,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5);

    // Recent assignments created by faculty
    const recentAssignments = await Assignment.find({
      faculty: facultyId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent ungraded submissions for faculty action
    const pendingSubmissionsList = await Submission.find({
      assignment: { $in: facultyAssignmentIds },
      status: { $in: ['submitted', 'late'] },
    })
      .populate('assignment', 'title subject')
      .populate('student', 'name email rollNumber department')
      .sort({ submittedAt: -1 })
      .limit(5);

    res.json({
      eventsCreated: eventsCreatedCount,
      activeAssignments: activeAssignmentsCount,
      totalSubmissions: totalSubmissionsCount,
      pendingGrading: pendingGradingCount,
      announcementsPublished: announcementsPublishedCount,
      studentComplaints: studentComplaintsCount,
      recentAnnouncements,
      recentAssignments,
      pendingSubmissionsList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Statistics & Data
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    // MongoDB count operations for platform-wide statistics
    const [
      totalStudents,
      totalFaculty,
      totalUsers,
      totalEvents,
      activeAssignments,
      totalAnnouncements,
      pendingComplaints,
      resolvedComplaints,
      inProgressComplaints,
      totalComplaints,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments(),
      Event.countDocuments(),
      Assignment.countDocuments({ status: 'active' }),
      Announcement.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments(),
    ]);

    // Recent registered users (without passwords)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent complaints system-wide
    const recentComplaints = await Complaint.find()
      .populate('submittedBy', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents,
      totalFaculty,
      totalUsers,
      totalEvents,
      activeAssignments,
      totalAnnouncements,
      pendingComplaints,
      resolvedComplaints,
      inProgressComplaints,
      totalComplaints,
      recentUsers,
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};

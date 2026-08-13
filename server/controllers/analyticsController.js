import User from '../models/User.js';
import Event from '../models/Event.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Complaint from '../models/Complaint.js';
import Announcement from '../models/Announcement.js';

// @desc    Get Analytics Overview metrics
// @route   GET /api/analytics/overview
// @access  Private/Admin
export const getAnalyticsOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalEvents = await Event.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();

    return res.status(200).json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalEvents,
      totalAssignments,
      totalComplaints,
      totalAnnouncements,
    });
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return res.status(500).json({ message: 'Server error fetching analytics overview' });
  }
};

// @desc    Get Students count grouped by Department via MongoDB Aggregation
// @route   GET /api/analytics/students-by-department
// @access  Private/Admin
export const getStudentsByDepartment = async (req, res) => {
  try {
    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: { $ifNull: ['$department', 'Unspecified'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const formattedData = departmentStats.map((item) => ({
      department: item._id || 'General',
      count: item.count,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Students by Department Analytics Error:', error);
    return res.status(500).json({ message: 'Server error fetching department statistics' });
  }
};

// @desc    Get Event Participation Stats via MongoDB Aggregation
// @route   GET /api/analytics/events
// @access  Private/Admin
export const getEventParticipation = async (req, res) => {
  try {
    const eventStats = await Event.aggregate([
      {
        $project: {
          title: 1,
          capacity: { $ifNull: ['$capacity', 0] },
          registeredCount: { $size: { $ifNull: ['$registeredStudents', []] } },
        },
      },
      { $sort: { registeredCount: -1 } },
      { $limit: 8 },
    ]);

    return res.status(200).json(eventStats);
  } catch (error) {
    console.error('Event Analytics Error:', error);
    return res.status(500).json({ message: 'Server error fetching event participation analytics' });
  }
};

// @desc    Get Assignment Submission Status Distribution via MongoDB Aggregation
// @route   GET /api/analytics/assignments
// @access  Private/Admin
export const getAssignmentSubmissionStats = async (req, res) => {
  try {
    const totalAssignments = await Assignment.countDocuments();
    const submissionStats = await Submission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {
      submitted: 0,
      graded: 0,
      late: 0,
    };

    submissionStats.forEach((item) => {
      if (item._id && statsMap.hasOwnProperty(item._id)) {
        statsMap[item._id] = item.count;
      }
    });

    return res.status(200).json({
      totalAssignments,
      submissions: statsMap,
      rawGroup: submissionStats,
    });
  } catch (error) {
    console.error('Assignment Analytics Error:', error);
    return res.status(500).json({ message: 'Server error fetching assignment submission statistics' });
  }
};

// @desc    Get Complaint Status Distribution via MongoDB Aggregation
// @route   GET /api/analytics/complaints
// @access  Private/Admin
export const getComplaintStatusStats = async (req, res) => {
  try {
    const complaintStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedMap = {
      pending: 0,
      'in-progress': 0,
      resolved: 0,
      rejected: 0,
    };

    complaintStats.forEach((item) => {
      if (item._id && formattedMap.hasOwnProperty(item._id)) {
        formattedMap[item._id] = item.count;
      }
    });

    return res.status(200).json({
      summary: formattedMap,
      rawGroup: complaintStats,
    });
  } catch (error) {
    console.error('Complaint Analytics Error:', error);
    return res.status(500).json({ message: 'Server error fetching complaint status statistics' });
  }
};

// @desc    Get User Role Distribution via MongoDB Aggregation
// @route   GET /api/analytics/user-distribution
// @access  Private/Admin
export const getUserRoleDistribution = async (req, res) => {
  try {
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedData = roleStats.map((item) => ({
      role: item._id,
      count: item.count,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('User Distribution Analytics Error:', error);
    return res.status(500).json({ message: 'Server error fetching user distribution statistics' });
  }
};

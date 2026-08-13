import Event from '../models/Event.js';
import Announcement from '../models/Announcement.js';
import Assignment from '../models/Assignment.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Global Search across Events, Announcements, Assignments, Complaints, Users
// @route   GET /api/search?q=<query>
// @access  Private (Authenticated Users, RBAC enforced)
export const globalSearch = async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';

    if (!query || query.length < 2) {
      return res.status(200).json({
        query: '',
        results: {
          events: [],
          announcements: [],
          assignments: [],
          complaints: [],
          users: [],
        },
      });
    }

    const regex = new RegExp(query, 'i');
    const userRole = req.user.role;
    const userId = req.user._id;

    // 1. Search Events
    const events = await Event.find({
      $or: [{ title: regex }, { description: regex }, { category: regex }],
    })
      .select('title category date venue')
      .limit(5);

    // 2. Search Announcements
    const announcements = await Announcement.find({
      $or: [{ title: regex }, { content: regex }],
    })
      .select('title priority createdAt targetRole')
      .limit(5);

    // Filter announcements by targetRole
    const filteredAnnouncements = announcements.filter((a) => {
      if (!a.targetRole || a.targetRole === 'all') return true;
      return a.targetRole === userRole;
    });

    // 3. Search Assignments
    const assignments = await Assignment.find({
      $or: [{ title: regex }, { description: regex }, { subject: regex }],
    })
      .select('title subject dueDate totalMarks')
      .limit(5);

    // 4. Search Complaints (RBAC enforced)
    let complaints = [];
    if (userRole === 'student') {
      complaints = await Complaint.find({
        student: userId,
        $or: [{ title: regex }, { description: regex }, { category: regex }],
      })
        .select('title status category createdAt')
        .limit(5);
    } else {
      complaints = await Complaint.find({
        $or: [{ title: regex }, { description: regex }, { category: regex }],
      })
        .select('title status category createdAt student')
        .populate('student', 'name department')
        .limit(5);
    }

    // 5. Search Users (ONLY Admin and Faculty allowed)
    let users = [];
    if (userRole === 'admin' || userRole === 'faculty') {
      users = await User.find({
        $or: [{ name: regex }, { email: regex }, { department: regex }],
      })
        .select('name email role department')
        .limit(5);
    }

    return res.status(200).json({
      query,
      results: {
        events,
        announcements: filteredAnnouncements,
        assignments,
        complaints,
        users,
      },
    });
  } catch (error) {
    console.error('Global Search Error:', error);
    return res.status(500).json({ message: 'Server error performing global search' });
  }
};

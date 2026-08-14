import ActivityLog from '../models/ActivityLog.js';

// @desc    Get system activity audit logs (Admin only)
// @route   GET /api/admin/logs
// @access  Private (Admin only)
export const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = {};

    // Action filter
    if (req.query.action && req.query.action !== 'all') {
      query.action = req.query.action;
    }

    // Search filter across details
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.details = searchRegex;
    }

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('performedBy', 'name email role department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

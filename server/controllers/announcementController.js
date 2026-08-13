import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get announcements for authenticated user based on role, department, and expiration
// @route   GET /api/announcements
// @access  Private (All authenticated users)
export const getAnnouncements = async (req, res, next) => {
  try {
    // 1. Expiration check: Automatically mark past announcements as expired
    await Announcement.updateMany(
      { expiresAt: { $lt: new Date() }, status: 'published' },
      { status: 'expired' }
    );

    const { role, department } = req.user;
    const includeExpired = req.query.includeExpired === 'true';

    // 2. Build role-based visibility query
    let visibilityQuery = {};

    if (role === 'student') {
      visibilityQuery = {
        $or: [
          { targetAudience: { $in: ['all', 'students'] } },
          { targetAudience: 'department', department: department },
        ],
      };
    } else if (role === 'faculty') {
      visibilityQuery = {
        $or: [
          { targetAudience: { $in: ['all', 'faculty'] } },
          { targetAudience: 'department', department: department },
        ],
      };
    } // Admin sees all announcements by default

    // Exclude expired announcements unless explicitly requested or for Admin
    if (!includeExpired && role !== 'admin') {
      visibilityQuery.status = { $ne: 'expired' };
    }

    const announcements = await Announcement.find(visibilityQuery)
      .populate('publishedBy', 'name email role department')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Private (All authenticated users)
export const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('publishedBy', 'name email role department profileInfo');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Role-based visibility check for single announcement
    const { role, department } = req.user;
    const isCreator = announcement.publishedBy?._id?.toString() === req.user._id.toString();
    const isAdmin = role === 'admin';

    if (!isCreator && !isAdmin) {
      if (role === 'student' && !['all', 'students'].includes(announcement.targetAudience) && announcement.department !== department) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to view this announcement' });
      }
      if (role === 'faculty' && !['all', 'faculty'].includes(announcement.targetAudience) && announcement.department !== department) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to view this announcement' });
      }
    }

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Faculty/Admin)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetAudience, department, expiresAt, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide announcement title and content' });
    }

    if (targetAudience === 'department' && !department) {
      return res.status(400).json({ message: 'Department is required when target audience is set to department' });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      department: targetAudience === 'department' ? department.trim() : (department || ''),
      publishedBy: req.user._id, // Set automatically from authenticated user
      publishedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      status: status || 'published',
    });

    // Notify target audience
    let targetUsers = [];
    if (announcement.targetAudience === 'all') {
      targetUsers = await User.find({ _id: { $ne: req.user._id } }).select('_id');
    } else if (announcement.targetAudience === 'students') {
      targetUsers = await User.find({ role: 'student', _id: { $ne: req.user._id } }).select('_id');
    } else if (announcement.targetAudience === 'faculty') {
      targetUsers = await User.find({ role: 'faculty', _id: { $ne: req.user._id } }).select('_id');
    } else if (announcement.targetAudience === 'department') {
      targetUsers = await User.find({ department: announcement.department, _id: { $ne: req.user._id } }).select('_id');
    }

    for (const u of targetUsers) {
      await createNotification({
        recipient: u._id,
        title: 'New Announcement',
        message: `A new announcement "${title.trim()}" has been published.`,
        type: 'announcement',
        relatedId: announcement._id,
        relatedType: 'Announcement',
      });
    }

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      'publishedBy',
      'name email role department'
    );

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Creator Faculty or Admin only)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Ownership check: Only creator or admin can update
    const isCreator = announcement.publishedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to update this announcement',
      });
    }

    announcement.title = req.body.title ? req.body.title.trim() : announcement.title;
    announcement.content = req.body.content ? req.body.content.trim() : announcement.content;
    announcement.category = req.body.category || announcement.category;
    announcement.priority = req.body.priority || announcement.priority;
    announcement.targetAudience = req.body.targetAudience || announcement.targetAudience;
    announcement.department = req.body.department || announcement.department;
    announcement.status = req.body.status || announcement.status;
    if (req.body.expiresAt !== undefined) {
      announcement.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    }

    const updatedAnnouncement = await announcement.save();
    const populatedAnnouncement = await Announcement.findById(updatedAnnouncement._id).populate(
      'publishedBy',
      'name email role department'
    );

    res.json(populatedAnnouncement);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Creator Faculty or Admin only)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Ownership check: Only creator or admin can delete
    const isCreator = announcement.publishedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to delete this announcement',
      });
    }

    await Announcement.deleteOne({ _id: announcement._id });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

import Notification from '../models/Notification.js';

// Helper function to create notification without throwing unhandled exceptions
export const createNotification = async ({ recipient, title, message, type = 'system', relatedId = null, relatedType = '' }) => {
  try {
    if (!recipient || !title || !message) return null;
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedId,
      relatedType,
    });
  } catch (error) {
    console.error('Failed to create notification helper:', error.message);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read or PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Ownership check: Notification recipient must match authenticated user ID
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot access another user notification' });
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ message: 'Notification marked as read', notification, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all or PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    next(error);
  }
};

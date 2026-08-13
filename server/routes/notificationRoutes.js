import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);

// Support both PATCH and PUT for marking as read
router.patch('/read-all', protect, markAllAsRead);
router.put('/read-all', protect, markAllAsRead);

router.patch('/:id/read', protect, markAsRead);
router.put('/:id/read', protect, markAsRead);

export default router;

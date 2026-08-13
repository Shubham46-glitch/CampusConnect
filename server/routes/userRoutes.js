import express from 'express';
import {
  getUsers,
  getStudents,
  getFaculty,
  getUserById,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only roster endpoints
router.get('/students', protect, authorizeRoles('admin'), getStudents);
router.get('/faculty', protect, authorizeRoles('admin'), getFaculty);

// Admin-only user management
router.get('/', protect, authorizeRoles('admin'), getUsers);
router.put('/profile', protect, updateUserProfile);

router.route('/:id')
  .get(protect, authorizeRoles('admin'), getUserById)
  .delete(protect, authorizeRoles('admin'), deleteUser);

router.patch('/:id/status', protect, authorizeRoles('admin'), updateUserStatus);

export default router;

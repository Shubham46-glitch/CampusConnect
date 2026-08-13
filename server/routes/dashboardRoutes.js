import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getStudentDashboardStats,
  getFacultyDashboardStats,
  getAdminDashboardStats,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Role-protected dashboard endpoints
router.get('/student', protect, authorizeRoles('student'), getStudentDashboardStats);
router.get('/faculty', protect, authorizeRoles('faculty'), getFacultyDashboardStats);
router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboardStats);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getFacultyMySubjects,
  getStudentsForSession,
  recordAttendanceSession,
  getFacultyAttendanceHistory,
  getSessionDetails,
  updateAttendanceSession,
  getStudentMyAttendance,
  getAdminAttendanceAnalytics,
} from '../controllers/attendanceController.js';

const router = express.Router();

// Faculty routes
router.get('/faculty/my-subjects', protect, requireRole('faculty'), getFacultyMySubjects);
router.get('/faculty/session-students', protect, requireRole('faculty'), getStudentsForSession);
router.post('/session', protect, requireRole('faculty'), recordAttendanceSession);
router.get('/faculty/history', protect, requireRole('faculty'), getFacultyAttendanceHistory);

// Shared session detail & update routes (Faculty & Admin)
router.route('/session/:sessionId')
  .get(protect, getSessionDetails)
  .put(protect, requireRole('faculty', 'admin'), updateAttendanceSession);

// Student route
router.get('/student/my-attendance', protect, requireRole('student'), getStudentMyAttendance);

// Admin route
router.get('/admin/analytics', protect, requireRole('admin'), getAdminAttendanceAnalytics);

export default router;

import express from 'express';
import {
  getAnalyticsOverview,
  getStudentsByDepartment,
  getEventParticipation,
  getAssignmentSubmissionStats,
  getComplaintStatusStats,
  getUserRoleDistribution,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply protection & admin role check to all analytics endpoints
router.use(protect, authorizeRoles('admin'));

router.get('/overview', getAnalyticsOverview);
router.get('/students-by-department', getStudentsByDepartment);
router.get('/events', getEventParticipation);
router.get('/assignments', getAssignmentSubmissionStats);
router.get('/complaints', getComplaintStatusStats);
router.get('/user-distribution', getUserRoleDistribution);

export default router;

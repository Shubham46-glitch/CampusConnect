import express from 'express';
import {
  getStudentPerformance,
  getStudentPerformanceDetails,
} from '../controllers/performanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('faculty', 'admin'), getStudentPerformance);
router.get('/student/:studentId', protect, authorizeRoles('faculty', 'admin'), getStudentPerformanceDetails);

export default router;

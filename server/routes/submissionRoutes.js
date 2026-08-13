import express from 'express';
import {
  getSubmissionById,
  gradeSubmission,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/:id')
  .get(protect, getSubmissionById);

router.route('/:id/grade')
  .put(protect, authorizeRoles('faculty', 'admin'), gradeSubmission);

export default router;

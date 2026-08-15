import express from 'express';
import {
  getSubmissionById,
  gradeSubmission,
  getMySubmissions,
  uploadSubmissionFile,
  downloadSubmissionFile,
  handleMulterUpload,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/my')
  .get(protect, authorizeRoles('student'), getMySubmissions);

router.route('/upload')
  .post(protect, authorizeRoles('student'), handleMulterUpload('file'), uploadSubmissionFile);

router.route('/download/:filename')
  .get(downloadSubmissionFile);

router.route('/:id')
  .get(protect, getSubmissionById);

router.route('/:id/grade')
  .put(protect, authorizeRoles('faculty', 'admin'), gradeSubmission);

router.route('/:id/evaluate')
  .put(protect, authorizeRoles('faculty', 'admin'), gradeSubmission);

export default router;

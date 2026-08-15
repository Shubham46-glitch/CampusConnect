import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import {
  submitAssignment,
  getAssignmentSubmissions,
  handleMulterUpload,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAssignments)
  .post(protect, authorizeRoles('faculty', 'admin'), createAssignment);

router.route('/:id')
  .get(protect, getAssignmentById)
  .put(protect, authorizeRoles('faculty', 'admin'), updateAssignment)
  .delete(protect, authorizeRoles('faculty', 'admin'), deleteAssignment);

router.route('/:id/submit')
  .post(protect, authorizeRoles('student'), handleMulterUpload('file'), submitAssignment);

router.route('/:id/submissions')
  .get(protect, authorizeRoles('faculty', 'admin'), getAssignmentSubmissions);

export default router;

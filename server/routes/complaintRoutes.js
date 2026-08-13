import express from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  updateComplaintStatus,
  assignComplaint,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getComplaints)
  .post(protect, authorizeRoles('student'), createComplaint);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, updateComplaint)
  .delete(protect, deleteComplaint);

router.route('/:id/status')
  .put(protect, authorizeRoles('admin'), updateComplaintStatus);

router.route('/:id/assign')
  .put(protect, authorizeRoles('admin'), assignComplaint);

export default router;

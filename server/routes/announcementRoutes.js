import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAnnouncements)
  .post(protect, authorizeRoles('faculty', 'admin'), createAnnouncement);

router.route('/:id')
  .get(protect, getAnnouncementById)
  .put(protect, authorizeRoles('faculty', 'admin'), updateAnnouncement)
  .delete(protect, authorizeRoles('faculty', 'admin'), deleteAnnouncement);

export default router;

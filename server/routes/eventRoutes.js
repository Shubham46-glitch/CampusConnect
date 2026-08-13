import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorizeRoles('faculty', 'admin'), createEvent);

router.route('/:id')
  .get(protect, getEventById)
  .put(protect, authorizeRoles('faculty', 'admin'), updateEvent)
  .delete(protect, authorizeRoles('faculty', 'admin'), deleteEvent);

router.route('/:id/registrations')
  .get(protect, authorizeRoles('faculty', 'admin'), getEventRegistrations);

router.route('/:id/register')
  .post(protect, authorizeRoles('student'), registerForEvent)
  .delete(protect, authorizeRoles('student'), cancelRegistration);

export default router;

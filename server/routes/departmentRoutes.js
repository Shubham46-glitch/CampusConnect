import express from 'express';
import { getDepartments } from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDepartments);

export default router;

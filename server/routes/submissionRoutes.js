import express from 'express';
import {
  getSubmissionById,
  gradeSubmission,
  getMySubmissions,
  uploadSubmissionFile,
  downloadSubmissionFile,
  multerUpload,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/my')
  .get(protect, authorizeRoles('student'), getMySubmissions);

router.route('/upload')
  .post(protect, authorizeRoles('student'), (req, res, next) => {
    multerUpload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size limit exceeded. Max 35MB allowed.' });
        }
        console.warn('[Multer Warning] Continuing to fallback handler:', err.message);
      }
      uploadSubmissionFile(req, res, next);
    });
  });

router.route('/download/:filename')
  .get(protect, downloadSubmissionFile);

router.route('/:id')
  .get(protect, getSubmissionById);

router.route('/:id/grade')
  .put(protect, authorizeRoles('faculty', 'admin'), gradeSubmission);

router.route('/:id/evaluate')
  .put(protect, authorizeRoles('faculty', 'admin'), gradeSubmission);

export default router;

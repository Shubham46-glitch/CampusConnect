import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAcademicClasses,
  getFacultyDepartmentClasses,
  createAcademicClass,
  updateAcademicClass,
  deleteAcademicClass,
  getSubjects,
  createSubject,
  createSubjectByFaculty,
  updateSubject,
  deleteSubject,
  getFacultyAssignments,
  createFacultyAssignment,
  deleteFacultyAssignment,
  getStudentEnrollments,
  enrollStudent,
  deleteStudentEnrollment,
  getPublicDepartments,
  getPublicClassesByDepartment,
} from '../controllers/academicController.js';

const router = express.Router();

// Public routes for registration UI
router.get('/public-departments', getPublicDepartments);
router.get('/public-classes', getPublicClassesByDepartment);

// Faculty Subject & Scoped Classes Routes
router.post('/faculty-subjects', protect, requireRole('faculty', 'admin'), createSubjectByFaculty);
router.get('/faculty-classes', protect, requireRole('faculty', 'admin'), getFacultyDepartmentClasses);

// Department routes
router.route('/departments')
  .get(protect, getDepartments)
  .post(protect, requireRole('admin'), createDepartment);
router.route('/departments/:id')
  .put(protect, requireRole('admin'), updateDepartment)
  .delete(protect, requireRole('admin'), deleteDepartment);

// Academic Class routes
router.route('/classes')
  .get(protect, getAcademicClasses)
  .post(protect, requireRole('admin'), createAcademicClass);
router.route('/classes/:id')
  .put(protect, requireRole('admin'), updateAcademicClass)
  .delete(protect, requireRole('admin'), deleteAcademicClass);

// Subject routes
router.route('/subjects')
  .get(protect, getSubjects)
  .post(protect, requireRole('admin'), createSubject);
router.route('/subjects/:id')
  .put(protect, requireRole('admin'), updateSubject)
  .delete(protect, requireRole('admin'), deleteSubject);

// Faculty Assignment routes
router.route('/faculty-assignments')
  .get(protect, getFacultyAssignments)
  .post(protect, requireRole('admin'), createFacultyAssignment);
router.route('/faculty-assignments/:id')
  .delete(protect, requireRole('admin'), deleteFacultyAssignment);

// Student Enrollment routes
router.route('/enrollments')
  .get(protect, getStudentEnrollments)
  .post(protect, requireRole('admin'), enrollStudent);
router.route('/enrollments/:id')
  .delete(protect, requireRole('admin'), deleteStudentEnrollment);

export default router;

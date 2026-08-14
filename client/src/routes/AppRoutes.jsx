import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuth from '../hooks/useAuth';

// Auth & General Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import StudentDashboard from '../pages/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AnalyticsPage from '../pages/AnalyticsPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import StudentPerformancePage from '../pages/faculty/StudentPerformancePage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';

// Events Pages
import EventsPage from '../pages/events/EventsPage';
import EventDetailsPage from '../pages/events/EventDetailsPage';
import CreateEventPage from '../pages/events/CreateEventPage';
import EditEventPage from '../pages/events/EditEventPage';

// Announcements Pages
import AnnouncementsPage from '../pages/announcements/AnnouncementsPage';
import AnnouncementDetailsPage from '../pages/announcements/AnnouncementDetailsPage';
import CreateAnnouncementPage from '../pages/announcements/CreateAnnouncementPage';
import EditAnnouncementPage from '../pages/announcements/EditAnnouncementPage';

// Assignments Pages
import AssignmentsPage from '../pages/assignments/AssignmentsPage';
import AssignmentDetailsPage from '../pages/assignments/AssignmentDetailsPage';
import CreateAssignmentPage from '../pages/assignments/CreateAssignmentPage';
import EditAssignmentPage from '../pages/assignments/EditAssignmentPage';
import AssignmentSubmissionsPage from '../pages/assignments/AssignmentSubmissionsPage';

// Complaints Pages
import ComplaintsPage from '../pages/complaints/ComplaintsPage';
import ComplaintDetailsPage from '../pages/complaints/ComplaintDetailsPage';
import CreateComplaintPage from '../pages/complaints/CreateComplaintPage';
import EditComplaintPage from '../pages/complaints/EditComplaintPage';
import AdminComplaintsPage from '../pages/complaints/AdminComplaintsPage';

import DepartmentManagementPage from '../pages/admin/DepartmentManagementPage';
import FacultyManagementPage from '../pages/admin/FacultyManagementPage';
import StudentManagementPage from '../pages/admin/StudentManagementPage';
import ActivityLogsPage from '../pages/admin/ActivityLogsPage';

// Attendance & Academic Hierarchy Pages
import StudentAttendancePage from '../pages/student/StudentAttendancePage';
import FacultySubjectsPage from '../pages/faculty/FacultySubjectsPage';
import TakeAttendancePage from '../pages/faculty/TakeAttendancePage';
import FacultyAttendanceHistoryPage from '../pages/faculty/FacultyAttendanceHistoryPage';
import ClassManagementPage from '../pages/admin/ClassManagementPage';
import SubjectManagementPage from '../pages/admin/SubjectManagementPage';
import FacultyAssignmentPage from '../pages/admin/FacultyAssignmentPage';
import StudentEnrollmentPage from '../pages/admin/StudentEnrollmentPage';
import AdminAttendanceAnalyticsPage from '../pages/admin/AdminAttendanceAnalyticsPage';

// Helper component to handle generic /dashboard URL redirect based on authenticated user role
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleMap = {
    student: '/student/dashboard',
    faculty: '/faculty/dashboard',
    admin: '/admin/dashboard',
  };
  return <Navigate to={roleMap[user.role] || '/student/dashboard'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
      </Route>

      {/* Generic Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Shared Protected View Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'faculty', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/announcements/:id" element={<AnnouncementDetailsPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
        </Route>
      </Route>

      {/* Student & Faculty Assignments Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'faculty']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetailsPage />} />
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/events" element={<EventsPage />} />
          <Route path="/student/announcements" element={<AnnouncementsPage />} />
          <Route path="/student/assignments" element={<AssignmentsPage />} />
          <Route path="/student/complaints" element={<ComplaintsPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/complaints/create" element={<CreateComplaintPage />} />
          <Route path="/complaints/:id/edit" element={<EditComplaintPage />} />
        </Route>
      </Route>

      {/* Faculty Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/performance" element={<StudentPerformancePage />} />
          <Route path="/faculty/students" element={<StudentPerformancePage />} />
          <Route path="/faculty/subjects" element={<FacultySubjectsPage />} />
          <Route path="/faculty/take-attendance" element={<TakeAttendancePage />} />
          <Route path="/faculty/attendance-history" element={<FacultyAttendanceHistoryPage />} />
          <Route path="/faculty/events" element={<EventsPage />} />
          <Route path="/faculty/announcements" element={<AnnouncementsPage />} />
          <Route path="/faculty/assignments" element={<AssignmentsPage />} />
        </Route>
      </Route>

      {/* Faculty & Admin Content Creation Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />} />
          <Route path="/announcements/create" element={<CreateAnnouncementPage />} />
          <Route path="/announcements/:id/edit" element={<EditAnnouncementPage />} />
          <Route path="/assignments/create" element={<CreateAssignmentPage />} />
          <Route path="/assignments/:id/edit" element={<EditAssignmentPage />} />
          <Route path="/assignments/:id/submissions" element={<AssignmentSubmissionsPage />} />
        </Route>
      </Route>

      {/* Admin Specific Roster, Departments, Classes, Subjects, Attendance Analytics & Complaints */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/departments" element={<DepartmentManagementPage />} />
          <Route path="/admin/classes" element={<ClassManagementPage />} />
          <Route path="/admin/subjects" element={<SubjectManagementPage />} />
          <Route path="/admin/faculty-assignments" element={<FacultyAssignmentPage />} />
          <Route path="/admin/enrollments" element={<StudentEnrollmentPage />} />
          <Route path="/admin/attendance-analytics" element={<AdminAttendanceAnalyticsPage />} />
          <Route path="/admin/faculty" element={<FacultyManagementPage />} />
          <Route path="/admin/students" element={<StudentManagementPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
          <Route path="/admin/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/admin/logs" element={<ActivityLogsPage />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/admin/announcements" element={<AnnouncementsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};


export default AppRoutes;

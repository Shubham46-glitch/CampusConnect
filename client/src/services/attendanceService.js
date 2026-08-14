import API from './api';

// Faculty APIs
export const getFacultyMySubjects = async () => {
  const res = await API.get('/attendance/faculty/my-subjects');
  return res.data;
};

export const getStudentsForSession = async (subjectId, classId, date) => {
  const res = await API.get('/attendance/faculty/session-students', {
    params: { subjectId, classId, date },
  });
  return res.data;
};

export const recordAttendanceSession = async (data) => {
  const res = await API.post('/attendance/session', data);
  return res.data;
};

export const getFacultyAttendanceHistory = async (params = {}) => {
  const res = await API.get('/attendance/faculty/history', { params });
  return res.data;
};

export const getSessionDetails = async (sessionId) => {
  const res = await API.get(`/attendance/session/${sessionId}`);
  return res.data;
};

export const updateAttendanceSession = async (sessionId, data) => {
  const res = await API.put(`/attendance/session/${sessionId}`, data);
  return res.data;
};

// Student APIs
export const getStudentMyAttendance = async () => {
  const res = await API.get('/attendance/student/my-attendance');
  return res.data;
};

// Admin APIs
export const getAdminAttendanceAnalytics = async (params = {}) => {
  const res = await API.get('/attendance/admin/analytics', { params });
  return res.data;
};

import API from './api';

export const getStudentDashboard = async () => {
  const response = await API.get('/dashboard/student');
  return response.data;
};

export const getFacultyDashboard = async () => {
  const response = await API.get('/dashboard/faculty');
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await API.get('/dashboard/admin');
  return response.data;
};

export default {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboard,
};

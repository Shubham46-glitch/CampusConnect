import API from './api';

export const getAnalyticsOverview = async () => {
  const res = await API.get('/analytics/overview');
  return res.data;
};

export const getStudentsByDepartmentStats = async () => {
  const res = await API.get('/analytics/students-by-department');
  return res.data;
};

export const getEventParticipationStats = async () => {
  const res = await API.get('/analytics/events');
  return res.data;
};

export const getAssignmentSubmissionStats = async () => {
  const res = await API.get('/analytics/assignments');
  return res.data;
};

export const getComplaintStatusStats = async () => {
  const res = await API.get('/analytics/complaints');
  return res.data;
};

export const getUserRoleDistributionStats = async () => {
  const res = await API.get('/analytics/user-distribution');
  return res.data;
};

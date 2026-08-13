import API from './api';

export const getFacultyStudentPerformance = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);

  const res = await API.get(`/faculty/performance?${queryParams.toString()}`);
  return res.data;
};

export const getStudentPerformanceDetails = async (studentId) => {
  const res = await API.get(`/faculty/performance/student/${studentId}`);
  return res.data;
};

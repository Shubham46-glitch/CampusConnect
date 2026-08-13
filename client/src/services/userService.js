import API from './api';

export const fetchStudents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit || 10);

  const res = await API.get(`/users/students?${queryParams.toString()}`);
  return res.data;
};

export const fetchFaculty = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit || 10);

  const res = await API.get(`/users/faculty?${queryParams.toString()}`);
  return res.data;
};

export const fetchUserById = async (id) => {
  const res = await API.get(`/users/${id}`);
  return res.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await API.patch(`/users/${id}/status`, { status });
  return res.data;
};

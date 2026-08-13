import API from './api';

export const getComplaints = async (params = {}) => {
  const response = await API.get('/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await API.get(`/complaints/${id}`);
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await API.post('/complaints', complaintData);
  return response.data;
};

export const updateComplaint = async (id, complaintData) => {
  const response = await API.put(`/complaints/${id}`, complaintData);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await API.delete(`/complaints/${id}`);
  return response.data;
};

export const updateComplaintStatus = async (id, statusData) => {
  const response = await API.put(`/complaints/${id}/status`, statusData);
  return response.data;
};

export const assignComplaint = async (id, assignedTo) => {
  const response = await API.put(`/complaints/${id}/assign`, { assignedTo });
  return response.data;
};

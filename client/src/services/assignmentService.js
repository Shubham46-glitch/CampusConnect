import API from './api';

export const getAssignments = async (params = {}) => {
  const response = await API.get('/assignments', { params });
  return response.data;
};

export const getAssignmentById = async (id) => {
  const response = await API.get(`/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (assignmentData) => {
  const response = await API.post('/assignments', assignmentData);
  return response.data;
};

export const updateAssignment = async (id, assignmentData) => {
  const response = await API.put(`/assignments/${id}`, assignmentData);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await API.delete(`/assignments/${id}`);
  return response.data;
};

export const submitAssignment = async (id, submissionData) => {
  if (submissionData instanceof FormData) {
    const response = await API.post(`/assignments/${id}/submit`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  const response = await API.post(`/assignments/${id}/submit`, submissionData);
  return response.data;
};

export const getAssignmentSubmissions = async (id) => {
  const response = await API.get(`/assignments/${id}/submissions`);
  return response.data;
};

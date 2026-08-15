import API from './api';

export const getMySubmissions = async () => {
  const response = await API.get('/submissions/my');
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await API.get(`/submissions/${id}`);
  return response.data;
};

export const gradeSubmission = async (id, gradeData) => {
  const response = await API.put(`/submissions/${id}/grade`, gradeData);
  return response.data;
};

export const evaluateSubmission = async (id, evalData) => {
  const response = await API.put(`/submissions/${id}/evaluate`, evalData);
  return response.data;
};

export const uploadSubmissionFile = async (fileName, fileData) => {
  const response = await API.post('/submissions/upload', { fileName, fileData });
  return response.data;
};

import API from './api';

export const getSubmissionById = async (id) => {
  const response = await API.get(`/submissions/${id}`);
  return response.data;
};

export const gradeSubmission = async (id, gradeData) => {
  const response = await API.put(`/submissions/${id}/grade`, gradeData);
  return response.data;
};

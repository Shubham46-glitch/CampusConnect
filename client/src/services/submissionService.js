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

export const uploadSubmissionFile = async (fileObj, fileData = '') => {
  // If fileObj is a File/Blob instance, send via FormData multipart/form-data
  if (fileObj && typeof fileObj === 'object' && fileObj.name) {
    const formData = new FormData();
    formData.append('file', fileObj);
    const response = await API.post('/submissions/upload', formData);
    return response.data;
  }
  // Fallback to base64 JSON payload
  const response = await API.post('/submissions/upload', { fileName: fileObj, fileData });
  return response.data;
};

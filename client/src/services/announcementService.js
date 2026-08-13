import API from './api';

export const getAnnouncements = async (params = {}) => {
  const response = await API.get('/announcements', { params });
  return response.data;
};

export const getAnnouncementById = async (id) => {
  const response = await API.get(`/announcements/${id}`);
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  const response = await API.post('/announcements', announcementData);
  return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
  const response = await API.put(`/announcements/${id}`, announcementData);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await API.delete(`/announcements/${id}`);
  return response.data;
};

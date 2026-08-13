import API from './api';

export const getNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await API.get('/notifications/unread-count');
  return response.data.unreadCount;
};

export const markAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

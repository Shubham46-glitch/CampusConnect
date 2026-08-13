import API from './api';

export const getEvents = async () => {
  const response = await API.get('/events');
  return response.data;
};

export const getEventById = async (id) => {
  const response = await API.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await API.post('/events', eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await API.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await API.delete(`/events/${id}`);
  return response.data;
};

export const registerForEvent = async (id) => {
  const response = await API.post(`/events/${id}/register`);
  return response.data;
};

export const cancelRegistration = async (id) => {
  const response = await API.delete(`/events/${id}/register`);
  return response.data;
};

export const getEventRegistrations = async (id) => {
  const response = await API.get(`/events/${id}/registrations`);
  return response.data;
};

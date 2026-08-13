import API from './api';

export const performGlobalSearch = async (query) => {
  if (!query || !query.trim()) {
    return {
      query: '',
      results: {
        events: [],
        announcements: [],
        assignments: [],
        complaints: [],
        users: [],
      },
    };
  }
  const response = await API.get(`/search?q=${encodeURIComponent(query.trim())}`);
  return response.data;
};

import API from './api';

// Departments
export const getDepartments = async () => {
  const res = await API.get('/academic/departments');
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await API.post('/academic/departments', data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await API.put(`/academic/departments/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await API.delete(`/academic/departments/${id}`);
  return res.data;
};

// Academic Classes
export const getAcademicClasses = async (params = {}) => {
  const res = await API.get('/academic/classes', { params });
  return res.data;
};

export const getFacultyDepartmentClasses = async (params = {}) => {
  const res = await API.get('/academic/faculty-classes', { params });
  return res.data;
};

export const createAcademicClass = async (data) => {
  const res = await API.post('/academic/classes', data);
  return res.data;
};

export const updateAcademicClass = async (id, data) => {
  const res = await API.put(`/academic/classes/${id}`, data);
  return res.data;
};

export const deleteAcademicClass = async (id) => {
  const res = await API.delete(`/academic/classes/${id}`);
  return res.data;
};

// Subjects
export const getSubjects = async (params = {}) => {
  const res = await API.get('/academic/subjects', { params });
  return res.data;
};

export const createSubject = async (data) => {
  const res = await API.post('/academic/subjects', data);
  return res.data;
};

export const createFacultySubject = async (data) => {
  const res = await API.post('/academic/faculty-subjects', data);
  return res.data;
};

export const updateSubject = async (id, data) => {
  const res = await API.put(`/academic/subjects/${id}`, data);
  return res.data;
};

export const deleteSubject = async (id) => {
  const res = await API.delete(`/academic/subjects/${id}`);
  return res.data;
};

// Faculty Assignments
export const getFacultyAssignments = async (params = {}) => {
  const res = await API.get('/academic/faculty-assignments', { params });
  return res.data;
};

export const createFacultyAssignment = async (data) => {
  const res = await API.post('/academic/faculty-assignments', data);
  return res.data;
};

export const deleteFacultyAssignment = async (id) => {
  const res = await API.delete(`/academic/faculty-assignments/${id}`);
  return res.data;
};

// Student Enrollments
export const getStudentEnrollments = async (params = {}) => {
  const res = await API.get('/academic/enrollments', { params });
  return res.data;
};

export const enrollStudent = async (data) => {
  const res = await API.post('/academic/enrollments', data);
  return res.data;
};

export const deleteStudentEnrollment = async (id) => {
  const res = await API.delete(`/academic/enrollments/${id}`);
  return res.data;
};

// Public endpoints for Registration UI
export const getPublicDepartments = async () => {
  const res = await API.get('/academic/public-departments');
  return res.data;
};

export const getPublicClassesByDepartment = async (department) => {
  const res = await API.get('/academic/public-classes', { params: { department } });
  return res.data;
};

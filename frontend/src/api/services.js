import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const meetingAPI = {
  analyze: (data) => api.post('/meetings/analyze', data),
  analyzeAudio: (formData) => api.post('/meetings/upload-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  delete: (id) => api.delete(`/meetings/${id}`),
  exportPDF: (id) => api.get(`/meetings/${id}/export-pdf`, { responseType: 'blob' }),
};

export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  generateReminders: (taskIds, platform) => api.post('/tasks/reminders', { task_ids: taskIds, platform }),
  sendEmails: (taskIds) => api.post('/tasks/send-emails', { task_ids: taskIds }),
};

export const userAPI = {
  getDashboardStats: () => api.get('/users/dashboard'),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
  updateProfile: (params) => api.put('/users/profile', null, { params }),
  getLeaders: () => api.get('/users/leaders'),
  contactLeader: (data) => api.post('/users/contact-leader', data),
};

export const adminAPI = {
  assignRole: (data) => api.post('/admin/assign-role', data),
  getAssignments: () => api.get('/admin/assignments'),
  deleteAssignment: (id) => api.delete(`/admin/assignments/${id}`),
  getUsers: () => api.get('/admin/users'),
  updateUserRoleTeam: (userId, data) => api.put(`/admin/users/${userId}/role-team`, data),
  getAdminQueries: () => api.get('/admin/queries'),
  replyQuery: (queryId, data) => api.post(`/admin/queries/${queryId}/reply`, data),
};

export const queryAPI = {
  sendQuery: (data) => api.post('/users/queries', data),
  getQueries: () => api.get('/users/queries'),
};


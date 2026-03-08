import apiClient from './index'

const BASE = '/administrative-classes'

const adminClassApi = {
  getAll: (params = {}) => apiClient.get(BASE, { params }),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`),
  getStudents: (classId) => apiClient.get(`${BASE}/${classId}/students`),
  assignStudents: (classId, studentIds) =>
    apiClient.post(`${BASE}/${classId}/assign-students`, { studentIds }),
  removeStudent: (classId, studentId) =>
    apiClient.delete(`${BASE}/${classId}/students/${studentId}`),
  transferStudent: (toClassId, studentId, reason) =>
    apiClient.post(`${BASE}/transfer`, { toClassId, studentId, reason }),
  getMajors: () => apiClient.get('/majors'),
  getLecturers: () => apiClient.get('/lecturers'),
  getAcademicYears: () => apiClient.get('/academic-years'),
}

export default adminClassApi

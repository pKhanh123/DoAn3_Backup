import apiClient from './index'

const reportApi = {
  getAdminReports: (params = {}) =>
    apiClient.get('/reports/admin', { params }),
  exportReport: (type, params = {}) =>
    apiClient.get(`/reports/export/${type}`, {
      params,
      responseType: 'blob',
    }),
  getStudentReport: (studentId, params = {}) =>
    apiClient.get(`/reports/student/${studentId}`, { params }),
  getLecturerReport: (lecturerId, params = {}) =>
    apiClient.get(`/reports/lecturer/${lecturerId}`, { params }),
  getAdvisorReport: (advisorId, params = {}) =>
    apiClient.get(`/reports/advisor/${advisorId}`, { params }),
}

export default reportApi

import apiClient from './index'
import type {
  AdminReport,
  LecturerReport,
  AdvisorReport,
  StudentReport,
} from '../types'

const reportApi = {
  getAdminReports: (params: Record<string, unknown> = {}) =>
    apiClient.get<AdminReport>('/reports/admin', { params }),
  getLecturerReport: (params: Record<string, unknown> = {}) =>
    apiClient.get<LecturerReport>('/reports/lecturer', { params }),
  getAdvisorReport: (params: Record<string, unknown> = {}) =>
    apiClient.get<AdvisorReport>('/reports/advisor', { params }),
  getStudentReport: (params: Record<string, unknown> = {}) =>
    apiClient.get<StudentReport>('/reports/student', { params }),
}

export default reportApi

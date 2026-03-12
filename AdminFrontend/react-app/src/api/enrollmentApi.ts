import apiClient from './index'
import type { Enrollment, EnrollmentFormData } from '../types'

const enrollmentApi = {
  getAll: (params: Record<string, unknown> = {}) =>
    apiClient.get<Enrollment[]>('/enrollments', { params }),
  getByStudent: (studentId: number | string) =>
    apiClient.get<Enrollment[]>(`/enrollments/student/${studentId}`),
  getByClass: (classId: number | string) =>
    apiClient.get<Enrollment[]>(`/enrollments/class/${classId}`),
  create: (data: EnrollmentFormData) =>
    apiClient.post('/enrollments', data),
  delete: (id: number | string) =>
    apiClient.delete(`/enrollments/${id}`),
  approve: (id: number | string) =>
    apiClient.post(`/enrollments/${id}/approve`),
  reject: (id: number | string, reason?: string) =>
    apiClient.post(`/enrollments/${id}/reject`, { reason }),
}

export default enrollmentApi

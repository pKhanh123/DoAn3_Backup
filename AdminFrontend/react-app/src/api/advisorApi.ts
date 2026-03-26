import apiClient from './index'
import type {
  AdvisorListResponse,
  AdvisorDetailResponse,
  AdvisorDefaultResponse,
  DepartmentListResponse,
} from '../types/api'
import type { Advisor, AdvisorFormData } from '../types'

const BASE = '/advisors'

const advisorApi = {
  getAll: () => apiClient.get<Advisor[]>(BASE),
  getById: (id: number | string) =>
    apiClient.get<Advisor>(`${BASE}/${id}`),
  create: (data: AdvisorFormData) =>
    apiClient.post<Advisor>(BASE, data),
  update: (id: number | string, data: AdvisorFormData) =>
    apiClient.put<Advisor>(`${BASE}/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`${BASE}/${id}`),
  getDepartments: () =>
    apiClient.get<{ departmentId: number; departmentName: string }[]>('/departments'),
  getAdvisorsByDepartment: (departmentId: number) =>
    apiClient.get<Advisor[]>('/advisors', { params: { departmentId } }),
  assignStudents: (advisorId: number | string, studentIds: number[]) =>
    apiClient.post(`${BASE}/${advisorId}/students`, { studentIds }),
}

export default advisorApi

import apiClient from './index'
import type {
  SubjectListResponse,
  SubjectDetailResponse,
  SubjectDefaultResponse,
  DepartmentListResponse,
} from '../types/api'
import type { Subject, SubjectFormData } from '../types'

const BASE = '/subjects'

const subjectApi = {
  getAll: (params: Record<string, unknown> = {}) =>
    apiClient.get<Subject[]>(BASE, { params }),
  getById: (id: number | string) =>
    apiClient.get<Subject>(`${BASE}/${id}`),
  create: (data: SubjectFormData) =>
    apiClient.post<Subject>(BASE, data),
  update: (id: number | string, data: SubjectFormData) =>
    apiClient.put<Subject>(`${BASE}/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`${BASE}/${id}`),
  getDepartments: () =>
    apiClient.get<{ departmentId: number; departmentName: string }[]>('/departments'),
}

export default subjectApi

import apiClient from './index'
import type {
  ClassListResponse,
  ClassDetailResponse,
  ClassDefaultResponse,
} from '../types/api'
import type { Class, ClassFormData } from '../types'

const BASE = '/classes'

const classApi = {
  getAll: (params: Record<string, unknown> = {}) =>
    apiClient.get<Class[]>(BASE, { params }),
  getById: (id: number | string) =>
    apiClient.get<Class>(`${BASE}/${id}`),
  create: (data: ClassFormData) =>
    apiClient.post<Class>(BASE, data),
  update: (id: number | string, data: ClassFormData) =>
    apiClient.put<Class>(`${BASE}/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`${BASE}/${id}`),
}

export default classApi

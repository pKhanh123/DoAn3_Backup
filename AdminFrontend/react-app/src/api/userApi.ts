import apiClient from './index'
import type {
  UserListResponse,
  UserDetailResponse,
  UserDefaultResponse,
  RoleListResponse,
} from '../types/api'
import type { User, UserFormData } from '../types'

const BASE = '/account-management'

const userApi = {
  getAll: () => apiClient.get<User[]>(BASE),
  getById: (id: number | string) => apiClient.get<User>(`${BASE}/${id}`),
  create: (data: UserFormData) => apiClient.post<User>(BASE, data),
  update: (id: number | string, data: UserFormData) =>
    apiClient.put<User>(`${BASE}/${id}`, data),
  delete: (id: number | string) => apiClient.delete(`${BASE}/${id}`),
  getRoles: () => apiClient.get<{ roleId: number; roleName: string }[]>('/roles'),
}

export default userApi

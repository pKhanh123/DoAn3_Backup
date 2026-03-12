import apiClient from './index'
import type {
  AdminClassListResponse,
  AdminClassDetailResponse,
  AdminClassDefaultResponse,
} from '../types/api'
import type { AdminClass, AdminClassFormData } from '../types'

const BASE = '/admin-classes'

const adminClassApi = {
  getAll: (params: Record<string, unknown> = {}) =>
    apiClient.get<AdminClass[]>(BASE, { params }),
  getById: (id: number | string) =>
    apiClient.get<AdminClass>(`${BASE}/${id}`),
  create: (data: AdminClassFormData) =>
    apiClient.post<AdminClass>(BASE, data),
  update: (id: number | string, data: AdminClassFormData) =>
    apiClient.put<AdminClass>(`${BASE}/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`${BASE}/${id}`),
  getStudents: (classId: number | string) =>
    apiClient.get<{ studentId: number; studentCode: string; fullName: string; status: string }[]>(
      `${BASE}/${classId}/students`
    ),
  assignStudents: (classId: number | string, studentIds: number[]) =>
    apiClient.post(`${BASE}/${classId}/students`, { studentIds }),
  removeStudent: (classId: number | string, studentId: number | string) =>
    apiClient.delete(`${BASE}/${classId}/students/${studentId}`),
  transferStudent: (studentId: number | string, fromClassId: number | string, toClassId: number | string) =>
    apiClient.post(`${BASE}/transfer`, { studentId, fromClassId, toClassId }),
  getFaculties: () =>
    apiClient.get<{ facultyId: number; facultyName: string }[]>('/faculties'),
  getAcademicYears: () =>
    apiClient.get<{ academicYearId: number; academicYearName: string }[]>('/academic-years'),
}

export default adminClassApi

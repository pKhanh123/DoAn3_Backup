import apiClient from './index'
import type {
  LecturerListResponse,
  LecturerDetailResponse,
  LecturerDefaultResponse,
  DepartmentListResponse,
  LecturerSubjectListResponse,
} from '../types/api'
import type {
  Lecturer,
  LecturerFormData,
  LecturerSubject,
} from '../types'

const BASE = '/lecturers'

const lecturerApi = {
  getAll: () => apiClient.get<Lecturer[]>(BASE),
  getById: (id: number | string) =>
    apiClient.get<Lecturer>(`${BASE}/${id}`),
  create: (data: LecturerFormData) =>
    apiClient.post<Lecturer>(BASE, data),
  update: (id: number | string, data: LecturerFormData) =>
    apiClient.put<Lecturer>(`${BASE}/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`${BASE}/${id}`),
  getDepartments: () =>
    apiClient.get<{ departmentId: number; departmentName: string }[]>('/departments'),
  getSubjects: () =>
    apiClient.get<{ subjectId: number | string; subjectName: string }[]>('/subjects'),
  getLecturerSubjects: (lecturerId: number | string) =>
    apiClient.get<LecturerSubject[]>(
      `/lecturer-subjects/lecturer/${lecturerId}`
    ),
  assignSubject: (data: { lecturerId: number; subjectId: number; departmentId: number }) =>
    apiClient.post('/lecturer-subjects', data),
  removeSubject: (id: number | string) =>
    apiClient.delete(`/lecturer-subjects/${id}`),
}

export default lecturerApi

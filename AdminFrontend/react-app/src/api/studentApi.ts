import apiClient from './index'
import type {
  StudentListResponse,
  StudentDetailResponse,
  StudentDefaultResponse,
  StudentImportResponse,
  FacultyListResponse,
  MajorListResponse,
  AcademicYearListResponse,
} from '../types/api'
import type {
  Student,
  StudentFormData,
  StudentQueryParams,
} from '../types'

const BASE = '/students'

const studentApi = {
  getAll: (params: StudentQueryParams = {}) =>
    apiClient.get<Student[]>(BASE, { params }),
  getById: (id: number | string) =>
    apiClient.get<Student>(`${BASE}/${id}`),
  create: (data: StudentFormData) =>
    apiClient.post<Student>(BASE, data),
  update: (id: number | string, data: StudentFormData) =>
    apiClient.put<Student>(`${BASE}/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`${BASE}/${id}`),
  importBatch: (students: unknown[]) =>
    apiClient.post<{ success: number; failed: number; errors?: string[] }>(
      `${BASE}/import`,
      { students }
    ),
  getFaculties: () =>
    apiClient.get<{ facultyId: number; facultyName: string; facultyCode: string }[]>('/faculties'),
  getMajors: (facultyId: number) =>
    apiClient.get<{ majorId: number; majorName: string; facultyId: number }[]>('/majors', {
      params: { facultyId },
    }),
  getAcademicYears: () =>
    apiClient.get<{ academicYearId: number; academicYearName: string }[]>('/academic-years'),
}

export default studentApi

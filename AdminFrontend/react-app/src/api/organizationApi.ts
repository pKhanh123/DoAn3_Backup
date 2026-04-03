import apiClient from './index'

// ============================================================
// FACULTY (Khoa)
// ============================================================
export interface Faculty {
  facultyId: string
  facultyCode: string
  facultyName: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface FacultyPageResponse {
  success: boolean
  data: Faculty[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// DEPARTMENT (Bộ môn)
// ============================================================
export interface Department {
  departmentId: string
  departmentCode: string
  departmentName: string
  facultyId: string
  facultyName?: string
  description?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface DepartmentPageResponse {
  success: boolean
  data: Department[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// MAJOR (Ngành)
// ============================================================
export interface Major {
  majorId: string
  majorCode: string
  majorName: string
  facultyId: string
  facultyName?: string
  departmentId?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// ============================================================
// ORGANIZATION STRUCTURE
// ============================================================
export interface OrganizationStructure {
  faculties: Faculty[]
  departments: Department[]
  majors: Major[]
}

const organizationApi = {
  // ─── Faculty (Khoa) ───────────────────────────────────────
  getFaculties: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient.get<FacultyPageResponse>('/faculties', { params }),

  getFacultyById: (id: string) =>
    apiClient.get<Faculty>(`/faculties/${id}`),

  createFaculty: (data: Omit<Faculty, 'facultyId' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<{ message: string }>('/faculties', data),

  updateFaculty: (id: string, data: Partial<Faculty>) =>
    apiClient.put<{ message: string }>(`/faculties/${id}`, { ...data, facultyId: id }),

  deleteFaculty: (id: string) =>
    apiClient.delete<{ message: string }>(`/faculties/${id}`),

  // ─── Department (Bộ môn) ──────────────────────────────────
  getDepartments: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient.get<DepartmentPageResponse>('/departments', { params }),

  getDepartmentById: (id: string) =>
    apiClient.get<{ data: Department }>(`/departments/${id}`),

  getDepartmentsByFaculty: (facultyId: string) =>
    apiClient.get<{ data: Department[] }>(`/departments/faculty/${facultyId}`),

  createDepartment: (data: Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<{ message: string; data: Department }>('/departments', data),

  updateDepartment: (id: string, data: Partial<Department>) =>
    apiClient.put<{ message: string }>(`/departments/${id}`, { ...data, departmentId: id }),

  deleteDepartment: (id: string) =>
    apiClient.delete<{ message: string }>(`/departments/${id}`),

  // ─── Major (Ngành) ───────────────────────────────────────
  getMajorsByFaculty: (facultyId: string) =>
    apiClient.get<{ data: Major[] }>(`/organization/faculties/${facultyId}/majors`),

  majorCreate: (data: {
    majorCode: string
    majorName: string
    facultyId: string
    departmentId?: string
    description?: string
  }) =>
    apiClient.post<{ message: string; data: Major }>('/majors', data),

  majorUpdate: (id: string, data: Partial<{
    majorCode: string
    majorName: string
    facultyId: string
    departmentId?: string
    description?: string
  }>) =>
    apiClient.put<{ message: string }>(`/majors/${id}`, { ...data, majorId: id }),

  majorDelete: (id: string) =>
    apiClient.delete<{ message: string }>(`/majors/${id}`),

  // ─── Organization Structure ───────────────────────────────
  getStructure: () =>
    apiClient.get<{ data: OrganizationStructure }>('/organization/structure'),
}

export default organizationApi

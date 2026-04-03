import apiClient from './index'

export interface SchoolYear {
  schoolYearId: string
  schoolYearName?: string
  yearCode?: string
  semester?: number
  academicYearId?: string
  academicYear?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

const schoolYearApi = {
  getAll: () =>
    apiClient.get<SchoolYear[]>('/school-years'),

  getById: (id: string) =>
    apiClient.get<SchoolYear>(`/school-years/${id}`),

  getCurrent: () =>
    apiClient.get<SchoolYear>('/school-years/current'),

  getActive: () =>
    apiClient.get<SchoolYear | { message?: string }>('/school-years/active'),

  create: (data: Partial<SchoolYear>) =>
    apiClient.post<{ message: string; data: SchoolYear }>(
      '/school-years',
      data
    ),

  update: (id: string, data: Partial<SchoolYear>) =>
    apiClient.put<{ message: string }>(`/school-years/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/school-years/${id}`),

  autoCreate: (startYear: number, academicYearId?: string) =>
    apiClient.post<{ message: string; data: SchoolYear }>(
      `/school-years/auto-create?startYear=${startYear}${academicYearId ? `&academicYearId=${academicYearId}` : ''}`
    ),

  autoCreateForCohort: (academicYearId: string) =>
    apiClient.post<{ message: string; data: SchoolYear[] }>(
      `/school-years/auto-create-for-cohort?academicYearId=${academicYearId}`
    ),

  activate: (id: string, initialSemester = 1) =>
    apiClient.post<{ message: string }>(
      `/school-years/${id}/activate?initialSemester=${initialSemester}`
    ),
}

export default schoolYearApi

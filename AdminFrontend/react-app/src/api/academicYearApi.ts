import apiClient from './index'

export interface AcademicYear {
  academicYearId: string
  academicYearName: string
  cohortCode?: string
  startYear: number
  endYear: number
  durationYears?: number
  isCurrent?: boolean
  createdAt?: string
}

const academicYearApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; data: AcademicYear[] }>('/academic-years'),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: AcademicYear }>(`/academic-years/${id}`),

  create: (data: Partial<AcademicYear>) =>
    apiClient.post<{ success: boolean; message: string; data: AcademicYear }>(
      '/academic-years',
      data
    ),

  update: (id: string, data: Partial<AcademicYear>) =>
    apiClient.put<{ success: boolean; message: string }>(
      `/academic-years/${id}`,
      data
    ),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/academic-years/${id}`
    ),

  autoCreateCohort: (startYear: number, durationYears = 4) =>
    apiClient.post<{
      success: boolean
      message: string
      data: AcademicYear
    }>(`/academic-years/auto-create-cohort?startYear=${startYear}&durationYears=${durationYears}`),

  autoCreateMultiple: (startYears: number[], durationYears = 4) =>
    apiClient.post<{
      success: boolean
      message: string
      data: AcademicYear[]
    }>('/academic-years/auto-create-multiple-cohorts', startYears),

  getActiveCohorts: () =>
    apiClient.get<{ success: boolean; data: AcademicYear[] }>(
      '/academic-years/active-cohorts'
    ),
}

export default academicYearApi

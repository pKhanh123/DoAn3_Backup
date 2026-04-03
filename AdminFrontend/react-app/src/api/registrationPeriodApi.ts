import apiClient from './index'

export interface RegistrationPeriod {
  registrationPeriodId: string | number
  periodName: string
  periodType: 'NORMAL' | 'RETAKE'
  periodTypeText?: string
  academicYearId?: string
  academicYear?: string
  semester?: string
  startDate: string
  endDate: string
  status: 'OPEN' | 'CLOSED' | 'UPCOMING'
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePeriodDto {
  periodName: string
  periodType: 'NORMAL' | 'RETAKE'
  academicYearId?: string
  semester?: string
  startDate: string
  endDate: string
}

export interface UpdatePeriodDto {
  periodName?: string
  periodType?: 'NORMAL' | 'RETAKE'
  academicYearId?: string
  semester?: string
  startDate?: string
  endDate?: string
}

const registrationPeriodApi = {
  getAll: (periodType?: string) =>
    apiClient.get<{ success: boolean; data: RegistrationPeriod[]; totalCount: number }>(
      '/registration-periods',
      { params: periodType ? { periodType } : {} }
    ),

  getById: (id: string | number) =>
    apiClient.get<{ success: boolean; data: RegistrationPeriod }>(`/registration-periods/${id}`),

  getActive: () =>
    apiClient.get<{ success: boolean; data: RegistrationPeriod | null }>('/registration-periods/active'),

  create: (data: CreatePeriodDto) =>
    apiClient.post<{ success: boolean; message: string; periodId: string }>(
      '/registration-periods',
      data
    ),

  update: (id: string | number, data: UpdatePeriodDto) =>
    apiClient.put<{ success: boolean; message: string }>(
      `/registration-periods/${id}`,
      data
    ),

  delete: (id: string | number) =>
    apiClient.delete<{ success: boolean; message: string }>(`/registration-periods/${id}`),

  open: (id: string | number) =>
    apiClient.post<{ success: boolean; message: string }>(
      `/registration-periods/${id}/open`
    ),

  close: (id: string | number) =>
    apiClient.post<{ success: boolean; message: string }>(
      `/registration-periods/${id}/close`
    ),

  getClasses: (id: string | number) =>
    apiClient.get<{ success: boolean; data: unknown[] }>(
      `/registration-periods/${id}/classes`
    ),

  addClass: (periodId: string | number, classId: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      `/registration-periods/${periodId}/classes`,
      { classId }
    ),

  removeClass: (periodClassId: string | number) =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/registration-periods/classes/${periodClassId}`
    ),
}

export default registrationPeriodApi

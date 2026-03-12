import apiClient from './index'
import type { Schedule, ScheduleFormData, ScheduleConflict } from '../types'

const scheduleApi = {
  getAllByWeek: (year: number, week: number) =>
    apiClient.get<Schedule[]>('/schedules', { params: { year, week } }),
  getByClass: (classId: number | string, week?: number) =>
    apiClient.get<Schedule[]>('/schedules', {
      params: { classId, ...(week ? { week } : {}) },
    }),
  checkConflicts: (data: ScheduleFormData) =>
    apiClient.post<{ hasConflict: boolean; conflicts?: ScheduleConflict['conflicts'] }>(
      '/schedules/check-conflicts',
      data
    ),
  create: (data: ScheduleFormData) =>
    apiClient.post<Schedule>('/schedules', data),
  update: (id: number | string, data: ScheduleFormData) =>
    apiClient.put<Schedule>(`/schedules/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`/schedules/${id}`),
}

export default scheduleApi

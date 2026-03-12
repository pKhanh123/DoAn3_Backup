import apiClient from './index'
import type { Attendance, AttendancePayload, StudentAttendance } from '../types'

const attendanceApi = {
  getBySchedule: (scheduleId: number) =>
    apiClient.get<Attendance[]>(`/attendances/schedule/${scheduleId}`),
  getByStudent: (studentId: number, params: Record<string, unknown> = {}) =>
    apiClient.get<StudentAttendance[]>(`/attendances/student/${studentId}`, { params }),
  create: (data: AttendancePayload) =>
    apiClient.post('/attendances', data),
  update: (id: number, data: AttendancePayload) =>
    apiClient.put(`/attendances/${id}`, data),
  batchUpsert: (records: AttendancePayload[]) =>
    apiClient.post('/attendances/batch', records),
}

export default attendanceApi

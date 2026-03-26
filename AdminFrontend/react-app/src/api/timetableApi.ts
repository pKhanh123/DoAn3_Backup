import apiClient from './index'
import type { TimetableSession, LecturerTodaySession } from '../types'

const timetableApi = {
  getWeekTimetable: (params: {
    year?: number
    week?: number
    studentId?: number
    lecturerId?: number
  }) =>
    apiClient.get<TimetableSession[]>('/timetable/week', { params }),
  getLecturerToday: () =>
    apiClient.get<LecturerTodaySession[]>('/timetable/lecturer/today'),
  getStudentTimetable: (params: { year?: number; week?: number }) =>
    apiClient.get<TimetableSession[]>('/timetable/student', { params }),
  getLecturerWeek: (lecturerId: number, year: number, week: number) =>
    apiClient.get<TimetableSession[]>(
      `/timetable/lecturer/${lecturerId}?year=${year}&week=${week}`
    ),
  getRooms: (_facultyId?: number | null, _all?: boolean) =>
    apiClient.get<{ roomId: number; roomCode: string; building: string }[]>('/rooms'),
}

export default timetableApi

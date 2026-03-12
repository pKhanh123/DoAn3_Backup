import apiClient from './index'

const lookupApi = {
  getFaculties: () =>
    apiClient.get<{ facultyId: number; facultyName: string }[]>('/faculties'),
  getMajors: (facultyId?: number) =>
    apiClient.get<{ majorId: number; majorName: string; facultyId: number }[]>('/majors', {
      params: facultyId ? { facultyId } : {},
    }),
  getDepartments: () =>
    apiClient.get<{ departmentId: number; departmentName: string }[]>('/departments'),
  getSubjects: () =>
    apiClient.get<{ subjectId: number; subjectName: string; subjectCode: string }[]>('/subjects'),
  getLecturers: () =>
    apiClient.get<{ lecturerId: number; fullName: string; lecturerCode: string }[]>('/lecturers'),
  getAcademicYears: () =>
    apiClient.get<{
      academicYearId: number
      academicYearName: string
      startYear: number
      endYear: number
    }[]>('/academic-years'),
  getSchoolYears: () =>
    apiClient.get<{
      schoolYearId: number
      schoolYearName: string
      startDate: string
      endDate: string
    }[]>('/school-years'),
  getRoles: () =>
    apiClient.get<{ roleId: number; roleName: string }[]>('/roles'),
}

export default lookupApi

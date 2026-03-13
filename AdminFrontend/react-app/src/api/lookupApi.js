import apiClient from './index'

// Shared API cho dropdown data
const lookupApi = {
  getSubjects: () => apiClient.get('/subjects'),
  getDepartments: () => apiClient.get('/departments'),
  getLecturers: () => apiClient.get('/lecturers'),
  getAdvisors: () => apiClient.get('/advisors'),
  getAcademicYears: () => apiClient.get('/academic-years'),
  getSchoolYears: () => apiClient.get('/school-years'),
  getFaculties: () => apiClient.get('/faculties'),
  getMajors: (facultyId) => {
    const params = facultyId ? { facultyId } : {}
    return apiClient.get('/majors', { params })
  },
}

export default lookupApi

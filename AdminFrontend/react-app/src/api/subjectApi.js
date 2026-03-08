import apiClient from './index'

const BASE = '/subjects'

const subjectApi = {
  getAll: (params = {}) => apiClient.get(BASE, { params }),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`),
  getDepartments: () => apiClient.get('/departments'),
}

export default subjectApi

import apiClient from './index'
import type { Room, RoomFormData } from '../types'

const roomApi = {
  getAll: (params: Record<string, unknown> = {}) =>
    apiClient.get<Room[]>('/rooms', { params }),
  getById: (id: number | string) =>
    apiClient.get<Room>(`/rooms/${id}`),
  create: (data: RoomFormData) =>
    apiClient.post<Room>('/rooms', data),
  update: (id: number | string, data: RoomFormData) =>
    apiClient.put<Room>(`/rooms/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete(`/rooms/${id}`),
}

export default roomApi

import apiClient from './index'

export interface Notification {
  notificationId: string | number
  recipientId?: string
  title: string
  content?: string
  type: 'Info' | 'Warning' | 'Success' | 'Error'
  isRead: boolean
  createdAt: string
  sentDate?: string
  createdBy?: string
}

export interface NotificationCreateDto {
  recipientId: string
  title: string
  content?: string
  type: 'Info' | 'Warning' | 'Success' | 'Error'
  sentDate?: string
  createdBy?: string
}

export interface NotificationPageResponse {
  data: Notification[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

const notificationApi = {
  getAll: (params?: {
    page?: number
    pageSize?: number
    type?: string
    isRead?: boolean
  }) =>
    apiClient.get<NotificationPageResponse>('/notifications', { params }),

  getById: (id: string | number) =>
    apiClient.get<{ data: Notification }>(`/notifications/${id}`),

  getUnread: (limit = 10) =>
    apiClient.get<{ data: Notification[] }>(`/notifications/unread?limit=${limit}`),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread/count'),

  getMyNotifications: (page = 1, pageSize = 50) =>
    apiClient.get<NotificationPageResponse>(
      `/notifications/my-notifications?page=${page}&pageSize=${pageSize}`
    ),

  getByUser: (userId: string, page = 1, pageSize = 50) =>
    apiClient.get<NotificationPageResponse>(
      `/notifications/user/${userId}?page=${page}&pageSize=${pageSize}`
    ),

  create: (data: NotificationCreateDto) =>
    apiClient.post<{ message: string; notificationId: string }>(
      '/notifications',
      data
    ),

  markAsRead: (id: string | number) =>
    apiClient.put<{ message: string }>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put<{ message: string; updatedCount: number }>(
      '/notifications/mark-all-read'
    ),

  delete: (id: string | number) =>
    apiClient.delete<{ message: string }>(`/notifications/${id}`),
}

export default notificationApi

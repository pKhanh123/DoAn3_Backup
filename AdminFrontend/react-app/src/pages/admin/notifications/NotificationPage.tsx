import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import notificationApi from '../../../api/notificationApi'
import type {
  Notification,
  NotificationCreateDto,
} from '../../../api/notificationApi'

interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
}

interface NotificationForm {
  recipientId: string
  title: string
  content: string
  type: 'Info' | 'Warning' | 'Success' | 'Error'
  sentDate: string
}

interface FormErrors {
  recipientId?: string
  title?: string
}

function getPages(current: number, total: number): number[] {
  const pages: number[] = []
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

function formatDate(d: string): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTypeClass(type: string): string {
  switch (type) {
    case 'Info':    return 'badge-primary'
    case 'Warning': return 'badge-warning'
    case 'Success': return 'badge-success'
    case 'Error':   return 'badge-danger'
    default:        return 'badge-secondary'
  }
}

function getTypeText(type: string): string {
  switch (type) {
    case 'Info':    return 'Thông tin'
    case 'Warning': return 'Cảnh báo'
    case 'Success': return 'Thành công'
    case 'Error':   return 'Lỗi'
    default:        return type || '—'
  }
}

export default function NotificationPage(): React.JSX.Element {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterRead, setFilterRead] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 20

  const [showModal, setShowModal] = useState<boolean>(false)
  const [form, setForm] = useState<NotificationForm>({
    recipientId: '',
    title: '',
    content: '',
    type: 'Info',
    sentDate: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // ─── Fetch all notifications ────────────────────────────────────────────
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['notifications', page, pageSize, filterType, filterRead],
    queryFn: () =>
      notificationApi.getAll({
        page,
        pageSize,
        type: filterType || undefined,
        isRead:
          filterRead === 'true' ? true : filterRead === 'false' ? false : undefined,
      }),
    staleTime: 30 * 1000,
  })

  const allNotifications: Notification[] = rawData?.data?.data || []
  const totalCount = rawData?.data?.totalCount || 0
  const totalPages = rawData?.data?.totalPages || 1

  // ─── Stats from full list ──────────────────────────────────────────────
  const { data: statsData } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: () =>
      notificationApi.getAll({ page: 1, pageSize: 500 }),
    staleTime: 60 * 1000,
  })

  const allNotifs: Notification[] = statsData?.data?.data || []
  const stats = {
    total: allNotifs.length,
    unread: allNotifs.filter((n) => !n.isRead).length,
    read: allNotifs.filter((n) => n.isRead).length,
  }

  // ─── Filter client-side for search ────────────────────────────────────
  const filtered = search
    ? allNotifications.filter(
        (n) =>
          n.title?.toLowerCase().includes(search.toLowerCase()) ||
          n.content?.toLowerCase().includes(search.toLowerCase()),
      )
    : allNotifications

  // ─── Mutations ────────────────────────────────────────────────────────
  const markAllMutation = useMutation<unknown, ApiError>({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('Đã đánh dấu tất cả là đã đọc!')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi đánh dấu đã đọc')
    },
  })

  const markReadMutation = useMutation<unknown, ApiError, Notification>({
    mutationFn: (n) => notificationApi.markAsRead(n.notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi đánh dấu đã đọc')
    },
  })

  const deleteMutation = useMutation<unknown, ApiError, Notification>({
    mutationFn: (n) => notificationApi.delete(n.notificationId),
    onSuccess: () => {
      toast.success('Xóa thông báo thành công!')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Không thể xóa thông báo',
      )
    },
  })

  const createMutation = useMutation<unknown, ApiError, void>({
    mutationFn: () => {
      const dto: NotificationCreateDto = {
        recipientId: form.recipientId,
        title: form.title,
        content: form.content,
        type: form.type,
        sentDate: form.sentDate || undefined,
      }
      return notificationApi.create(dto)
    },
    onSuccess: () => {
      toast.success('Tạo thông báo thành công!')
      setShowModal(false)
      setForm({
        recipientId: '',
        title: '',
        content: '',
        type: 'Info',
        sentDate: '',
      })
      setFormErrors({})
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo thông báo')
    },
  })

  // ─── Pagination ────────────────────────────────────────────────────────
  const safePage = Math.min(page, totalPages)
  const displayTotal = search ? filtered.length : totalCount
  const displayPages = search
    ? Math.max(1, Math.ceil(filtered.length / pageSize))
    : totalPages

  // ─── Validation ────────────────────────────────────────────────────────
  function validateForm(): FormErrors {
    const errs: FormErrors = {}
    if (!form.recipientId?.trim()) errs.recipientId = 'Người nhận bắt buộc'
    if (!form.title?.trim()) errs.title = 'Tiêu đề bắt buộc'
    return errs
  }

  function handleSave(): void {
    const errs = validateForm()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    createMutation.mutate()
  }

  function openCreate(): void {
    setForm({
      recipientId: '',
      title: '',
      content: '',
      type: 'Info',
      sentDate: '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  function handleDelete(n: Notification): void {
    if (!window.confirm(`Xóa thông báo "${n.title}"?`)) return
    deleteMutation.mutate(n)
  }

  return (
    <div>
      {/* ─── Stats Bar ─────────────────────────────────────────────────── */}
      <div className="row mb-3">
        <div className="col-md-4 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0">{stats.total}</div>
              <small className="text-muted">Tổng thông báo</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-warning">{stats.unread}</div>
              <small className="text-muted">Chưa đọc</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-success">{stats.read}</div>
              <small className="text-muted">Đã đọc</small>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ────────────────────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-group" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm tiêu đề, nội dung..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả loại</option>
            <option value="Info">Thông tin</option>
            <option value="Warning">Cảnh báo</option>
            <option value="Success">Thành công</option>
            <option value="Error">Lỗi</option>
          </select>
          <select
            className="form-control"
            value={filterRead}
            onChange={(e) => { setFilterRead(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả</option>
            <option value="false">Chưa đọc</option>
            <option value="true">Đã đọc</option>
          </select>
          {stats.unread > 0 && (
            <button
              className="btn btn-outline-success"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <i className="fas fa-check-double"></i> Đánh dấu tất cả đã đọc
            </button>
          )}
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> Tạo thông báo
          </button>
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <i className="fas fa-spinner fa-spin"></i> Đang tải...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">Không có thông báo</td>
                  </tr>
                ) : (
                  filtered.map((n) => (
                    <tr key={n.notificationId} className={!n.isRead ? 'fw-bold' : ''}>
                      <td>
                        {!n.isRead && (
                          <span className="badge badge-warning">Mới</span>
                        )}
                      </td>
                      <td>
                        <div>{n.title || '—'}</div>
                        {n.content && (
                          <small className="text-muted">
                            {n.content.length > 80
                              ? n.content.substring(0, 80) + '...'
                              : n.content}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getTypeClass(n.type)}`}>
                          {getTypeText(n.type)}
                        </span>
                      </td>
                      <td>
                        <small>{formatDate(n.createdAt)}</small>
                      </td>
                      <td>
                        <div className="table-actions">
                          {!n.isRead && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => markReadMutation.mutate(n)}
                              title="Đánh dấu đã đọc"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(n)}
                            disabled={deleteMutation.isPending}
                            title="Xóa thông báo"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {displayTotal > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, displayTotal)} / {displayTotal}
              </div>
              <div className="pagination">
                <button
                  className="btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <i className="fas fa-chevron-left"></i> Trước
                </button>
                {getPages(safePage, displayPages).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === safePage ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-sm"
                  onClick={() => setPage((p) => Math.min(displayPages, p + 1))}
                  disabled={safePage === displayPages}
                >
                  Sau <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Tạo thông báo mới</h4>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label>
                  Người nhận (User ID) <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control${formErrors.recipientId ? ' is-invalid' : ''}`}
                  value={form.recipientId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recipientId: e.target.value }))
                  }
                  placeholder="VD: 123 hoặc user-uuid"
                />
                {formErrors.recipientId && (
                  <div className="invalid-feedback d-block">
                    {formErrors.recipientId}
                  </div>
                )}
              </div>
              <div className="form-group mb-3">
                <label>
                  Tiêu đề <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control${formErrors.title ? ' is-invalid' : ''}`}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="VD: Thông báo lịch học"
                />
                {formErrors.title && (
                  <div className="invalid-feedback d-block">
                    {formErrors.title}
                  </div>
                )}
              </div>
              <div className="form-group mb-3">
                <label>Loại</label>
                <select
                  className="form-control"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as NotificationForm['type'],
                    }))
                  }
                >
                  <option value="Info">Thông tin</option>
                  <option value="Warning">Cảnh báo</option>
                  <option value="Success">Thành công</option>
                  <option value="Error">Lỗi</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label>Nội dung</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Nhập nội dung thông báo..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Gửi thông báo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../api/index'
import type { AuditLog } from '../../../types'

interface AuditLogResponse {
  data: AuditLog[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
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

function getActionClass(action: string): string {
  if (!action) return 'badge-secondary'
  const a = action.toLowerCase()
  if (a.includes('create') || a.includes('post')) return 'badge-success'
  if (a.includes('update') || a.includes('put')) return 'badge-warning'
  if (a.includes('delete') || a.includes('remove')) return 'badge-danger'
  if (a.includes('login') || a.includes('auth')) return 'badge-primary'
  return 'badge-secondary'
}

export default function AuditLogPage(): React.JSX.Element {
  const [search, setSearch] = useState<string>('')
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterEntity, setFilterEntity] = useState<string>('')
  const [filterUser, setFilterUser] = useState<string>('')
  const [filterFrom, setFilterFrom] = useState<string>('')
  const [filterTo, setFilterTo] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 25

  const { data: rawData, isLoading, error } = useQuery<AuditLogResponse, ApiError>({
    queryKey: ['audit-logs', page, pageSize, filterAction, filterEntity, filterUser, filterFrom, filterTo],
    queryFn: () => {
      const params: Record<string, string | number> = { page, pageSize }
      if (search) params.search = search
      if (filterAction) params.action = filterAction
      if (filterEntity) params.entityType = filterEntity
      if (filterUser) params.userId = filterUser
      if (filterFrom) params.fromDate = filterFrom
      if (filterTo) params.toDate = filterTo
      return apiClient
        .get<AuditLogResponse>('/audit-logs', { params })
        .then((r) => r.data)
    },
    staleTime: 30 * 1000,
  })

  const logs: AuditLog[] = rawData?.data || []
  const pagination = rawData?.pagination || { page: 1, pageSize, totalCount: 0, totalPages: 1 }
  const totalPages = Math.max(1, pagination.totalPages || 1)
  const safePage = Math.min(page, totalPages)

  // Stats
  const stats = {
    total: pagination.totalCount || logs.length,
    create: logs.filter((l) => l.action?.toLowerCase().includes('create') || l.action?.toLowerCase().includes('post')).length,
    update: logs.filter((l) => l.action?.toLowerCase().includes('update') || l.action?.toLowerCase().includes('put')).length,
    delete: logs.filter((l) => l.action?.toLowerCase().includes('delete') || l.action?.toLowerCase().includes('remove')).length,
  }

  return (
    <div>
      {/* ─── Stats Bar ─────────────────────────────────────────────────── */}
      <div className="row mb-3">
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0">{stats.total.toLocaleString()}</div>
              <small className="text-muted">Tổng logs</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-success">{stats.create}</div>
              <small className="text-muted">Tạo mới</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-warning">{stats.update}</div>
              <small className="text-muted">Cập nhật</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-danger">{stats.delete}</div>
              <small className="text-muted">Xóa</small>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ────────────────────────────────────────────────── */}
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div className="filter-group" style={{ flex: 1, minWidth: 180 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm chi tiết..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả hành động</option>
            <option value="CREATE">Tạo mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
            <option value="LOGIN">Đăng nhập</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả thực thể</option>
            <option value="User">Người dùng</option>
            <option value="Student">Sinh viên</option>
            <option value="Lecturer">Giảng viên</option>
            <option value="Faculty">Khoa</option>
            <option value="Department">Bộ môn</option>
            <option value="Subject">Môn học</option>
            <option value="RegistrationPeriod">Đợt đăng ký</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="date"
            className="form-control"
            value={filterFrom}
            onChange={(e) => { setFilterFrom(e.target.value); setPage(1) }}
            placeholder="Từ ngày"
          />
        </div>
        <div className="filter-group">
          <input
            type="date"
            className="form-control"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); setPage(1) }}
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Thực thể</th>
                  <th>Chi tiết</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <i className="fas fa-spinner fa-spin"></i> Đang tải...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center text-danger">
                      Lỗi khi tải nhật ký: {(error as ApiError)?.response?.data?.message || 'Lỗi hệ thống'}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">Không có nhật ký</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.auditLogId}>
                      <td><small>{formatDate(log.timestamp)}</small></td>
                      <td><strong>{log.userName || '—'}</strong></td>
                      <td>
                        <span className={`badge ${getActionClass(log.action || '')}`}>
                          {log.action || '—'}
                        </span>
                      </td>
                      <td>{log.entityType || '—'}</td>
                      <td>
                        <small
                          title={log.details || undefined}
                          style={{ cursor: 'help', maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {log.entityId ? `#${log.entityId} — ` : ''}{log.details || '—'}
                        </small>
                      </td>
                      <td><small className="text-muted">{log.ipAddress || '—'}</small></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logs.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, pagination.totalCount)} / {pagination.totalCount.toLocaleString()}
              </div>
              <div className="pagination">
                <button
                  className="btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <i className="fas fa-chevron-left"></i> Trước
                </button>
                {getPages(safePage, totalPages).map((p) => (
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  Sau <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

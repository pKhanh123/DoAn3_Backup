import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import enrollmentApi from '../../../api/enrollmentApi'
import type { Enrollment, EnrollmentFormData } from '../../../types'

interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
}

interface EnrollmentQueryData {
  data: Enrollment[]
  total?: number
  page?: number
  pageSize?: number
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
  return new Date(d).toLocaleDateString('vi-VN')
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Enrolled': return 'badge-primary'
    case 'Completed': return 'badge-success'
    case 'Dropped': return 'badge-danger'
    default: return 'badge-secondary'
  }
}

export default function EnrollmentAdminPage(): React.JSX.Element {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 20

  const { data: rawData = { data: [] }, isLoading } = useQuery<EnrollmentQueryData>({
    queryKey: ['enrollments', page, filterStatus],
    queryFn: () =>
      enrollmentApi.getAll({ page: page.toString(), pageSize: pageSize.toString() }).then((r: unknown) => {
        const d = (r as { data: unknown }).data
        if (Array.isArray(d)) return { data: d as Enrollment[] }
        const dd = d as Record<string, unknown>
        if (dd?.data && Array.isArray(dd.data)) return { data: dd.data as Enrollment[] }
        return { data: [] }
      }),
    staleTime: 30 * 1000,
  })

  const allEnrollments: Enrollment[] = (rawData as EnrollmentQueryData)?.data || []
  const filtered = search
    ? allEnrollments.filter(
        (e) =>
          e.studentName?.toLowerCase().includes(search.toLowerCase()) ||
          e.studentCode?.toLowerCase().includes(search.toLowerCase()) ||
          e.className?.toLowerCase().includes(search.toLowerCase()) ||
          e.subjectName?.toLowerCase().includes(search.toLowerCase()),
      )
    : allEnrollments

  const filteredByStatus = filterStatus
    ? filtered.filter((e) => e.status === filterStatus)
    : filtered

  // Stats
  const { data: allData = { data: [] } } = useQuery<EnrollmentQueryData>({
    queryKey: ['enrollments-all'],
    queryFn: () =>
      enrollmentApi.getAll({ page: '1', pageSize: '1000' }).then((r: unknown) => {
        const d = (r as { data: unknown }).data
        if (Array.isArray(d)) return { data: d as Enrollment[] }
        const dd = d as Record<string, unknown>
        if (dd?.data && Array.isArray(dd.data)) return { data: dd.data as Enrollment[] }
        return { data: [] }
      }),
    staleTime: 60 * 1000,
  })

  const all: Enrollment[] = (allData as EnrollmentQueryData)?.data || []
  const stats = {
    total: all.length,
    enrolled: all.filter((e) => e.status === 'Enrolled').length,
    completed: all.filter((e) => e.status === 'Completed').length,
    dropped: all.filter((e) => e.status === 'Dropped').length,
  }

  const approveMutation = useMutation<unknown, ApiError, Enrollment>({
    mutationFn: (e) => enrollmentApi.approve(e.enrollmentId),
    onSuccess: () => {
      toast.success('Phê duyệt đăng ký thành công!')
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt')
    },
  })

  const rejectMutation = useMutation<unknown, ApiError, Enrollment>({
    mutationFn: (e) => enrollmentApi.reject(e.enrollmentId),
    onSuccess: () => {
      toast.success('Từ chối đăng ký thành công!')
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối')
    },
  })

  const deleteMutation = useMutation<unknown, ApiError, Enrollment>({
    mutationFn: (e) => enrollmentApi.delete(e.enrollmentId),
    onSuccess: () => {
      toast.success('Xóa đăng ký thành công!')
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa đăng ký')
    },
  })

  const totalPages = Math.max(1, Math.ceil(filteredByStatus.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filteredByStatus.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleDelete(e: Enrollment): void {
    if (!window.confirm(`Xóa đăng ký của "${e.studentName}" cho "${e.className}"?`)) return
    deleteMutation.mutate(e)
  }

  return (
    <div>
      {/* ─── Stats Bar ─────────────────────────────────────────────────── */}
      <div className="row mb-3">
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0">{stats.total}</div>
              <small className="text-muted">Tổng đăng ký</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-primary">{stats.enrolled}</div>
              <small className="text-muted">Đã đăng ký</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-success">{stats.completed}</div>
              <small className="text-muted">Hoàn thành</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-danger">{stats.dropped}</div>
              <small className="text-muted">Đã hủy</small>
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
            placeholder="Tìm kiếm sinh viên, mã SV, lớp, môn..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Enrolled">Đã đăng ký</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Dropped">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Sinh viên</th>
                  <th>Lớp</th>
                  <th>Môn học</th>
                  <th>Học kỳ</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <i className="fas fa-spinner fa-spin"></i> Đang tải...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center">Không có dữ liệu</td>
                  </tr>
                ) : (
                  paginated.map((e) => (
                    <tr key={e.enrollmentId}>
                      <td><strong>{e.studentCode || '—'}</strong></td>
                      <td>{e.studentName || '—'}</td>
                      <td>{e.className || '—'}</td>
                      <td>{e.subjectName || '—'}</td>
                      <td>
                        {e.semester || '—'}
                        {e.academicYear ? ` / ${e.academicYear}` : ''}
                      </td>
                      <td><small>{formatDate(e.enrollmentDate)}</small></td>
                      <td>
                        <span className={`badge ${getStatusClass(e.status || '')}`}>
                          {e.status || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {e.status === 'Enrolled' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => approveMutation.mutate(e)}
                                disabled={approveMutation.isPending}
                                title="Phê duyệt"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => rejectMutation.mutate(e)}
                                disabled={rejectMutation.isPending}
                                title="Từ chối"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          {e.status !== 'Dropped' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(e)}
                              disabled={deleteMutation.isPending}
                              title="Xóa"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredByStatus.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredByStatus.length)} / {filteredByStatus.length}
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

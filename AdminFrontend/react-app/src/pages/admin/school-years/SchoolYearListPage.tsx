import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import schoolYearApi from '../../../api/schoolYearApi'
import type { SchoolYear } from '../../../api/schoolYearApi'

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
  return new Date(d).toLocaleDateString('vi-VN')
}

export default function SchoolYearListPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [search, setSearch] = useState<string>('')
  const [showAutoModal, setShowAutoModal] = useState<boolean>(false)
  const [autoStartYear, setAutoStartYear] = useState<number>(new Date().getFullYear())

  // Fetch all school years
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => schoolYearApi.getAll(),
    staleTime: 60 * 1000,
  })

  const allYears: SchoolYear[] = Array.isArray(rawData?.data)
    ? (rawData?.data as SchoolYear[])
    : ((rawData?.data as Record<string, unknown>)?.data as SchoolYear[]) || []

  const filtered = search
    ? allYears.filter(
        (y) =>
          y.schoolYearId?.toLowerCase().includes(search.toLowerCase()) ||
          y.yearCode?.toLowerCase().includes(search.toLowerCase()) ||
          y.academicYear?.toLowerCase().includes(search.toLowerCase()),
      )
    : allYears

  const stats = {
    total: allYears.length,
    active: allYears.filter((y) => y.isCurrent || y.isActive).length,
  }

  // Auto-create mutation
  const autoCreateMutation = useMutation<unknown, ApiError, void>({
    mutationFn: () => schoolYearApi.autoCreate(autoStartYear),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Tạo năm học tự động thành công!')
      setShowAutoModal(false)
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo năm học tự động')
    },
  })

  // Activate mutation
  const activateMutation = useMutation<unknown, ApiError, SchoolYear>({
    mutationFn: (y) => schoolYearApi.activate(y.schoolYearId),
    onSuccess: () => {
      toast.success('Kích hoạt năm học thành công!')
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể kích hoạt năm học')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation<unknown, ApiError, SchoolYear>({
    mutationFn: (y) => schoolYearApi.delete(y.schoolYearId),
    onSuccess: () => {
      toast.success('Xóa năm học thành công!')
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể xóa năm học')
    },
  })

  function handleDelete(y: SchoolYear): void {
    if (!window.confirm(`Xóa năm học "${y.yearCode || y.schoolYearId}"?`)) return
    deleteMutation.mutate(y)
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="row mb-3">
        <div className="col-md-6 col-6 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0">{stats.total}</div>
              <small className="text-muted">Tổng năm học</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-6 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-success">{stats.active}</div>
              <small className="text-muted">Đang hoạt động</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo mã, niên khóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowAutoModal(true)}
          >
            <i className="fas fa-magic"></i> Tạo tự động
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/school-years/new')}
          >
            <i className="fas fa-plus"></i> Thêm năm học
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã năm học</th>
                  <th>Niên khóa</th>
                  <th>Học kỳ</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      <i className="fas fa-spinner fa-spin"></i> Đang tải...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      {search ? 'Không tìm thấy năm học nào' : 'Chưa có năm học nào'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((y) => (
                    <tr key={y.schoolYearId}>
                      <td><strong>{y.yearCode || y.schoolYearId}</strong></td>
                      <td>{y.academicYear || '—'}</td>
                      <td>{y.semester ? `HK${y.semester}` : '—'}</td>
                      <td>{formatDate(y.startDate || '')}</td>
                      <td>{formatDate(y.endDate || '')}</td>
                      <td>
                        {(y.isCurrent || y.isActive) ? (
                          <span className="badge badge-success">Đang hoạt động</span>
                        ) : (
                          <span className="badge badge-secondary">—</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          {!(y.isCurrent || y.isActive) && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => activateMutation.mutate(y)}
                              disabled={activateMutation.isPending}
                              title="Kích hoạt năm học"
                            >
                              <i className="fas fa-check-circle"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              navigate(`/admin/school-years/${y.schoolYearId}`)
                            }
                          >
                            <i className="fas fa-edit"></i> Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(y)}
                            disabled={deleteMutation.isPending}
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
        </div>
      </div>

      {/* Auto-Create Modal */}
      {showAutoModal && (
        <div className="modal-overlay" onClick={() => setShowAutoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Tạo năm học tự động</h4>
              <button className="btn-close" onClick={() => setShowAutoModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">
                Hệ thống sẽ tự động tạo năm học theo chuẩn VN (Tháng 9 – Tháng 6, 2 học kỳ).
                VD: Năm bắt đầu <strong>{autoStartYear}</strong> → tạo năm học {autoStartYear}–{autoStartYear + 1}.
              </p>
              <div className="form-group mb-3">
                <label>Năm bắt đầu</label>
                <input
                  type="number"
                  className="form-control"
                  value={autoStartYear}
                  onChange={(e) => setAutoStartYear(Number(e.target.value))}
                  min={2000}
                  max={2100}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAutoModal(false)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => autoCreateMutation.mutate()}
                disabled={autoCreateMutation.isPending}
              >
                {autoCreateMutation.isPending ? (
                  <><i className="fas fa-spinner fa-spin"></i> Đang tạo...</>
                ) : (
                  <><i className="fas fa-magic"></i> Tạo tự động</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

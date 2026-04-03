import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import academicYearApi from '../../../api/academicYearApi'
import type { AcademicYear } from '../../../api/academicYearApi'

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

export default function AcademicYearListPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [search, setSearch] = useState<string>('')
  const [showAutoModal, setShowAutoModal] = useState<boolean>(false)
  const [autoStartYear, setAutoStartYear] = useState<number>(new Date().getFullYear())
  const [autoDuration, setAutoDuration] = useState<number>(4)
  const pageSize = 20

  // Fetch all academic years
  const { data: rawData, isLoading } = useQuery<{ success: boolean; data: AcademicYear[] }>({
    queryKey: ['academic-years'],
    queryFn: () => academicYearApi.getAll().then((r) => r.data as { success: boolean; data: AcademicYear[] }),
    staleTime: 60 * 1000,
  })

  const allYears: AcademicYear[] = rawData?.data || []
  const filtered = search
    ? allYears.filter(
        (y) =>
          y.academicYearName?.toLowerCase().includes(search.toLowerCase()) ||
          y.cohortCode?.toLowerCase().includes(search.toLowerCase()) ||
          y.startYear?.toString().includes(search) ||
          y.endYear?.toString().includes(search),
      )
    : allYears

  const stats = {
    total: allYears.length,
    active: allYears.filter((y) => y.isCurrent).length,
  }

  // Auto-create cohort mutation
  const autoCreateMutation = useMutation<unknown, ApiError, void>({
    mutationFn: () =>
      academicYearApi.autoCreateCohort(autoStartYear, autoDuration),
    onSuccess: (res: any) => {
      toast.success(res?.message || `Tạo niên khóa K${autoStartYear} thành công!`)
      setShowAutoModal(false)
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo niên khóa tự động')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation<unknown, ApiError, AcademicYear>({
    mutationFn: (y) => academicYearApi.delete(y.academicYearId),
    onSuccess: () => {
      toast.success('Xóa niên khóa thành công!')
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể xóa niên khóa')
    },
  })

  function handleDelete(y: AcademicYear): void {
    if (!window.confirm(`Xóa niên khóa "${y.cohortCode || y.academicYearName}"?`)) return
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
              <small className="text-muted">Tổng niên khóa</small>
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
            placeholder="Tìm kiếm theo mã, tên, năm..."
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
            onClick={() => navigate('/admin/academic-years/new')}
          >
            <i className="fas fa-plus"></i> Thêm niên khóa
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
                  <th>Mã niên khóa</th>
                  <th>Tên niên khóa</th>
                  <th>Năm bắt đầu</th>
                  <th>Năm kết thúc</th>
                  <th>Thời gian đào tạo</th>
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
                      {search ? 'Không tìm thấy niên khóa nào' : 'Chưa có niên khóa nào'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((y) => (
                    <tr key={y.academicYearId}>
                      <td>
                        <strong>{y.cohortCode || y.academicYearId}</strong>
                      </td>
                      <td>{y.academicYearName || '—'}</td>
                      <td>{y.startYear || '—'}</td>
                      <td>{y.endYear || '—'}</td>
                      <td>{y.durationYears ? `${y.durationYears} năm` : '—'}</td>
                      <td>
                        {y.isCurrent ? (
                          <span className="badge badge-success">Đang hoạt động</span>
                        ) : (
                          <span className="badge badge-secondary">—</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              navigate(`/admin/academic-years/${y.academicYearId}`)
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
              <h4>Tạo niên khóa tự động</h4>
              <button className="btn-close" onClick={() => setShowAutoModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">
                Hệ thống sẽ tự động tạo niên khóa theo chuẩn VN. VD: Năm bắt đầu{' '}
                <strong>2025</strong> → <strong>K25</strong>, thời gian đào tạo 4 năm → 2025–2029.
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
              <div className="form-group mb-3">
                <label>Thời gian đào tạo (năm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={autoDuration}
                  onChange={(e) => setAutoDuration(Number(e.target.value))}
                  min={1}
                  max={10}
                />
              </div>
              <div className="alert alert-info small">
                Sẽ tạo niên khóa <strong>K{autoStartYear}</strong> ({autoStartYear}–{autoStartYear + autoDuration - 1}), {autoDuration} năm đào tạo.
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

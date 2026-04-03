import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import registrationPeriodApi from '../../../api/registrationPeriodApi'
import type {
  RegistrationPeriod,
  CreatePeriodDto,
  UpdatePeriodDto,
} from '../../../api/registrationPeriodApi'

interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
}

interface PeriodForm {
  periodName: string
  periodType: 'NORMAL' | 'RETAKE'
  semester: string
  academicYearId: string
  startDate: string
  endDate: string
}

interface FormErrors {
  periodName?: string
  semester?: string
  startDate?: string
  endDate?: string
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
    case 'OPEN': return 'badge-success'
    case 'CLOSED': return 'badge-secondary'
    case 'UPCOMING': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'OPEN': return 'Đang mở'
    case 'CLOSED': return 'Đã đóng'
    case 'UPCOMING': return 'Sắp mở'
    default: return status || '—'
  }
}

export default function RegistrationPeriodPage(): React.JSX.Element {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 10

  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingPeriod, setEditingPeriod] = useState<RegistrationPeriod | null>(null)
  const [form, setForm] = useState<PeriodForm>({
    periodName: '',
    periodType: 'NORMAL',
    semester: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // ─── Fetch all periods for table ───────────────────────────────────────
  const { data: rawData, isLoading } = useQuery<{ data: RegistrationPeriod[] }>({
    queryKey: ['registration-periods', page, filterType],
    queryFn: () =>
      registrationPeriodApi
        .getAll(filterType || undefined)
        .then((r) => r.data as { data: RegistrationPeriod[] }),
    staleTime: 30 * 1000,
  })

  const allPeriods: RegistrationPeriod[] = rawData?.data || []
  const filtered = search
    ? allPeriods.filter(
        (p) =>
          p.periodName?.toLowerCase().includes(search.toLowerCase()) ||
          p.periodType?.toLowerCase().includes(search.toLowerCase()) ||
          p.semester?.toLowerCase().includes(search.toLowerCase())
      )
    : allPeriods

  // ─── Stats from full list ──────────────────────────────────────────────
  const { data: allData } = useQuery<{ data: RegistrationPeriod[] }>({
    queryKey: ['registration-periods-all'],
    queryFn: () =>
      registrationPeriodApi
        .getAll()
        .then((r) => r.data as { data: RegistrationPeriod[] }),
    staleTime: 60 * 1000,
  })

  const stats = {
    total: (allData?.data || []).length,
    open: (allData?.data || []).filter((p) => p.status === 'OPEN').length,
    closed: (allData?.data || []).filter((p) => p.status === 'CLOSED').length,
  }

  // ─── Mutations ──────────────────────────────────────────────────────────
  const saveMutation = useMutation<unknown, ApiError, void>({
    mutationFn: () => {
      if (editingPeriod) {
        const dto: UpdatePeriodDto = {}
        if (form.periodName) dto.periodName = form.periodName
        if (form.periodType) dto.periodType = form.periodType
        if (form.semester) dto.semester = form.semester
        if (form.academicYearId) dto.academicYearId = form.academicYearId
        if (form.startDate) dto.startDate = form.startDate
        if (form.endDate) dto.endDate = form.endDate
        return registrationPeriodApi.update(editingPeriod.registrationPeriodId, dto)
      } else {
        const dto: CreatePeriodDto = {
          periodName: form.periodName,
          periodType: form.periodType,
          semester: form.semester,
          academicYearId: form.academicYearId,
          startDate: form.startDate,
          endDate: form.endDate,
        }
        return registrationPeriodApi.create(dto)
      }
    },
    onSuccess: () => {
      toast.success(`${editingPeriod ? 'Cập nhật' : 'Tạo'} đợt đăng ký thành công!`)
      setShowModal(false)
      setEditingPeriod(null)
      setForm({ periodName: '', periodType: 'NORMAL', semester: '', academicYearId: '', startDate: '', endDate: '' })
      setFormErrors({})
      queryClient.invalidateQueries({ queryKey: ['registration-periods'] })
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Lỗi khi lưu đợt đăng ký'
      toast.error(msg)
    },
  })

  const openMutation = useMutation<unknown, ApiError, RegistrationPeriod>({
    mutationFn: (period) => registrationPeriodApi.open(period.registrationPeriodId),
    onSuccess: () => {
      toast.success('Đã mở đợt đăng ký thành công!')
      queryClient.invalidateQueries({ queryKey: ['registration-periods'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể mở đợt đăng ký')
    },
  })

  const closeMutation = useMutation<unknown, ApiError, RegistrationPeriod>({
    mutationFn: (period) => registrationPeriodApi.close(period.registrationPeriodId),
    onSuccess: () => {
      toast.success('Đã đóng đợt đăng ký thành công!')
      queryClient.invalidateQueries({ queryKey: ['registration-periods'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể đóng đợt đăng ký')
    },
  })

  const deleteMutation = useMutation<unknown, ApiError, RegistrationPeriod>({
    mutationFn: (period) =>
      registrationPeriodApi.delete(period.registrationPeriodId),
    onSuccess: () => {
      toast.success('Xóa đợt đăng ký thành công!')
      queryClient.invalidateQueries({ queryKey: ['registration-periods'] })
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Không thể xóa đợt đăng ký'
      )
    },
  })

  // ─── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // ─── Validation ────────────────────────────────────────────────────────
  function validateForm(): FormErrors {
    const errs: FormErrors = {}
    if (!form.periodName?.trim()) errs.periodName = 'Tên đợt đăng ký bắt buộc'
    if (!form.startDate) errs.startDate = 'Ngày bắt đầu bắt buộc'
    if (!form.endDate) errs.endDate = 'Ngày kết thúc bắt buộc'
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
    }
    return errs
  }

  function handleSave(): void {
    const errs = validateForm()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    saveMutation.mutate()
  }

  function handleDelete(period: RegistrationPeriod): void {
    if (
      !window.confirm(
        `Xóa đợt đăng ký "${period.periodName}"? Hành động này không thể hoàn tác.`
      )
    )
      return
    deleteMutation.mutate(period)
  }

  function openCreate(): void {
    setEditingPeriod(null)
    setForm({
      periodName: '',
      periodType: 'NORMAL',
      semester: '',
      academicYearId: '',
      startDate: '',
      endDate: '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  function openEdit(p: RegistrationPeriod): void {
    setEditingPeriod(p)
    setForm({
      periodName: p.periodName || '',
      periodType: p.periodType || 'NORMAL',
      semester: p.semester || '',
      academicYearId: p.academicYearId || '',
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  return (
    <div>
      {/* ─── Stats Bar ─────────────────────────────────────────────────── */}
      <div className="row mb-3">
        <div className="col-md-4 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0">{stats.total}</div>
              <small className="text-muted">Tổng đợt</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-success">{stats.open}</div>
              <small className="text-muted">Đang mở</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-4 mb-2">
          <div className="card text-center">
            <div className="card-body py-2">
              <div className="h4 mb-0 text-secondary">{stats.closed}</div>
              <small className="text-muted">Đã đóng</small>
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
            placeholder="Tìm kiếm tên đợt đăng ký..."
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
            <option value="NORMAL">Đăng ký học phần</option>
            <option value="RETAKE">Đăng ký học lại</option>
          </select>
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> Thêm đợt
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
                  <th>Tên đợt</th>
                  <th>Loại</th>
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
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">Không có dữ liệu</td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr key={p.registrationPeriodId}>
                      <td><strong>{p.periodName || '—'}</strong></td>
                      <td>
                        <span className={`badge ${p.periodType === 'NORMAL' ? 'badge-primary' : 'badge-warning'}`}>
                          {p.periodType === 'NORMAL' ? 'Học phần' : 'Học lại'}
                        </span>
                      </td>
                      <td>{p.semester || '—'}</td>
                      <td>{formatDate(p.startDate)}</td>
                      <td>{formatDate(p.endDate)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(p.status)}`}>
                          {getStatusText(p.status)}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {p.status === 'CLOSED' && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => openMutation.mutate(p)}
                              disabled={openMutation.isPending}
                              title="Mở đợt đăng ký"
                            >
                              <i className="fas fa-lock-open"></i>
                            </button>
                          )}
                          {p.status === 'OPEN' && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => closeMutation.mutate(p)}
                              disabled={closeMutation.isPending}
                              title="Đóng đợt đăng ký"
                            >
                              <i className="fas fa-lock"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openEdit(p)}
                          >
                            <i className="fas fa-edit"></i> Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(p)}
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

          {filtered.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} / {filtered.length}
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

      {/* ─── Create/Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                {editingPeriod ? 'Chỉnh sửa đợt đăng ký' : 'Thêm đợt đăng ký mới'}
              </h4>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label>
                  Tên đợt đăng ký <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control${formErrors.periodName ? ' is-invalid' : ''}`}
                  value={form.periodName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, periodName: e.target.value }))
                  }
                  placeholder="VD: Đợt đăng ký HK1 2025-2026"
                />
                {formErrors.periodName && (
                  <div className="invalid-feedback d-block">
                    {formErrors.periodName}
                  </div>
                )}
              </div>

              <div className="form-group mb-3">
                <label>Loại đợt</label>
                <select
                  className="form-control"
                  value={form.periodType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      periodType: e.target.value as 'NORMAL' | 'RETAKE',
                    }))
                  }
                >
                  <option value="NORMAL">Đăng ký học phần</option>
                  <option value="RETAKE">Đăng ký học lại</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Học kỳ</label>
                <input
                  className="form-control"
                  value={form.semester}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, semester: e.target.value }))
                  }
                  placeholder="VD: HK1"
                />
              </div>

              <div className="row">
                <div className="col-6">
                  <div className="form-group mb-3">
                    <label>
                      Ngày bắt đầu <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control${formErrors.startDate ? ' is-invalid' : ''}`}
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startDate: e.target.value }))
                      }
                    />
                    {formErrors.startDate && (
                      <div className="invalid-feedback d-block">
                        {formErrors.startDate}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-group mb-3">
                    <label>
                      Ngày kết thúc <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control${formErrors.endDate ? ' is-invalid' : ''}`}
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endDate: e.target.value }))
                      }
                    />
                    {formErrors.endDate && (
                      <div className="invalid-feedback d-block">
                        {formErrors.endDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <><i className="fas fa-spinner fa-spin"></i> Đang lưu...</>
                ) : (
                  <><i className="fas fa-save"></i> Lưu</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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

interface SchoolYearForm {
  yearCode: string
  semester: number | string
  academicYear: string
  academicYearId: string
  startDate: string
  endDate: string
}

interface FormErrors {
  yearCode?: string
  academicYear?: string
  startDate?: string
  endDate?: string
}

export default function SchoolYearFormPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id) && id !== 'new'

  const [form, setForm] = useState<SchoolYearForm>({
    yearCode: '',
    semester: 1,
    academicYear: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Load existing data
  const { data: existingData } = useQuery({
    queryKey: ['school-year', id],
    queryFn: () => schoolYearApi.getById(id!),
    enabled: isEdit,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (existingData?.data) {
      const d = existingData.data as SchoolYear
      setForm({
        yearCode: d.yearCode || d.schoolYearId || '',
        semester: d.semester || 1,
        academicYear: d.academicYear || '',
        academicYearId: d.academicYearId || '',
        startDate: d.startDate ? d.startDate.split('T')[0] : '',
        endDate: d.endDate ? d.endDate.split('T')[0] : '',
      })
    }
  }, [existingData])

  const saveMutation = useMutation<unknown, ApiError, void>({
    mutationFn: () => {
      const errs = validateForm()
      if (Object.keys(errs).length > 0) throw { validation: errs }
      const payload = {
        yearCode: form.yearCode,
        semester: Number(form.semester),
        academicYear: form.academicYear,
        academicYearId: form.academicYearId,
        startDate: form.startDate,
        endDate: form.endDate,
      }
      if (isEdit) {
        return schoolYearApi.update(id!, payload)
      } else {
        return schoolYearApi.create(payload)
      }
    },
    onSuccess: () => {
      toast.success(`${isEdit ? 'Cập nhật' : 'Tạo'} năm học thành công!`)
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      navigate('/admin/school-years')
    },
    onError: (err: any) => {
      if (err.validation) { setFormErrors(err.validation); return }
      toast.error(err.response?.data?.message || 'Lỗi khi lưu năm học')
    },
  })

  function validateForm(): FormErrors {
    const errs: FormErrors = {}
    if (!form.yearCode?.trim()) errs.yearCode = 'Mã năm học bắt buộc'
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

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>
            {isEdit ? 'Chỉnh sửa năm học' : 'Thêm năm học mới'}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Mã năm học <span className="text-danger">*</span></label>
                <input
                  className={`form-control${formErrors.yearCode ? ' is-invalid' : ''}`}
                  value={form.yearCode}
                  onChange={(e) => setForm((f) => ({ ...f, yearCode: e.target.value }))}
                  placeholder="VD: 2025-2026-HK1"
                  disabled={isEdit}
                />
                {formErrors.yearCode && (
                  <div className="invalid-feedback d-block">{formErrors.yearCode}</div>
                )}
                {isEdit && <small className="text-muted">Mã năm học không thể thay đổi</small>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Học kỳ</label>
                <select
                  className="form-control"
                  value={form.semester}
                  onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Niên khóa</label>
                <input
                  className="form-control"
                  value={form.academicYear}
                  onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
                  placeholder="VD: K25"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Ngày bắt đầu <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className={`form-control${formErrors.startDate ? ' is-invalid' : ''}`}
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
                {formErrors.startDate && (
                  <div className="invalid-feedback d-block">{formErrors.startDate}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Ngày kết thúc <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className={`form-control${formErrors.endDate ? ' is-invalid' : ''}`}
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
                {formErrors.endDate && (
                  <div className="invalid-feedback d-block">{formErrors.endDate}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin/school-years')}
          >
            <i className="fas fa-arrow-left"></i> Quay lại
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
  )
}

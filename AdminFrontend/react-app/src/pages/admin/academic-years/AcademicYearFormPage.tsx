import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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

interface AcademicYearForm {
  cohortCode: string
  academicYearName: string
  startYear: number | string
  endYear: number | string
  durationYears: number | string
}

interface FormErrors {
  cohortCode?: string
  academicYearName?: string
  startYear?: string
  endYear?: string
}

export default function AcademicYearFormPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id) && id !== 'new'

  const [form, setForm] = useState<AcademicYearForm>({
    cohortCode: '',
    academicYearName: '',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
    durationYears: 4,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Load existing data if editing
  const { data: existingData } = useQuery<{ success: boolean; data: AcademicYear }>({
    queryKey: ['academic-year', id],
    queryFn: () => academicYearApi.getById(id!).then((r) => r.data as { success: boolean; data: AcademicYear }),
    enabled: isEdit,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (existingData?.data) {
      const d = existingData.data
      setForm({
        cohortCode: d.cohortCode || '',
        academicYearName: d.academicYearName || '',
        startYear: d.startYear || '',
        endYear: d.endYear || '',
        durationYears: d.durationYears || 4,
      })
    }
  }, [existingData])

  const saveMutation = useMutation<unknown, ApiError, void>({
    mutationFn: () => {
      const errs = validateForm()
      if (Object.keys(errs).length > 0) throw { validation: errs }
      const payload = {
        cohortCode: form.cohortCode,
        academicYearName: form.academicYearName,
        startYear: Number(form.startYear),
        endYear: Number(form.endYear),
        durationYears: Number(form.durationYears),
      }
      if (isEdit) {
        return academicYearApi.update(id!, payload)
      } else {
        return academicYearApi.create(payload)
      }
    },
    onSuccess: () => {
      toast.success(`${isEdit ? 'Cập nhật' : 'Tạo'} niên khóa thành công!`)
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
      navigate('/admin/academic-years')
    },
    onError: (err: any) => {
      if (err.validation) { setFormErrors(err.validation); return }
      toast.error(err.response?.data?.message || 'Lỗi khi lưu niên khóa')
    },
  })

  function validateForm(): FormErrors {
    const errs: FormErrors = {}
    if (!form.cohortCode?.trim()) errs.cohortCode = 'Mã niên khóa bắt buộc'
    if (!form.academicYearName?.trim()) errs.academicYearName = 'Tên niên khóa bắt buộc'
    if (!form.startYear) errs.startYear = 'Năm bắt đầu bắt buộc'
    if (!form.endYear) errs.endYear = 'Năm kết thúc bắt buộc'
    if (form.startYear && form.endYear && Number(form.startYear) >= Number(form.endYear)) {
      errs.endYear = 'Năm kết thúc phải lớn hơn năm bắt đầu'
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
            <i className="fas fa-graduation-cap me-2"></i>
            {isEdit ? 'Chỉnh sửa niên khóa' : 'Thêm niên khóa mới'}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Mã niên khóa <span className="text-danger">*</span></label>
                <input
                  className={`form-control${formErrors.cohortCode ? ' is-invalid' : ''}`}
                  value={form.cohortCode}
                  onChange={(e) => setForm((f) => ({ ...f, cohortCode: e.target.value }))}
                  placeholder="VD: K25"
                  disabled={isEdit}
                />
                {formErrors.cohortCode && (
                  <div className="invalid-feedback d-block">{formErrors.cohortCode}</div>
                )}
                {isEdit && <small className="text-muted">Mã niên khóa không thể thay đổi</small>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Tên niên khóa <span className="text-danger">*</span></label>
                <input
                  className={`form-control${formErrors.academicYearName ? ' is-invalid' : ''}`}
                  value={form.academicYearName}
                  onChange={(e) => setForm((f) => ({ ...f, academicYearName: e.target.value }))}
                  placeholder="VD: Khóa 2025"
                />
                {formErrors.academicYearName && (
                  <div className="invalid-feedback d-block">{formErrors.academicYearName}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Năm bắt đầu <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className={`form-control${formErrors.startYear ? ' is-invalid' : ''}`}
                  value={form.startYear}
                  onChange={(e) => {
                    const sy = Number(e.target.value)
                    setForm((f) => ({
                      ...f,
                      startYear: sy,
                      endYear: sy + Number(f.durationYears) - 1,
                    }))
                  }}
                  min={2000}
                  max={2100}
                />
                {formErrors.startYear && (
                  <div className="invalid-feedback d-block">{formErrors.startYear}</div>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Năm kết thúc <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className={`form-control${formErrors.endYear ? ' is-invalid' : ''}`}
                  value={form.endYear}
                  onChange={(e) => setForm((f) => ({ ...f, endYear: Number(e.target.value) }))}
                  min={2000}
                  max={2100}
                />
                {formErrors.endYear && (
                  <div className="invalid-feedback d-block">{formErrors.endYear}</div>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Thời gian đào tạo (năm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.durationYears}
                  onChange={(e) => {
                    const dur = Number(e.target.value)
                    setForm((f) => ({
                      ...f,
                      durationYears: dur,
                      endYear: Number(f.startYear) + dur - 1,
                    }))
                  }}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin/academic-years')}
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

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'
import { useAuth } from '../../../contexts/AuthContext'
import lookupApi from '../../../api/lookupApi'
import adminClassApi from '../../../api/adminClassApi'
import reportApi from '../../../api/reportApi'

interface GpaItem { name: string; value: number; color: string }
interface WarnItem { name: string; value: number; color: string }
interface DebtItem { range: string; count: number }
interface Filters { schoolYearId: string; semester: string; classId: string }

const GPA_COLORS: Record<string, string> = { excellent: '#28a745', good: '#0d6efd', average: '#ffc107', weak: '#dc3545' }
const WARN_COLORS: Record<string, string> = { lowGpa: '#ffc107', poorAttendance: '#fd7e14', both: '#dc3545' }

export default function AdvisorReportPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<Filters>({ schoolYearId: '', semester: '', classId: '' })
  const advisorId = (user as { advisorId?: number; relatedId?: number })?.advisorId || (user as { advisorId?: number; relatedId?: number })?.relatedId

  const { data: schoolYears = [] } = useQuery({
    queryKey: ['school-years-dropdown'], staleTime: 5 * 60 * 1000,
    queryFn: () => lookupApi.getSchoolYears().then(r => {
      const d = r.data as unknown as { data?: unknown[]; items?: unknown[] }
      const arr = d?.data || d?.items
      return Array.isArray(arr) ? arr : []
    }),
  })

  const { data: adminClasses = [] } = useQuery({
    queryKey: ['advisor-classes', advisorId],
    enabled: !!advisorId, staleTime: 5 * 60 * 1000,
    queryFn: () => adminClassApi.getAll({ advisorId, pageSize: 1000 }).then(r => {
      const d = r.data as unknown as { data?: unknown[]; items?: unknown[] }
      const arr = d?.data || d?.items
      if (Array.isArray(arr)) return arr
      return []
    }),
  })

  const { data: report = {} as Record<string, unknown>, isLoading } = useQuery({
    queryKey: ['advisor-reports', filters],
    enabled: !!filters.classId, staleTime: 0,
    queryFn: () => {
      const params: Record<string, string | number> = { classId: filters.classId }
      if (filters.schoolYearId) params.schoolYearId = filters.schoolYearId
      if (filters.semester) params.semester = filters.semester
      return reportApi.getAdvisorReport(params).then(r => {
        return (r.data as unknown as Record<string, unknown>)?.data || r.data || {}
      })
    },
  })

  const warnings = (report['academicWarnings'] || report['warningStats'] || {}) as Record<string, number>
  const gpaDist = (report['gpaDistribution'] as { excellent?: number; good?: number; average?: number; weak?: number }) || {}
  const creditDebt = (report['creditDebtStats'] || report['creditDebt'] || []) as { range?: string; count?: number }[]

  const gpaData: GpaItem[] = [
    { name: 'Giỏi (≥3.5)', value: gpaDist.excellent ?? 0, color: GPA_COLORS.excellent },
    { name: 'Khá (3.0–3.49)', value: gpaDist.good ?? 0, color: GPA_COLORS.good },
    { name: 'TB (2.0–2.99)', value: gpaDist.average ?? 0, color: GPA_COLORS.average },
    { name: 'Yếu (<2.0)', value: gpaDist.weak ?? 0, color: GPA_COLORS.weak },
  ].filter(d => d.value > 0)

  const warnData: WarnItem[] = [
    { name: 'GPA thấp', value: warnings.lowGpa || 0, color: WARN_COLORS.lowGpa },
    { name: 'Điểm danh kém', value: warnings.poorAttendance || 0, color: WARN_COLORS.poorAttendance },
    { name: 'Cả hai', value: warnings.both || 0, color: WARN_COLORS.both },
  ].filter(d => d.value > 0)

  const debtData: DebtItem[] = (creditDebt as DebtItem[]).map(r => ({
    range: r.range ?? '',
    count: r.count ?? 0,
  }))

  function handleExportExcel() {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { 'Xếp loại': 'Giỏi', 'Số SV': gpaDist.excellent ?? 0 },
      { 'Xếp loại': 'Khá', 'Số SV': gpaDist.good ?? 0 },
      { 'Xếp loại': 'Trung bình', 'Số SV': gpaDist.average ?? 0 },
      { 'Xếp loại': 'Yếu', 'Số SV': gpaDist.weak ?? 0 },
    ]), 'GPA')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debtData.map(r => ({ 'Khoảng nợ': r.range, 'Số SV': r.count }))), 'Nợ tín chỉ')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout]), `BaoCao_CVHT_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Đã tải file Excel!')
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1><i className="fas fa-chart-bar"></i> Báo cáo cố vấn</h1>
          <p className="text-muted mb-0">Thống kê học tập lớp chủ nhiệm</p>
        </div>
        <button className="btn btn-success" onClick={handleExportExcel} disabled={!filters.classId}>
          <i className="fas fa-file-excel"></i> Export Excel
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Lớp chủ nhiệm</label>
              <select className="form-control" value={filters.classId}
                onChange={e => setFilters(f => ({ ...f, classId: e.target.value }))}>
                <option value="">— Chọn lớp —</option>
                {(adminClasses as { adminClassId?: number | string; classCode?: string; className?: string }[]).map(c => (
                  <option key={c.adminClassId} value={c.adminClassId}>{c.classCode} – {c.className}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Năm học</label>
              <select className="form-control" value={filters.schoolYearId}
                onChange={e => setFilters(f => ({ ...f, schoolYearId: e.target.value }))}>
                <option value="">— Tất cả —</option>
                {(schoolYears as { schoolYearId?: number | string; yearName?: string }[]).map(s => (
                  <option key={s.schoolYearId} value={s.schoolYearId}>{s.yearName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Học kỳ</label>
              <select className="form-control" value={filters.semester}
                onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}>
                <option value="">— Tất cả —</option>
                <option value="1">HK1</option><option value="2">HK2</option><option value="3">HK hè</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {!filters.classId && <div className="alert alert-info text-center">Vui lòng chọn lớp chủ nhiệm để xem báo cáo.</div>}
      {isLoading && filters.classId && <div className="text-center py-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>}

      {!isLoading && filters.classId && (
        <>
          <div className="row mb-3">
            {([
              { v: warnings.total || 0, l: 'Cảnh báo HT', c: 'text-danger' },
              { v: warnings.lowGpa || 0, l: 'GPA thấp', c: 'text-warning' },
              { v: warnings.poorAttendance || 0, l: 'Điểm danh kém', c: 'text-info' },
              { v: warnings.both || 0, l: 'Cả hai', c: 'text-danger' },
            ] as { v: number; l: string; c?: string }[]).map(({ v, l, c }, i) => (
              <div className="col-md-3 col-6" key={i}>
                <div className="card text-center"><div className="card-body">
                  <div className={`h3 mb-0 ${c || ''}`}>{v}</div><small>{l}</small>
                </div></div>
              </div>
            ))}
          </div>
          <div className="row mb-3">
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-header"><strong><i className="fas fa-chart-pie"></i> Phân bố GPA</strong></div>
                <div className="card-body">
                  {gpaData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={gpaData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {gpaData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `${v} SV`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="text-center text-muted py-5">Chưa có dữ liệu</div>}
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-header"><strong><i className="fas fa-chart-bar"></i> Cảnh báo học tập</strong></div>
                <div className="card-body">
                  {warnData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={warnData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => `${v} SV`} />
                        <Bar dataKey="count">
                          {warnData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="text-center text-muted py-5">Không có cảnh báo</div>}
                </div>
              </div>
            </div>
          </div>
          {debtData.length > 0 && (
            <div className="card">
              <div className="card-header"><strong><i className="fas fa-chart-bar"></i> Phân bố nợ tín chỉ</strong></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={debtData}>
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v} SV`} />
                    <Bar dataKey="count" fill="#36a2eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

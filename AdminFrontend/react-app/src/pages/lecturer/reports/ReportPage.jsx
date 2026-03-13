import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../../../contexts/AuthContext'
import lookupApi from '../../../api/lookupApi'
import adminClassApi from '../../../api/adminClassApi'
import reportApi from '../../../api/reportApi'

const GPA_COLORS = { excellent: '#28a745', good: '#0d6efd', average: '#ffc107', weak: '#dc3545' }
const ATT_COLORS = { present: '#28a745', late: '#ffc107', absent: '#dc3545', excused: '#17a2b8' }

export default function LecturerReportPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ schoolYearId: '', semester: '', classId: '' })
  const lecturerId = user?.lecturerId || user?.relatedId

  const { data: schoolYears = [] } = useQuery({
    queryKey: ['school-years-dropdown'], staleTime: 5 * 60 * 1000,
    queryFn: () => lookupApi.getSchoolYears().then(r => {
      const d = r.data; return Array.isArray(d) ? d : (d?.data || d?.items || [])
    }),
  })

  const { data: adminClasses = [] } = useQuery({
    queryKey: ['advisor-classes', lecturerId],
    enabled: !!lecturerId, staleTime: 5 * 60 * 1000,
    queryFn: () => adminClassApi.getAll({ advisorId: lecturerId, pageSize: 1000 }).then(r => {
      const d = r.data
      if (d?.data) return d.data
      if (Array.isArray(d)) return d
      return d?.data || d?.items || []
    }),
  })

  const { data: report = {}, isLoading } = useQuery({
    queryKey: ['lecturer-reports', filters],
    enabled: !!filters.classId, staleTime: 0,
    queryFn: () => {
      const params = {}
      if (filters.schoolYearId) params.schoolYearId = filters.schoolYearId
      if (filters.semester) params.semester = filters.semester
      return reportApi.getLecturerReport(filters.classId, params).then(r => {
        const d = r.data; return d?.data || d || {}
      })
    },
  })

  const attStats = report.attendanceStats || {}
  const gpaDist = report.gpaDistribution || {}
  const lowAtt = report.lowAttendanceStudents || []

  const gpaData = [
    { name: 'Giỏi (≥3.5)', value: gpaDist.excellent, color: GPA_COLORS.excellent },
    { name: 'Khá (3.0–3.49)', value: gpaDist.good, color: GPA_COLORS.good },
    { name: 'TB (2.0–2.99)', value: gpaDist.average, color: GPA_COLORS.average },
    { name: 'Yếu (<2.0)', value: gpaDist.weak, color: GPA_COLORS.weak },
  ].filter(d => d.value > 0)

  const attData = [
    { name: 'Có mặt', value: attStats.byStatus?.present || 0, color: ATT_COLORS.present },
    { name: 'Muộn', value: attStats.byStatus?.late || 0, color: ATT_COLORS.late },
    { name: 'Vắng', value: attStats.byStatus?.absent || 0, color: ATT_COLORS.absent },
    { name: 'Có phép', value: attStats.byStatus?.excused || 0, color: ATT_COLORS.excused },
  ].filter(d => d.value > 0)

  function handleExportExcel() {
    const wb = XLSX.utils.book_new()
    const sheet = XLSX.utils.json_to_sheet([
      { 'Xếp loại': 'Giỏi (≥3.5)', 'Số SV': gpaDist.excellent },
      { 'Xếp loại': 'Khá (3.0–3.49)', 'Số SV': gpaDist.good },
      { 'Xếp loại': 'Trung bình (2.0–2.99)', 'Số SV': gpaDist.average },
      { 'Xếp loại': 'Yếu (<2.0)', 'Số SV': gpaDist.weak },
    ])
    XLSX.utils.book_append_sheet(wb, sheet, 'Phân bố GPA')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout]), `BaoCao_GV_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Đã tải file Excel!')
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1><i className="fas fa-chart-bar"></i> Báo cáo giảng viên</h1>
          <p className="text-muted mb-0">Thống kê lớp chủ nhiệm</p>
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
                {adminClasses.map(c => <option key={c.adminClassId} value={c.adminClassId}>{c.classCode} – {c.className}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Năm học</label>
              <select className="form-control" value={filters.schoolYearId}
                onChange={e => setFilters(f => ({ ...f, schoolYearId: e.target.value }))}>
                <option value="">— Tất cả —</option>
                {schoolYears.map(s => <option key={s.schoolYearId} value={s.schoolYearId}>{s.yearName}</option>)}
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
            {[
              { v: attStats.totalStudents || 0, l: 'Tổng SV' },
              { v: attStats.goodAttendance || 0, l: 'Điểm danh tốt', c: 'text-success' },
              { v: attStats.poorAttendance || 0, l: 'Điểm danh kém', c: 'text-danger' },
              { v: (attStats.averageAttendanceRate || 0) + '%', l: 'Tỷ lệ TB' },
            ].map(({ v, l, c }, i) => (
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
                  ) : <div className="text-center text-muted py-5">Chưa có dữ liệu GPA</div>}
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-header"><strong><i className="fas fa-chart-pie"></i> Tình trạng điểm danh</strong></div>
                <div className="card-body">
                  {attData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={attData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {attData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `${v} SV`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="text-center text-muted py-5">Chưa có dữ liệu điểm danh</div>}
                </div>
              </div>
            </div>
          </div>
          {lowAtt.length > 0 && (
            <div className="card">
              <div className="card-header"><strong><i className="fas fa-exclamation-triangle"></i> Sinh viên điểm danh thấp</strong></div>
              <div className="card-body p-0">
                <div className="table-container">
                  <table className="table table-sm mb-0">
                    <thead><tr><th>STT</th><th>Mã SV</th><th>Họ tên</th><th>Tỷ lệ điểm danh</th></tr></thead>
                    <tbody>
                      {lowAtt.map((s, i) => (
                        <tr key={s.studentId || i}>
                          <td>{i + 1}</td><td><strong>{s.studentCode || '—'}</strong></td>
                          <td>{s.fullName || '—'}</td>
                          <td><span className="badge badge-danger">{s.attendanceRate ?? 0}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

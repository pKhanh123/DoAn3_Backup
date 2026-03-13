import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '../../../contexts/AuthContext'
import lookupApi from '../../../api/lookupApi'
import reportApi from '../../../api/reportApi'

const GRADE_COLORS = { A: '#28a745', B: '#0d6efd', C: '#ffc107', D: '#fd7e14', F: '#dc3545' }

export default function StudentReportPage() {
  const { user } = useAuth()
  const [filterYear, setFilterYear] = useState('')
  const studentId = user?.studentId || user?.relatedId

  const { data: schoolYears = [] } = useQuery({
    queryKey: ['school-years-dropdown'], staleTime: 5 * 60 * 1000,
    queryFn: () => lookupApi.getSchoolYears().then(r => {
      const d = r.data; return Array.isArray(d) ? d : (d?.data || d?.items || [])
    }),
  })

  const { data: report = {}, isLoading } = useQuery({
    queryKey: ['student-report', studentId, filterYear],
    enabled: !!studentId, staleTime: 0,
    queryFn: () => {
      const params = {}
      if (filterYear) params.schoolYearId = filterYear
      return reportApi.getStudentReport(studentId, params).then(r => {
        const d = r.data; return d?.data || d || {}
      })
    },
  })

  const overview = report.overview || {}
  const gpaTrend = Array.isArray(report.gpaTrend) ? report.gpaTrend : []
  const gradeDist = report.gradeDistribution || {}
  const creditDebt = report.creditDebt || {}

  const gradeData = [
    { name: 'A', value: gradeDist.A || 0, color: GRADE_COLORS.A },
    { name: 'B', value: gradeDist.B || 0, color: GRADE_COLORS.B },
    { name: 'C', value: gradeDist.C || 0, color: GRADE_COLORS.C },
    { name: 'D', value: gradeDist.D || 0, color: GRADE_COLORS.D },
    { name: 'F', value: gradeDist.F || 0, color: GRADE_COLORS.F },
  ].filter(d => d.value > 0)

  const progress = creditDebt.total && creditDebt.requiredCredits
    ? Math.round((creditDebt.total / creditDebt.requiredCredits) * 100)
    : 0

  function handleExportExcel() {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { 'Họ tên': user?.fullName || '' },
      { 'Mã SV': user?.studentCode || '' },
      { 'GPA tích lũy': overview.cumulativeGpa || 0 },
      { 'Tín chỉ đạt': overview.creditsEarned || 0 },
      { 'Tín chỉ đăng ký': overview.creditsRegistered || 0 },
    ]), 'Tổng quan')
    if (gpaTrend.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gpaTrend.map(t => ({
        'Học kỳ': t.semester || t.label || '',
        'GPA': t.gpa || t.GPA || 0,
      }))), 'Xu hướng GPA')
    }
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout]), `BaoCao_SV_${user?.studentCode || 'student'}_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Đã tải file Excel!')
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1><i className="fas fa-chart-line"></i> Báo cáo cá nhân</h1>
          <p className="text-muted mb-0">Kết quả học tập của bạn</p>
        </div>
        <button className="btn btn-success" onClick={handleExportExcel}>
          <i className="fas fa-file-excel"></i> Export Excel
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Năm học</label>
              <select className="form-control" value={filterYear}
                onChange={e => setFilterYear(e.target.value)}>
                <option value="">— Tất cả —</option>
                {schoolYears.map(s => <option key={s.schoolYearId} value={s.schoolYearId}>{s.yearName}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <div className="text-center py-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>}

      {!isLoading && (
        <>
          {/* Summary cards */}
          <div className="row mb-3">
            {[
              { v: overview.cumulativeGpa || 0, l: 'GPA tích lũy', c: overview.cumulativeGpa >= 3.5 ? 'text-success' : overview.cumulativeGpa >= 2.0 ? 'text-primary' : 'text-danger' },
              { v: (overview.attendanceRate || 0) + '%', l: 'Tỷ lệ điểm danh' },
              { v: overview.creditsEarned || 0, l: 'Tín chỉ đạt' },
              { v: overview.totalSubjects || 0, l: 'Tổng môn học' },
            ].map(({ v, l, c }, i) => (
              <div className="col-md-3 col-6" key={i}>
                <div className="card text-center"><div className="card-body">
                  <div className={`h3 mb-0 ${c || ''}`}>{v}</div><small>{l}</small>
                </div></div>
              </div>
            ))}
          </div>

          {/* GPA Trend */}
          {gpaTrend.length > 0 && (
            <div className="card mb-3">
              <div className="card-header"><strong><i className="fas fa-chart-line"></i> Xu hướng GPA theo học kỳ</strong></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={gpaTrend}>
                    <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `GPA: ${v}`} />
                    <Legend />
                    <Line type="monotone" dataKey="gpa" name="GPA" stroke="#0d6efd" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="row mb-3">
            {/* Grade distribution */}
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-header"><strong><i className="fas fa-chart-pie"></i> Phân bố điểm số</strong></div>
                <div className="card-body">
                  {gradeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={gradeData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {gradeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `${v} môn`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="text-center text-muted py-5">Chưa có dữ liệu</div>}
                </div>
              </div>
            </div>

            {/* Credit progress */}
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-header"><strong><i className="fas fa-graduation-cap"></i> Tiến độ tín chỉ</strong></div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Đã hoàn thành</span>
                      <strong>{creditDebt.total || 0} / {creditDebt.requiredCredits || 120} tín chỉ</strong>
                    </div>
                    <div className="progress" style={{ height: 20 }}>
                      <div className="progress-bar bg-success" style={{ width: Math.min(progress, 100) + '%' }}>
                        {progress}%
                      </div>
                    </div>
                  </div>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="h5 mb-0 text-success">{overview.creditsEarned || 0}</div>
                      <small>Tín chỉ đạt</small>
                    </div>
                    <div className="col-6">
                      <div className="h5 mb-0 text-danger">{Math.max(0, (creditDebt.requiredCredits || 120) - (creditDebt.total || 0))}</div>
                      <small>Còn nợ</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

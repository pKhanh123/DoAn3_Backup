# 🎯 KẾ HOẠCH CHUYỂN ĐỔI ANGULARJS → REACT

> **Repository:** `https://github.com/pKhanh123/DoAn3_student-attendance-system`
> **Branch:** `main2`
> **Frontend:** `AdminFrontend/react-app/` (Vite + React 18)
> **Backend API:** `https://localhost:7033` (Gateway)

---

## 📦 CÔNG NGHỆ SỬ DỤNG

| Package | Version | Mục đích |
|---|---|---|
| `react` + `react-dom` | 18.x | UI framework |
| `vite` | 5.x | Build tool |
| `react-router-dom` | 6.x | Routing |
| `axios` | 1.x | HTTP client |
| `zustand` | 5.x | Global state (nếu cần) |
| `@tanstack/react-query` | 5.x | Server state / data fetching |
| `react-hot-toast` | 2.x | Toast notifications |
| `xlsx` | 0.20.x | Excel import/export |

---

## ✅ GIAI ĐOẠN 1: Khởi tạo Project React + Cấu trúc thư mục
**Trạng thái:** ✅ ĐÃ HOÀN THÀNH

### Việc đã làm
- [x] Tạo React project với Vite: `npm create vite@latest react-app -- --template react`
- [x] Cài dependencies: `react-router-dom`, `axios`, `zustand`, `@tanstack/react-query`, `react-hot-toast`, `xlsx`
- [x] Copy toàn bộ CSS từ `AdminFrontend/css/` sang `src/assets/css/` (9 files)
- [x] Tạo cấu trúc thư mục `src/` theo kiến trúc:
  ```
  src/
  ├── api/              # API calls (axios instances)
  ├── components/
  │   ├── common/       # Shared components (PlaceholderPage)
  │   └── layout/       # Layout (MainLayout)
  ├── contexts/         # React Context (AuthContext)
  ├── hooks/            # Custom hooks
  ├── pages/
  │   ├── auth/         # Login, ForgotPassword, VerifyOTP, ResetPassword
  │   ├── admin/        # 17 sub-pages (users, roles, students, ...)
  │   ├── lecturer/     # 7 sub-pages (attendance, grades, ...)
  │   ├── advisor/      # 12 sub-pages (students, warnings, ...)
  │   └── student/      # 10 sub-pages (timetable, grades, ...)
  ├── routes/           # Route configs (sẽ tách riêng)
  ├── utils/            # Constants, helpers
  └── assets/
      └── css/          # 9 CSS files đã copy
  ```
- [x] Cấu hình `vite.config.js` proxy `/api-edu/*` → `https://localhost:7033`
- [x] Update `main.jsx` import toàn bộ CSS + providers (QueryClient, BrowserRouter, AuthProvider)
- [x] Tạo `App.jsx` với 58 routes + role-based guards (PublicRoute, ProtectedRoute, RootRedirect)
- [x] Tạo 57 placeholder pages cho tất cả routes
- [x] Copy `login-background.png` vào `src/assets/images/`

### Files đã tạo/sửa (Giai đoạn 1)
- `AdminFrontend/react-app/vite.config.js`
- `AdminFrontend/react-app/src/main.jsx`
- `AdminFrontend/react-app/src/App.jsx`
- `AdminFrontend/react-app/src/contexts/AuthContext.jsx`
- `AdminFrontend/react-app/src/components/common/PlaceholderPage.jsx`
- `AdminFrontend/react-app/src/components/layout/MainLayout.jsx`
- `AdminFrontend/react-app/src/utils/constants.js`
- `AdminFrontend/react-app/src/assets/css/` (9 CSS files + fontawesome + webfonts)
- `AdminFrontend/react-app/src/assets/images/login-background.png`
- `AdminFrontend/react-app/src/pages/**/` (57 placeholder files)

### Rủi ro: Thấp — chỉ khởi tạo, không ảnh hưởng code cũ

---

## ✅ GIAI ĐOẠN 2: Xây dựng Login Page thực tế
**Trạng thái:** ✅ ĐÃ HOÀN THÀNH

### Việc đã làm
- [x] Tạo `src/api/index.js` — Axios instance với:
  - Request interceptor: attach `Authorization: Bearer <token>`
  - Response interceptor: tự động refresh token khi nhận 401
- [x] Tạo `src/api/authApi.js` — API methods:
  - `login(username, password)` → POST `/auth/login`
  - `logout(refreshToken)` → POST `/auth/logout`
  - `refreshToken(refreshToken)` → POST `/auth/refresh`
  - `forgotPassword(email)` → POST `/auth/forgot-password`
  - `verifyOTP(email, otp)` → POST `/auth/verify-otp`
  - `resetPassword(email, newPassword, confirmPassword)` → POST `/auth/reset-password`
  - `changePassword(currentPassword, newPassword)` → POST `/auth/change-password`
- [x] Tạo `src/utils/jwt.js` — JWT utilities:
  - `decodeToken(token)` — decode payload
  - `isTokenExpired(token)` — kiểm tra hết hạn
  - `isTokenExpiringSoon(token)` — kiểm tra sắp hết hạn (5 phút)
  - `getTokenExpiry(token)` — lấy thời điểm hết hạn
  - `getRoleFromToken(token)` — lấy role từ JWT payload
- [x] Cập nhật `src/contexts/AuthContext.jsx`:
  - `login(userData, token, refreshToken, rememberMe)` — lưu token, redirect theo role
  - `logout()` — xóa token, gọi API revoke
  - `updateUser(userData)` — cập nhật user info
  - `getRedirectPath(role)` — trả về path theo role
  - Restore session từ localStorage/sessionStorage khi reload
  - Auto-logout khi token expired
- [x] Xây dựng `src/pages/auth/LoginPage.jsx`:
  - Form với username + password
  - Toggle hiện/ẩn mật khẩu (giữ nguyên autofill detection)
  - Checkbox "Ghi nhớ đăng nhập"
  - Link "Quên mật khẩu"
  - Error message theo từng HTTP status (401, 400, 0, 500)
  - Loading spinner khi đang đăng nhập
  - Redirect theo role sau khi login thành công
  - Auth guard chặn truy cập khi đã đăng nhập
  - Giữ nguyên toàn bộ CSS glass morphism từ AngularJS
- [x] Copy `login-background.png` vào `src/assets/images/`

### Files đã tạo/sửa (Giai đoạn 2)
- `AdminFrontend/react-app/src/api/index.js` (mới)
- `AdminFrontend/react-app/src/api/authApi.js` (mới)
- `AdminFrontend/react-app/src/utils/jwt.js` (mới)
- `AdminFrontend/react-app/src/contexts/AuthContext.jsx` (sửa)
- `AdminFrontend/react-app/src/pages/auth/LoginPage.jsx` (sửa)
- `AdminFrontend/react-app/src/assets/images/login-background.png` (copy)

### Tính năng đã chuyển đổi
| Tính năng | AngularJS | React |
|---|---|---|
| Form login | `ng-model` | `useState` |
| Validation | `$scope.login()` | `handleLogin()` với validate |
| API call | `$http.post()` | `axios` + interceptors |
| Token storage | `$window.localStorage/sessionStorage` | `localStorage/sessionStorage` |
| Auto-redirect | `$location.path()` | `useNavigate()` |
| Auth guard | `routeGuard` directive | `ProtectedRoute` component |
| Error handling | `$scope.error` | `error` state + `getErrorMessage()` |
| Password toggle | jQuery + CSS | `useState` + `useRef` |
| Autofill detection | CSS animation + JS timer | `useEffect` timer |

---

## 🔲 GIAI ĐOẠN 3: Xây dựng Auth Pages còn lại
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

### Pages cần xây dựng
- [ ] `ForgotPasswordPage.jsx` — Trang nhập email để gửi OTP
- [ ] `VerifyOTPPage.jsx` — Trang nhập 6 số OTP với countdown timer
- [ ] `ResetPasswordPage.jsx` — Trang đặt lại mật khẩu mới + strength indicator

### Việc cần làm cho mỗi page
1. Đọc AngularJS controller (`ForgotPasswordController`, `VerifyOTPController`, `ResetPasswordController`)
2. Đọc AngularJS HTML templates (trong `index.html`)
3. Chuyển đổi sang React component
4. Giữ nguyên CSS classes đã có trong `login.css`
5. Kết nối API qua `authApi.js`
6. Thêm loading states, error handling, success states

---

## 🔲 GIAI ĐOẠN 4: Xây dựng MainLayout (Sidebar + Topbar)
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

### Việc cần làm
- [ ] Đọc `AdminFrontend/js/sidebar.js` và CSS sidebar từ `main.css`, `components.css`
- [ ] Đọc AngularJS `topbar` directive
- [ ] Xây dựng `MainLayout.jsx`:
  - Sidebar với menu items theo role
  - Topbar với user info, avatar, notification bell
  - Collapse/expand sidebar
  - Active route highlighting
- [ ] Tạo `Sidebar.jsx` component
- [ ] Tạo `Topbar.jsx` component
- [ ] Tạo `NotificationBell.jsx` component (SignalR integration)

### Menu items theo role
| Role | Menu items |
|---|---|
| Admin | Dashboard, Người dùng, Vai trò, Tổ chức, Sinh viên, Giảng viên, Lớp học, Phòng máy, Thời khóa biểu, Báo cáo, Năm học, Kỳ học, Ghi danh, Nhật ký |
| Lecturer | Dashboard, Điểm danh, Nhập điểm, Công thức điểm, Phúc khảo, Thời khóa biểu, Lớp giảng dạy, Báo cáo |
| Advisor | Dashboard, Sinh viên, Cảnh báo, Phúc khảo, Học lại, Công thức điểm, Duyệt đăng ký, Lịch thi, Báo cáo |
| Student | Dashboard, Thời khóa biểu, Điểm số, Điểm danh, Lịch thi, Phúc khảo, Học lại, Đăng ký, Hồ sơ, Báo cáo |

---

## 🔲 GIAI ĐOẠN 5: Xây dựng Dashboard Pages
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

### Pages cần xây dựng
- [ ] `pages/admin/DashboardPage.jsx`
- [ ] `pages/lecturer/DashboardPage.jsx`
- [ ] `pages/advisor/DashboardPage.jsx`
- [ ] `pages/student/DashboardPage.jsx`

### Việc cần làm
1. Đọc AngularJS Dashboard controllers tương ứng
2. Đọc CSS từ `dashboard.css`
3. Chuyển đổi Chart.js → React (dùng `chart.js` + `react-chartjs-2`)
4. Xây dựng stat cards, charts, recent activities
5. Dùng React Query cho data fetching

---

## 🔲 GIAI ĐOẠN 6: Xây dựng Common Components
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

### Components cần tạo
- [ ] `DataTable.jsx` — Bảng dữ liệu với:
  - Sort theo column header
  - Pagination (số trang + page size selector)
  - Search/filter
  - Row selection
  - Action buttons (view, edit, delete)
  - Loading skeleton
  - Empty state

- [ ] `SearchBar.jsx` — Thanh tìm kiếm với debounce
- [ ] `Pagination.jsx` — Component phân trang
- [ ] `SortableHeader.jsx` — Column header có thể sort
- [ ] `FileUpload.jsx` — Upload file (import Excel)
- [ ] `Modal.jsx` — Modal dialog
- [ ] `ConfirmDialog.jsx` — Xác nhận xóa
- [ ] `LoadingSpinner.jsx` — Loading indicator
- [ ] `EmptyState.jsx` — Trạng thái trống
- [ ] `ToastContainer.jsx` — Container cho react-hot-toast

---

## 🔲 GIAI ĐOẠN 7: Xây dựng Admin Pages
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

### Pages theo thứ tự ưu tiên

#### Nhóm 1 — CRUD cơ bản (Ưu tiên cao)
- [ ] `UserListPage.jsx` + `UserFormPage.jsx`
- [ ] `StudentListPage.jsx` + `StudentFormPage.jsx`
- [ ] `LecturerManagePage.jsx`
- [ ] `RoleListPage.jsx`
- [ ] `RoomListPage.jsx`
- [ ] `ClassListPage.jsx`

#### Nhóm 2 — Tổ chức & Cấu hình
- [ ] `OrganizationPage.jsx` (Faculty, Major, Department)
- [ ] `AcademicYearListPage.jsx` + `AcademicYearFormPage.jsx`
- [ ] `SchoolYearListPage.jsx` + `SchoolYearFormPage.jsx`
- [ ] `RegistrationPeriodPage.jsx`

#### Nhóm 3 — Tính năng nâng cao
- [ ] `AdminTimetablePage.jsx` — Quản lý thời khóa biểu
- [ ] `AdminClassListPage.jsx` — Lớp hành chính
- [ ] `SubjectPrerequisitePage.jsx` — Môn học tiên quyết
- [ ] `EnrollmentAdminPage.jsx` — Quản lý đăng ký
- [ ] `AdminReportPage.jsx` — Báo cáo thống kê

#### Nhóm 4 — System
- [ ] `AuditLogPage.jsx` — Nhật ký hệ thống
- [ ] `NotificationPage.jsx` — Thông báo

### Pattern chung cho mỗi List Page
```jsx
// 1. Fetch data với React Query
// 2. State: search, page, pageSize, sortBy, sortOrder, selectedIds
// 3. Search với debounce (300ms)
// 4. Pagination controls
// 5. Bulk actions (delete selected, export)
// 6. Row actions (view, edit, delete)
// 7. Modal form cho create/edit
// 8. Confirm dialog cho delete
```

### Pattern chung cho mỗi Form Page
```jsx
// 1. Fetch existing data nếu có id (edit mode)
// 2. State: formData, errors, loading, submitting
// 3. Validation trước submit
// 4. Gọi API create/update
// 5. Toast notification on success/error
// 6. Redirect về list page
```

---

## 🔲 GIAI ĐOẠN 8: Xây dựng Lecturer Pages
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

- [ ] `AttendancePage.jsx` — Điểm danh sinh viên (với ngày, lớp, môn)
- [ ] `GradeEntryPage.jsx` — Nhập điểm theo lớp, lần điểm
- [ ] `GradeFormulaPage.jsx` — Cấu hình công thức tính điểm
- [ ] `GradeAppealPage.jsx` — Xử lý phúc khảo điểm
- [ ] `TimetablePage.jsx` — Xem thời khóa biểu giảng viên
- [ ] `ClassListPage.jsx` — Danh sách lớp giảng dạy
- [ ] `ReportPage.jsx` — Báo cáo

---

## 🔲 GIAI ĐOẠN 9: Xây dựng Advisor Pages
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

- [ ] `StudentListPage.jsx` — Danh sách sinh viên được phân công
- [ ] `StudentDetailPage.jsx` — Chi tiết sinh viên
- [ ] `StudentProgressPage.jsx` — Theo dõi tiến độ học tập
- [ ] `WarningPage.jsx` — Quản lý cảnh báo học vụ
- [ ] `GradeAppealPage.jsx` — Xử lý phúc khảo
- [ ] `RetakePage.jsx` — Quản lý học lại
- [ ] `GradeFormulaPage.jsx` — Cấu hình công thức điểm
- [ ] `EnrollmentPage.jsx` + `EnrollmentApprovalPage.jsx` — Duyệt đăng ký
- [ ] `ExamSchedulePage.jsx` — Quản lý lịch thi
- [ ] `ExamScorePage.jsx` — Nhập điểm thi
- [ ] `ReportPage.jsx` — Báo cáo

---

## 🔲 GIAI ĐOẠN 10: Xây dựng Student Pages
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

- [ ] `TimetablePage.jsx` — Xem thời khóa biểu
- [ ] `GradesPage.jsx` — Xem điểm các môn học
- [ ] `AttendancePage.jsx` — Xem lịch sử điểm danh
- [ ] `ExamSchedulePage.jsx` — Xem lịch thi
- [ ] `GradeAppealPage.jsx` — Nộp phúc khảo điểm
- [ ] `RetakePage.jsx` + `RetakeRegisterPage.jsx` — Đăng ký học lại
- [ ] `CourseRegisterPage.jsx` — Đăng ký học phần
- [ ] `ProfilePage.jsx` — Hồ sơ cá nhân + đổi mật khẩu
- [ ] `ReportPage.jsx` — Báo cáo cá nhân

---

## 🔲 GIAI ĐOẠN 11: Tích hợp SignalR (Real-time)
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

- [ ] Đọc `AdminFrontend/services/SignalRService.js`
- [ ] Tạo `src/hooks/useSignalR.js` — Custom hook cho SignalR connection
- [ ] Tích hợp notification real-time vào Topbar
- [ ] Real-time updates cho attendance page (giảng viên)

---

## 🔲 GIAI ĐOẠN 12: Kiểm thử & Fix lỗi toàn diện
**Trạng thái:** ⏳ CHƯA BẮT ĐẦU

- [ ] Kiểm tra tất cả routes có thể truy cập được
- [ ] Kiểm tra auth flow: login → dashboard → logout
- [ ] Kiểm tra token refresh khi hết hạn
- [ ] Kiểm tra responsive trên mobile
- [ ] Kiểm tra loading states, error states
- [ ] So sánh UI React với AngularJS (pixel-perfect)
- [ ] Performance check: bundle size, lazy loading

---

## 📊 TIẾN ĐỘ TỔNG HỢP

```
Giai đoạn  1: [████████████████████] 100%  ✅ Khởi tạo Project
Giai đoạn  2: [████████████████████] 100%  ✅ Login Page
Giai đoạn  3: [____________________]   0%   ⏳ Auth Pages còn lại
Giai đoạn  4: [____________________]   0%   ⏳ MainLayout
Giai đoạn  5: [____________________]   0%   ⏳ Dashboard Pages
Giai đoạn  6: [____________________]   0%   ⏳ Common Components
Giai đoạn  7: [____________________]   0%   ⏳ Admin Pages
Giai đoạn  8: [____________________]   0%   ⏳ Lecturer Pages
Giai đoạn  9: [____________________]   0%   ⏳ Advisor Pages
Giai đoạn 10: [____________________]   0%   ⏳ Student Pages
Giai đoạn 11: [____________________]   0%   ⏳ SignalR Integration
Giai đoạn 12: [____________________]   0%   ⏳ Testing & Bug Fix
```

**Tổng tiến độ: ~17%**

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Không xóa AngularJS code** cho đến khi React hoàn toàn tương đương chức năng
2. **Giữ nguyên CSS** — không dùng Bootstrap/Tailwind, dùng custom CSS đã có
3. **API path qua proxy** — tất cả API calls phải qua `/api-edu/*` để Vite proxy sang backend
4. **Git branch `main2`** — tất cả thay đổi push lên nhánh `main2`
5. **Commit theo giai đoạn** — mỗi giai đoạn hoàn thành = 1 commit với message rõ ràng
6. **Backend chạy trước** — đảm bảo `https://localhost:7033` đang chạy trước khi test

---

## 🔧 CÁCH CHẠY PROJECT

```bash
# Terminal 1: Backend API
cd Education_Management_API
dotnet run

# Terminal 2: Frontend React
cd AdminFrontend/react-app
npm install
npm run dev
# Mở http://localhost:5173
```

---

## 📝 COMMIT HISTORY

| Commit | Giai đoạn | Mô tả |
|---|---|---|
| `8792e49` | Giai đoạn 1 | feat: khởi tạo React project với Vite |
| _(sẽ có)_ | Giai đoạn 2 | feat: xây dựng Login Page thực tế |

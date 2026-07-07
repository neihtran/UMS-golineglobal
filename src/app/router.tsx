import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './providers';
import type { User } from '@/types/auth.types';
import { Sidebar, Header } from '@/components/layout';
import { useUIStore } from '@/stores/uiStore';
import { ROLES } from '@/constants/modules';

// ─── Pages ───────────────────────────────────────────────────────────────────
const Login = lazy(() => import('@/pages/auth/Login'));
const MFA = lazy(() => import('@/pages/auth/MFA'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DashboardAdmin = lazy(() => import('@/pages/DashboardAdmin'));
const DashboardBGH = lazy(() => import('@/pages/DashboardBGH'));
const DashboardTruongKhoa = lazy(() => import('@/pages/DashboardTruongKhoa'));
const DashboardGiaoVien = lazy(() => import('@/pages/DashboardGiaoVien'));
const DashboardNhanVien = lazy(() => import('@/pages/DashboardNhanVien'));
const DashboardSinhVien = lazy(() => import('@/pages/DashboardSinhVien'));
const DashboardGV = lazy(() => import('@/pages/DashboardGV'));
const Landing = lazy(() => import('@/pages/Landing'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// IAM
const IAMDashboard = lazy(() => import('@/modules/iam/pages/IAMDashboard'));
const UserList = lazy(() => import('@/modules/iam/pages/UserList'));
const UserDetail = lazy(() => import('@/modules/iam/pages/UserDetail'));
const UserCreate = lazy(() => import('@/modules/iam/pages/UserCreate'));
const AuditLogList = lazy(() => import('@/modules/iam/pages/AuditLogList'));
const RoleList = lazy(() => import('@/modules/iam/pages/RoleList'));
const SessionManagement = lazy(() => import('@/modules/iam/pages/SessionManagement'));
const ApiKeysPage = lazy(() => import('@/modules/iam/pages/ApiKeysPage'));
const SecuritySettings = lazy(() => import('@/modules/iam/pages/SecuritySettings'));
const MFAConfig = lazy(() => import('@/modules/iam/pages/MFAConfig'));
const SystemHealth = lazy(() => import('@/modules/iam/pages/SystemHealth'));
const SystemConfig = lazy(() => import('@/modules/iam/pages/SystemConfig'));
const ResearchList = lazy(() => import('@/modules/rit/pages/ResearchList'));

// HRM
const HRMDashboard = lazy(() => import('@/modules/hrm/pages/HRMDashboard'));
const HRMConfig = lazy(() => import('@/modules/hrm/pages/HRMConfig'));
const VienChucList = lazy(() => import('@/modules/hrm/pages/VienChucList'));
const VienChucDetail = lazy(() => import('@/modules/hrm/pages/VienChucDetail'));
const VienChucCreate = lazy(() => import('@/modules/hrm/pages/VienChucCreate'));
const LeaveRequestForm = lazy(() => import('@/modules/hrm/pages/LeaveRequestForm'));
const LeaveRequestList = lazy(() => import('@/modules/hrm/pages/LeaveRequestList'));
const LeaveBalance = lazy(() => import('@/modules/hrm/pages/LeaveBalance'));
const DepartmentList = lazy(() => import('@/modules/hrm/pages/DepartmentList'));
const RecruitmentList = lazy(() => import('@/modules/hrm/pages/RecruitmentList'));
const DisciplineList = lazy(() => import('@/modules/hrm/pages/DisciplineList'));
const SalarySheet = lazy(() => import('@/modules/hrm/pages/SalarySheet'));
const ContractList = lazy(() => import('@/modules/hrm/pages/ContractList'));
const AppointmentList = lazy(() => import('@/modules/hrm/pages/AppointmentList'));
const AppointmentCreate = lazy(() => import('@/modules/hrm/pages/AppointmentCreate'));

// SIS
const SISDashboard = lazy(() => import('@/modules/sis/pages/SISDashboard'));
const StudentList = lazy(() => import('@/modules/sis/pages/StudentList'));
const StudentDetail = lazy(() => import('@/modules/sis/pages/StudentDetail'));
const StudentEdit = lazy(() => import('@/modules/sis/pages/StudentEdit'));
const StudentEnrollment = lazy(() => import('@/modules/sis/pages/StudentEnrollment'));
const EnrollmentCreate = lazy(() => import('@/modules/sis/pages/EnrollmentCreate'));
const EnrollmentDetail = lazy(() => import('@/modules/sis/pages/EnrollmentDetail'));
const EnrollmentEdit = lazy(() => import('@/modules/sis/pages/EnrollmentEdit'));
const Curriculum = lazy(() => import('@/modules/sis/pages/Curriculum'));
const CurriculumCreate = lazy(() => import('@/modules/sis/pages/CurriculumCreate'));
const CurriculumDetail = lazy(() => import('@/modules/sis/pages/CurriculumDetail'));
const SubjectCreate = lazy(() => import('@/modules/sis/pages/SubjectCreate'));
const SubjectList = lazy(() => import('@/modules/sis/pages/SubjectList'));
const SubjectDetail = lazy(() => import('@/modules/sis/pages/SubjectDetail'));
const SubjectEdit = lazy(() => import('@/modules/sis/pages/SubjectEdit'));
const GraduationList = lazy(() => import('@/modules/sis/pages/GraduationList'));
const GraduationOpenSession = lazy(() => import('@/modules/sis/pages/GraduationOpenSession'));
const GraduationDetail = lazy(() => import('@/modules/sis/pages/GraduationDetail'));
const InternshipList = lazy(() => import('@/modules/sis/pages/InternshipList'));
const InternshipCreate = lazy(() => import('@/modules/sis/pages/InternshipCreate'));
const InternshipDetail = lazy(() => import('@/modules/sis/pages/InternshipDetail'));

// DMS
const DMSDashboard = lazy(() => import('@/modules/dms/pages/DMSDashboard'));
const ApprovalList = lazy(() => import('@/modules/dms/pages/ApprovalList'));
const DraftList = lazy(() => import('@/modules/dms/pages/DraftList'));
const SoanThaoMoiPage = lazy(() => import('@/modules/dms/pages/SoanThaoMoiPage'));
const BanNhapDetailPage = lazy(() => import('@/modules/dms/pages/BanNhapDetailPage'));
const DocumentListPage = lazy(() => import('@/modules/dms/pages/DocumentListPage'));
const DocumentDetailPage = lazy(() => import('@/modules/dms/pages/DocumentDetailPage'));
const SignedDocuments = lazy(() => import('@/modules/dms/pages/SignedDocuments'));
const SignedDocumentDetail = lazy(() => import('@/modules/dms/pages/SignedDocumentDetail'));
const DocStatistics = lazy(() => import('@/modules/dms/pages/DocStatistics'));
const DocSearch = lazy(() => import('@/modules/dms/pages/DocSearch'));

// FIN
const FINDashboard = lazy(() => import('@/modules/fin/pages/FINDashboard'));
const HocPhiList = lazy(() => import('@/modules/fin/pages/HocPhiList'));
const TuitionPage = lazy(() => import('@/modules/fin/pages/TuitionPage'));
const HocPhiDetailPage = lazy(() => import('@/modules/fin/pages/HocPhiDetailPage'));
const ExpensesPage = lazy(() => import('@/modules/fin/pages/ExpensesPage'));
const ChiTieuDetailPage = lazy(() => import('@/modules/fin/pages/ChiTieuDetailPage'));
const CreateTuitionPage = lazy(() => import('@/modules/fin/pages/CreateTuitionPage'));

// LMS
const LMSDashboard = lazy(() => import('@/modules/lms/pages/LMSDashboard'));
const LMSLanding = lazy(() => import('@/modules/lms/pages/LMSLanding'));
const CourseList = lazy(() => import('@/modules/lms/pages/CourseList'));
const CourseDetail = lazy(() => import('@/modules/lms/pages/CourseDetail'));
const CourseCreate = lazy(() => import('@/modules/lms/pages/CourseCreate'));
const CourseEdit = lazy(() => import('@/modules/lms/pages/CourseEdit'));
const AssignmentCreate = lazy(() => import('@/modules/lms/pages/AssignmentCreate'));
const AssignmentView = lazy(() => import('@/modules/lms/pages/AssignmentView'));
const AssignmentGrade = lazy(() => import('@/modules/lms/pages/AssignmentGrade'));
const AssignmentGradingOverview = lazy(() => import('@/modules/lms/pages/AssignmentGradingOverview'));
const AssignmentSubmissionDetail = lazy(() => import('@/modules/lms/pages/AssignmentSubmissionDetail'));
const MaterialUploadPage = lazy(() => import('@/modules/lms/pages/MaterialUploadPage'));
const MaterialDetailPage = lazy(() => import('@/modules/lms/pages/MaterialDetailPage'));
const LMSLibrary = lazy(() => import('@/modules/lms/pages/LMSLibrary'));
const StudentDoAssignment = lazy(() => import('@/modules/lms/pages/StudentDoAssignment'));
const StudentSubmissionDetail = lazy(() => import('@/modules/lms/pages/StudentSubmissionDetail'));
const LMSAssignmentList = lazy(() => import('@/modules/lms/pages/LMSAssignmentList'));
const LMSGradeBook = lazy(() => import('@/modules/lms/pages/GradeBook'));
const CourseContent = lazy(() => import('@/modules/lms/pages/CourseContent'));
const CreateAssignment = lazy(() => import('@/modules/lms/pages/CreateAssignment'));
const StudentAssignments = lazy(() => import('@/modules/lms/pages/StudentAssignments'));

// EXAM
const EXAMDashboard = lazy(() => import('@/modules/exam/pages/EXAMDashboard'));
const ExamMonitor = lazy(() => import('@/modules/exam/pages/ExamMonitor'));
const QuestionBank = lazy(() => import('@/modules/exam/pages/QuestionBank'));
const QuestionCreate = lazy(() => import('@/modules/exam/pages/QuestionCreate'));
const QuestionDetail = lazy(() => import('@/modules/exam/pages/QuestionDetail'));
const QuestionEdit = lazy(() => import('@/modules/exam/pages/QuestionEdit'));
const CreateExam = lazy(() => import('@/modules/exam/pages/CreateExam'));
const ExamSession = lazy(() => import('@/modules/exam/pages/ExamSession'));
const GradeBook = lazy(() => import('@/modules/exam/pages/GradeBook'));
const ExamMonitorList = lazy(() => import('@/modules/exam/pages/ExamMonitorList'));
const QuestionBankFull = lazy(() => import('@/modules/exam/pages/QuestionBankFull'));

// PORTAL
const PORTALDashboard = lazy(() => import('@/modules/portal/pages/PORTALDashboard'));
const PortalCourseRegistration = lazy(() => import('@/modules/portal/pages/PortalCourseRegistration'));
const PortalExamSchedule = lazy(() => import('@/modules/portal/pages/PortalExamSchedule'));
const PortalGradeLookup = lazy(() => import('@/modules/portal/pages/PortalGradeLookup'));
const PortalKTXRegistration = lazy(() => import('@/modules/portal/pages/PortalKTXRegistration'));
const PortalAnnouncementCreate = lazy(() => import('@/modules/portal/pages/PortalAnnouncementCreate'));
const StudentSchedule = lazy(() => import('@/modules/portal/pages/StudentSchedule'));
const StudentTuitionPortal = lazy(() => import('@/modules/portal/pages/StudentTuitionPortal'));
const StudentProfile = lazy(() => import('@/modules/portal/pages/StudentProfile'));
const LecturerDashboard = lazy(() => import('@/modules/portal/pages/LecturerDashboard'));
const LecturerCourseDetail = lazy(() => import('@/modules/portal/pages/LecturerCourseDetail'));
const ExamResult = lazy(() => import('@/modules/portal/pages/ExamResult'));
const NotificationCenter = lazy(() => import('@/modules/portal/pages/NotificationCenter'));
const NotificationList = lazy(() => import('@/modules/portal/pages/NotificationList'));
const ResearchProjectListPage = lazy(() => import('@/modules/rit/pages/ResearchProjectListPage'));
const QAComplaintPage = lazy(() => import('@/modules/qa/pages/QAComplaintPage'));
const QAComplaintDetail = lazy(() => import('@/modules/qa/pages/ComplaintDetail'));
const LIBDashboard = lazy(() => import('@/modules/lib/pages/LIBDashboard'));
const BookList = lazy(() => import('@/modules/lib/pages/BookList'));
const BookSearch = lazy(() => import('@/modules/lib/pages/BookSearch'));
const BookLoan = lazy(() => import('@/modules/lib/pages/BookLoan'));
const BookDetailPage = lazy(() => import('@/modules/lib/pages/BookDetailPage'));
const CreateBookPage = lazy(() => import('@/modules/lib/pages/CreateBookPage'));
const CreateLoanPage = lazy(() => import('@/modules/lib/pages/CreateLoanPage'));
const LoanDetailPage = lazy(() => import('@/modules/lib/pages/LoanDetailPage'));

// WMS
const WMSDashboard = lazy(() => import('@/modules/wms/pages/WMSDashboard'));
const TaskList = lazy(() => import('@/modules/wms/pages/TaskList'));
const TaskBoard = lazy(() => import('@/modules/wms/pages/TaskBoard'));
const WMSNotification = lazy(() => import('@/modules/wms/pages/WMSNotification'));
const TaskCreateForm = lazy(() => import('@/modules/wms/pages/TaskCreateForm'));
const TaskDetail = lazy(() => import('@/modules/wms/pages/TaskDetail'));

function TaskDetailPage() {
  return <TaskDetail />;
}

// KTX
const KTXDashboard = lazy(() => import('@/modules/ktx/pages/KTXDashboard'));
const RoomRegistration = lazy(() => import('@/modules/ktx/pages/RoomRegistration'));
const KTXRoomPage = lazy(() => import('@/modules/ktx/pages/KTXRoomPage'));
const RoomDetailPage = lazy(() => import('@/modules/ktx/pages/RoomDetailPage'));
const TenantList = lazy(() => import('@/modules/ktx/pages/TenantList'));
const ThuPhiKTX = lazy(() => import('@/modules/ktx/pages/ThuPhiKTX'));
const SuCoKTX = lazy(() => import('@/modules/ktx/pages/SuCoKTX'));
const SinhHoatKTX = lazy(() => import('@/modules/ktx/pages/SinhHoatKTX'));

// RIT
const RITDashboard = lazy(() => import('@/modules/rit/pages/RITDashboard'));
const NckhDetailPage = lazy(() => import('@/modules/rit/pages/NckhDetailPage'));
const ResearchDetail = lazy(() => import('@/modules/rit/pages/ResearchDetail'));
const ResearchMemberList = lazy(() => import('@/modules/rit/pages/MemberList'));
const MemberDetailPage = lazy(() => import('@/modules/rit/pages/MemberDetailPage'));
const CreateMemberPage = lazy(() => import('@/modules/rit/pages/CreateMemberPage'));
const CreateProjectPage = lazy(() => import('@/modules/rit/pages/CreateProjectPage'));
const HopTacQuocTe = lazy(() => import('@/modules/rit/pages/HopTacQuocTe'));

// BI
const BIDashboard = lazy(() => import('@/modules/bi/pages/BIDashboard'));
const BaoCaoList = lazy(() => import('@/modules/bi/pages/BaoCaoList'));
const CreateReportPage = lazy(() => import('@/modules/bi/pages/CreateReportPage'));
const KPIsPage = lazy(() => import('@/modules/bi/pages/KPIsPage'));

// INT
const INTDashboard = lazy(() => import('@/modules/int/pages/INTDashboard'));
const IntegrationList = lazy(() => import('@/modules/int/pages/IntegrationList'));
const IntegrationDetail = lazy(() => import('@/modules/int/pages/IntegrationDetail'));
const IntegrationLogs = lazy(() => import('@/modules/int/pages/IntegrationLogs'));

// OCR
const OCRDashboard = lazy(() => import('@/modules/ocr/pages/OCRDashboard'));
const ScanList = lazy(() => import('@/modules/ocr/pages/ScanList'));
const ScanDetail = lazy(() => import('@/modules/ocr/pages/ScanDetail'));

// DCE
const DCEDashboard = lazy(() => import('@/modules/dce/pages/DCEDashboard'));
const CompetencyList = lazy(() => import('@/modules/dce/pages/CompetencyList'));
const CourseCatalog = lazy(() => import('@/modules/dce/pages/CourseCatalog'));
const CourseCatalogFull = lazy(() => import('@/modules/dce/pages/CourseCatalogFull'));
const DCECourseDetail = lazy(() => import('@/modules/dce/pages/CourseDetail'));
const CompetencyCreate = lazy(() => import('@/modules/dce/pages/CompetencyCreate'));
const CompetencyDetail = lazy(() => import('@/modules/dce/pages/CompetencyDetail'));
const DCECourseCreate = lazy(() => import('@/modules/dce/pages/CourseCreate'));

// PMS
const PMSDashboard = lazy(() => import('@/modules/pms/pages/PMSDashboard'));
const PMSMemberListPage = lazy(() => import('@/modules/pms/pages/MemberListPage'));
const PMSReportListPage = lazy(() => import('@/modules/pms/pages/ReportListPage'));
const PMSMemberListFull = lazy(() => import('@/modules/pms/pages/MemberListFull'));
const PMSMemberDetailPage = lazy(() => import('@/modules/pms/pages/MemberDetailPage'));
const PMSCreateMemberPage = lazy(() => import('@/modules/pms/pages/CreateMemberPage'));
const PMSReportDetailPage = lazy(() => import('@/modules/pms/pages/ReportDetailPage'));

// QA
const QADashboard = lazy(() => import('@/modules/qa/pages/QADashboard'));
const QAReviewPage = lazy(() => import('@/modules/qa/pages/QAReviewPage'));
const QAReportListFull = lazy(() => import('@/modules/qa/pages/ReportListFull'));
const QAReportCreate = lazy(() => import('@/modules/qa/pages/ReportCreate'));
const QAReportDetail = lazy(() => import('@/modules/qa/pages/ReportDetail'));
const QAEvidenceList = lazy(() => import('@/modules/qa/pages/EvidenceList'));
const QAReviewDetail = lazy(() => import('@/modules/qa/pages/ReviewDetail'));
const QAReviewEvidence = lazy(() => import('@/modules/qa/pages/ReviewEvidence'));
const QATaiSanPage = lazy(() => import('@/modules/qa/pages/QATaiSanPage'));
const QATaiSanCreate = lazy(() => import('@/modules/qa/pages/QATaiSanCreate'));
const QATaiSanDetail = lazy(() => import('@/modules/qa/pages/QATaiSanDetail'));
const QATaiSanEdit = lazy(() => import('@/modules/qa/pages/QATaiSanEdit'));
const QATaiSanMaintenance = lazy(() => import('@/modules/qa/pages/QATaiSanMaintenance'));
const QACsvcPage = lazy(() => import('@/modules/qa/pages/QACsvcPage'));
const QACsvcCreate = lazy(() => import('@/modules/qa/pages/QACsvcCreate'));
const QACsvcDetail = lazy(() => import('@/modules/qa/pages/QACsvcDetail'));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--border))] border-t-[rgb(var(--primary))]" />
    </div>
  );
}

// ─── Auth guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── Role guard ──────────────────────────────────────────────────────────────
function getRoleDashboard(role?: string): string {
  if (!role) return '/dashboard';
  if (role === ROLES.ADMIN) return '/dashboard/admin';
  if (role === ROLES.HIEU_TRUONG || role === ROLES.PHO_HIEU_TRUONG) return '/dashboard/bgh';
  if (role === ROLES.TRUONG_KHOA) return '/dashboard/truong-khoa';
  return '/dashboard/gv';
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles?: User['role'][] }) {
  const { user, hasRole, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (roles && !hasRole(roles)) return <Navigate to={getRoleDashboard(user?.role)} replace />;
  return <>{children}</>;
}

// ─── App Shell layout ────────────────────────────────────────────────────────
function AppShellLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg-base))]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ paddingLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      >
        <Header onMenuToggle={toggleSidebar} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/mfa" element={<MFA />} />

        {/* Protected */}
        <Route element={<ProtectedRoute><AppShellLayout /></ProtectedRoute>}>

          {/* Dashboard — all roles */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/admin" element={<RoleRoute roles={[ROLES.ADMIN]}><DashboardAdmin /></RoleRoute>} />
          <Route path="/dashboard/bgh" element={<RoleRoute roles={[ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DashboardBGH /></RoleRoute>} />
          <Route path="/dashboard/truong-khoa" element={<RoleRoute roles={[ROLES.TRUONG_KHOA]}><DashboardTruongKhoa /></RoleRoute>} />
          <Route path="/dashboard/giao-vien" element={<RoleRoute roles={[ROLES.GIAO_VIEN]}><DashboardGiaoVien /></RoleRoute>} />
          <Route path="/dashboard/nhan-vien" element={<RoleRoute roles={[ROLES.NHAN_VIEN]}><DashboardNhanVien /></RoleRoute>} />
          <Route path="/dashboard/sinh-vien" element={<RoleRoute roles={[ROLES.SINH_VIEN]}><DashboardSinhVien /></RoleRoute>} />
          <Route path="/thong-bao" element={<NotificationCenter />} />

          {/* IAM — admin only */}
          <Route path="/iam" element={<RoleRoute roles={[ROLES.ADMIN]}><IAMDashboard /></RoleRoute>} />
          <Route path="/iam/tai-khoan" element={<RoleRoute roles={[ROLES.ADMIN]}><UserList /></RoleRoute>} />
          <Route path="/iam/tai-khoan/tao" element={<RoleRoute roles={[ROLES.ADMIN]}><UserCreate /></RoleRoute>} />
          <Route path="/iam/tai-khoan/:id" element={<RoleRoute roles={[ROLES.ADMIN]}><UserDetail /></RoleRoute>} />
          <Route path="/iam/nhat-ky" element={<RoleRoute roles={[ROLES.ADMIN]}><AuditLogList /></RoleRoute>} />
          <Route path="/iam/vai-tro" element={<RoleRoute roles={[ROLES.ADMIN]}><RoleList /></RoleRoute>} />
          <Route path="/iam/phien-dang-nhap" element={<RoleRoute roles={[ROLES.ADMIN]}><SessionManagement /></RoleRoute>} />
          <Route path="/iam/api-keys" element={<RoleRoute roles={[ROLES.ADMIN]}><ApiKeysPage /></RoleRoute>} />
          <Route path="/iam/bao-mat" element={<RoleRoute roles={[ROLES.ADMIN]}><SecuritySettings /></RoleRoute>} />
          <Route path="/iam/mfa" element={<RoleRoute roles={[ROLES.ADMIN]}><MFAConfig /></RoleRoute>} />
          <Route path="/iam/trang-thai-he-thong" element={<RoleRoute roles={[ROLES.ADMIN]}><SystemHealth /></RoleRoute>} />
          <Route path="/iam/cai-dat-he-thong" element={<RoleRoute roles={[ROLES.ADMIN]}><SystemConfig /></RoleRoute>} />

          {/* HRM — admin + nhan-vien + BGH */}
          <Route path="/hrm" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><HRMDashboard /></RoleRoute>} />
          <Route path="/hrm/don-vi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DepartmentList /></RoleRoute>} />
          <Route path="/hrm/vien-chuc" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><VienChucList /></RoleRoute>} />
          <Route path="/hrm/vien-chuc/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><VienChucCreate /></RoleRoute>} />
          <Route path="/hrm/vien-chuc/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><VienChucDetail /></RoleRoute>} />
          <Route path="/hrm/nghi-phep" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><LeaveRequestList /></RoleRoute>} />
          <Route path="/hrm/nghi-phep/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><LeaveRequestForm /></RoleRoute>} />
          <Route path="/hrm/nghi-phep/so-du" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><LeaveBalance /></RoleRoute>} />
          <Route path="/hrm/tuyen-dung" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><RecruitmentList /></RoleRoute>} />
          <Route path="/hrm/ky-luat" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DisciplineList /></RoleRoute>} />
          <Route path="/hrm/luong" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SalarySheet /></RoleRoute>} />
          <Route path="/hrm/hop-dong" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><ContractList /></RoleRoute>} />
          <Route path="/hrm/bo-nhiem" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><AppointmentList /></RoleRoute>} />
          <Route path="/hrm/bo-nhiem/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><AppointmentCreate /></RoleRoute>} />
          <Route path="/hrm/cau-hinh" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><HRMConfig /></RoleRoute>} />

          {/* SIS — admin + giang-vien + nhan-vien + BGH */}
          <Route path="/sis" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SISDashboard /></RoleRoute>} />
          <Route path="/sis/sinh-vien" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><StudentList /></RoleRoute>} />
          <Route path="/sis/sinh-vien/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><StudentDetail /></RoleRoute>} />
          <Route path="/sis/sinh-vien/:id/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><StudentEdit /></RoleRoute>} />
          <Route path="/sis/mon-hoc" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SubjectList /></RoleRoute>} />
          <Route path="/sis/dang-ky-hoc-phan" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><StudentEnrollment /></RoleRoute>} />
          <Route path="/sis/dang-ky" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><StudentEnrollment /></RoleRoute>} />
          <Route path="/sis/dang-ky-hoc-phan/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><EnrollmentCreate /></RoleRoute>} />
          <Route path="/sis/dang-ky-hoc-phan/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><EnrollmentDetail /></RoleRoute>} />
          <Route path="/sis/dang-ky-hoc-phan/:id/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><EnrollmentEdit /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><Curriculum /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><CurriculumCreate /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao/mon-hoc" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SubjectList /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao/mon-hoc/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SubjectCreate /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao/mon-hoc/:code" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SubjectDetail /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao/mon-hoc/:code/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SubjectEdit /></RoleRoute>} />
          <Route path="/sis/chuong-trinh-dao-tao/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><CurriculumDetail /></RoleRoute>} />
          <Route path="/sis/tot-nghiep" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><GraduationList /></RoleRoute>} />
          <Route path="/sis/tot-nghiep/mo-dot" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><GraduationOpenSession /></RoleRoute>} />
          <Route path="/sis/tot-nghiep/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><GraduationDetail /></RoleRoute>} />
          <Route path="/sis/thuc-tap" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><InternshipList /></RoleRoute>} />
          <Route path="/sis/thuc-tap/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><InternshipCreate /></RoleRoute>} />
          <Route path="/sis/thuc-tap/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><InternshipDetail /></RoleRoute>} />

          {/* DMS — admin + nhan-vien + BGH */}
          <Route path="/dms" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DMSDashboard /></RoleRoute>} />
          <Route path="/dms/soan-thao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><SoanThaoMoiPage /></RoleRoute>} />
          <Route path="/dms/soan-thao/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><SoanThaoMoiPage /></RoleRoute>} />
          <Route path="/dms/ban-nhap" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><DraftList /></RoleRoute>} />
          <Route path="/dms/ban-nhap/:id/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><SoanThaoMoiPage /></RoleRoute>} />
          <Route path="/dms/ban-nhap/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><BanNhapDetailPage /></RoleRoute>} />
          <Route path="/dms/cho-ky" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DocumentListPage /></RoleRoute>} />
          <Route path="/dms/cho-ky/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DocumentDetailPage /></RoleRoute>} />
          <Route path="/dms/da-ky" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SignedDocuments /></RoleRoute>} />
          <Route path="/dms/van-ban-da-ky" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SignedDocuments /></RoleRoute>} />
          <Route path="/dms/van-ban-da-ky/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SignedDocumentDetail /></RoleRoute>} />
          <Route path="/dms/thong-ke" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DocStatistics /></RoleRoute>} />
          <Route path="/dms/tra-cuu" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><DocSearch /></RoleRoute>} />
          <Route path="/dms/phe-duyet" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><ApprovalList /></RoleRoute>} />

          {/* FIN — admin + nhan-vien + BGH */}
          <Route path="/fin" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><FINDashboard /></RoleRoute>} />
          <Route path="/fin/hoc-phi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><TuitionPage /></RoleRoute>} />
          <Route path="/fin/hoc-phi/danh-sach" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><HocPhiList /></RoleRoute>} />
          <Route path="/fin/hoc-phi/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><CreateTuitionPage /></RoleRoute>} />
          <Route path="/fin/hoc-phi/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><HocPhiDetailPage /></RoleRoute>} />
          <Route path="/fin/chi-tieu" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><ExpensesPage /></RoleRoute>} />
          <Route path="/fin/chi-tieu/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><ChiTieuDetailPage /></RoleRoute>} />

          {/* LMS — admin + giang-vien + sinh-vien */}
          <Route path="/lms" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><LMSDashboard /></RoleRoute>} />
          <Route path="/lms/gioi-thieu" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><LMSLanding /></RoleRoute>} />
          <Route path="/lms/khoa-hoc" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><CourseList /></RoleRoute>} />
          <Route path="/lms/khoa-hoc/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><CourseCreate /></RoleRoute>} />
          <Route path="/lms/khoa-hoc/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><CourseDetail /></RoleRoute>} />
          <Route path="/lms/khoa-hoc/:id/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><CourseEdit /></RoleRoute>} />
          <Route path="/lms/khoa-hoc/:id/bai-tap/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><CreateAssignment /></RoleRoute>} />
          <Route path="/lms/bai-tap-sinh-vien" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><LMSAssignmentList /></RoleRoute>} />
          <Route path="/lms/bai-tap-cua-toi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><StudentAssignments /></RoleRoute>} />
          <Route path="/lms/bai-tap/:id/lam-bai" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><StudentDoAssignment /></RoleRoute>} />
          <Route path="/lms/bai-tap/:id/xem-bai-nop/:submissionId" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><StudentSubmissionDetail /></RoleRoute>} />
          <Route path="/lms/bai-tap/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><AssignmentCreate /></RoleRoute>} />
          <Route path="/lms/bai-tap/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><AssignmentView /></RoleRoute>} />
          <Route path="/lms/bai-tap/:id/cham" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><AssignmentGradingOverview /></RoleRoute>} />
          <Route path="/lms/bai-tap/:id/cham/:submissionId" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><AssignmentGrade /></RoleRoute>} />
          <Route path="/lms/bai-tap/:id/xem/:submissionId" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><AssignmentSubmissionDetail /></RoleRoute>} />
          <Route path="/lms/thu-vien-hoc-lieu" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><LMSLibrary /></RoleRoute>} />
          <Route path="/lms/thu-vien-hoc-lieu/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><MaterialDetailPage /></RoleRoute>} />
          <Route path="/lms/thu-vien-hoc-lieu/them" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><MaterialUploadPage /></RoleRoute>} />
          <Route path="/lms/thu-vien-hoc-lieu/:id/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><MaterialUploadPage /></RoleRoute>} />
          <Route path="/lms/bang-diem" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><LMSGradeBook /></RoleRoute>} />
          <Route path="/lms/noi-dung-khoa-hoc" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><CourseContent /></RoleRoute>} />

          {/* EXAM — admin + giang-vien + sinh-vien */}
          <Route path="/exam" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><EXAMDashboard /></RoleRoute>} />
          <Route path="/exam/ngan-hang-cau-hoi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><QuestionBank /></RoleRoute>} />
          <Route path="/exam/ngan-hang-cau-hoi/them" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><QuestionCreate /></RoleRoute>} />
          <Route path="/exam/ngan-hang-cau-hoi/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><QuestionDetail /></RoleRoute>} />
          <Route path="/exam/ngan-hang-cau-hoi/:id/sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><QuestionEdit /></RoleRoute>} />
          <Route path="/exam/tao-thi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><CreateExam /></RoleRoute>} />
          <Route path="/exam/giam-sat" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><ExamMonitor /></RoleRoute>} />
          <Route path="/exam/giam-sat/ds" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><ExamMonitorList /></RoleRoute>} />
          <Route path="/exam/ngan-hang-cau-hoi/ds" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><QuestionBankFull /></RoleRoute>} />
          <Route path="/exam/ca-thi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><ExamSession /></RoleRoute>} />
          <Route path="/exam/bang-diem" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN]}><GradeBook /></RoleRoute>} />

          {/* PORTAL — role-based routes */}
          <Route path="/portal" element={<PORTALDashboard />} />
          {/* Sinh viên */}
          <Route path="/portal/dkHP" element={<RoleRoute roles={[ROLES.SINH_VIEN, ROLES.ADMIN, ROLES.GIAO_VIEN]}><PortalCourseRegistration /></RoleRoute>} />
          <Route path="/portal/lich-thi" element={<RoleRoute roles={[ROLES.SINH_VIEN, ROLES.ADMIN, ROLES.GIAO_VIEN]}><PortalExamSchedule /></RoleRoute>} />
          <Route path="/portal/diem" element={<RoleRoute roles={[ROLES.SINH_VIEN, ROLES.ADMIN, ROLES.GIAO_VIEN]}><PortalGradeLookup /></RoleRoute>} />
          <Route path="/portal/ktx" element={<RoleRoute roles={[ROLES.SINH_VIEN, ROLES.ADMIN, ROLES.GIAO_VIEN]}><PortalKTXRegistration /></RoleRoute>} />
          <Route path="/portal/thong-bao/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><PortalAnnouncementCreate /></RoleRoute>} />
          <Route path="/portal/lich-hoc" element={<RoleRoute roles={[ROLES.SINH_VIEN]}><StudentSchedule /></RoleRoute>} />
          <Route path="/portal/diem-thi" element={<RoleRoute roles={[ROLES.SINH_VIEN]}><ExamResult /></RoleRoute>} />
          <Route path="/portal/hoc-phi" element={<RoleRoute roles={[ROLES.SINH_VIEN]}><StudentTuitionPortal /></RoleRoute>} />
          <Route path="/portal/thong-bao" element={<NotificationList />} />
          <Route path="/portal/ho-so" element={<RoleRoute roles={[ROLES.SINH_VIEN]}><StudentProfile /></RoleRoute>} />
          {/* Giảng viên */}
          <Route path="/portal/giang-vien" element={<RoleRoute roles={[ROLES.GIAO_VIEN]}><LecturerDashboard /></RoleRoute>} />
          <Route path="/portal/giang-vien/lop/:id" element={<RoleRoute roles={[ROLES.GIAO_VIEN]}><LecturerCourseDetail /></RoleRoute>} />

          {/* LIB — admin + giang-vien + sinh-vien + nhan-vien */}
          <Route path="/lib" element={<LIBDashboard />} />
          <Route path="/lib/tai-lieu/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><CreateBookPage /></RoleRoute>} />
          <Route path="/lib/tai-lieu/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><BookDetailPage /></RoleRoute>} />
          <Route path="/lib/tai-lieu" element={<BookList />} />
          <Route path="/lib/tim-kiem" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.NHAN_VIEN]}><BookSearch /></RoleRoute>} />
          <Route path="/lib/muon/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN]}><CreateLoanPage /></RoleRoute>} />
          <Route path="/lib/muon/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN]}><LoanDetailPage /></RoleRoute>} />
          <Route path="/lib/muon-tra" element={<BookLoan />} />

          {/* WMS — admin + giang-vien + nhan-vien + BGH */}
          <Route path="/wms" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><WMSDashboard /></RoleRoute>} />
          <Route path="/wms/cong-viec" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><TaskList /></RoleRoute>} />
          <Route path="/wms/cong-viec/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><TaskDetailPage /></RoleRoute>} />
          <Route path="/wms/cong-viec-cua-toi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><WMSNotification /></RoleRoute>} />
          <Route path="/wms/kanban" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><TaskBoard /></RoleRoute>} />
          <Route path="/wms/tao-cv" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN]}><TaskCreateForm /></RoleRoute>} />

          {/* KTX — admin + nhan-vien + giang-vien + BGH */}
          <Route path="/ktx" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><KTXDashboard /></RoleRoute>} />
          <Route path="/ktx/phong/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><RoomDetailPage /></RoleRoute>} />
          <Route path="/ktx/phong" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><KTXRoomPage /></RoleRoute>} />
          <Route path="/ktx/dang-ky" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><RoomRegistration /></RoleRoute>} />
          <Route path="/ktx/sinh-vien" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><TenantList /></RoleRoute>} />
          <Route path="/ktx/thu-phi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><ThuPhiKTX /></RoleRoute>} />
          <Route path="/ktx/su-co" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SuCoKTX /></RoleRoute>} />
          <Route path="/ktx/sinh-hoat" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><SinhHoatKTX /></RoleRoute>} />

          {/* RIT — admin + giang-vien + BGH */}
          <Route path="/rit" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><RITDashboard /></RoleRoute>} />
          <Route path="/rit/de-tai/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><CreateProjectPage /></RoleRoute>} />
          <Route path="/rit/de-tai" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><ResearchProjectListPage /></RoleRoute>} />
          <Route path="/rit/de-tai/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><ResearchDetail /></RoleRoute>} />
          <Route path="/rit/ncv/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><CreateMemberPage /></RoleRoute>} />
          <Route path="/rit/ncv/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><MemberDetailPage /></RoleRoute>} />
          <Route path="/rit/ncv" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><ResearchMemberList /></RoleRoute>} />
          <Route path="/rit/hop-tac" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><HopTacQuocTe /></RoleRoute>} />
          <Route path="/rit/hop-tac/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><NckhDetailPage /></RoleRoute>} />
          <Route path="/rit/danh-sach-nckh" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><ResearchList /></RoleRoute>} />

          {/* BI — admin + nhan-vien + BGH */}
          <Route path="/bi" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><BIDashboard /></RoleRoute>} />
          <Route path="/bi/bao-cao/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><CreateReportPage /></RoleRoute>} />
          <Route path="/bi/bao-cao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><BaoCaoList /></RoleRoute>} />
          <Route path="/bi/chi-so" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><KPIsPage /></RoleRoute>} />

          {/* INT — admin + BGH */}
          <Route path="/int" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG]}><INTDashboard /></RoleRoute>} />
          <Route path="/int/tich-hop" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG]}><IntegrationList /></RoleRoute>} />
          <Route path="/int/tich-hop/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG]}><IntegrationDetail /></RoleRoute>} />
          <Route path="/int/nhat-ky" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG]}><IntegrationLogs /></RoleRoute>} />

          {/* OCR */}
          <Route path="/ocr" element={<RoleRoute roles={[ROLES.ADMIN]}><OCRDashboard /></RoleRoute>} />
          <Route path="/ocr/danh-sach" element={<RoleRoute roles={[ROLES.ADMIN]}><ScanList /></RoleRoute>} />
          <Route path="/ocr/tai-lieu/:id" element={<RoleRoute roles={[ROLES.ADMIN]}><ScanDetail /></RoleRoute>} />

          {/* DCE — all roles */}
          <Route path="/dce" element={<DCEDashboard />} />
          <Route path="/dce/chuan-dau-ra" element={<CompetencyList />} />
          <Route path="/dce/chuan-dau-ra/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><CompetencyCreate /></RoleRoute>} />
          <Route path="/dce/chuan-dau-ra/:id" element={<CompetencyDetail />} />
          <Route path="/dce/khoa-dao-tao" element={<CourseCatalog />} />
          <Route path="/dce/khoa-dao-tao/ds" element={<CourseCatalogFull />} />
          <Route path="/dce/khoa-dao-tao/:id" element={<DCECourseDetail />} />
          <Route path="/dce/khoa-dao-tao/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA]}><DCECourseCreate /></RoleRoute>} />

          {/* PMS */}
          <Route path="/pms" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSDashboard /></RoleRoute>} />
          <Route path="/pms/dang-vien/tao" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSCreateMemberPage /></RoleRoute>} />
          <Route path="/pms/dang-vien/:id" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSMemberDetailPage /></RoleRoute>} />
          <Route path="/pms/dang-vien" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSMemberListPage /></RoleRoute>} />
          <Route path="/pms/dang-vien/ds" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSMemberListFull /></RoleRoute>} />
          <Route path="/pms/bao-cao/chi-tiet/:id" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSReportDetailPage /></RoleRoute>} />
          <Route path="/pms/bao-cao" element={<RoleRoute roles={[ROLES.ADMIN]}><PMSReportListPage /></RoleRoute>} />

          {/* QA — admin + giang-vien + nhan-vien + BGH */}
          <Route path="/qa" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QADashboard /></RoleRoute>} />
          <Route path="/qa/kiem-dinh" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAReviewPage /></RoleRoute>} />
          <Route path="/qa/kiem-dinh/:id/minh-chung" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAReviewEvidence /></RoleRoute>} />
          <Route path="/qa/kiem-dinh/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAReviewDetail /></RoleRoute>} />
          <Route path="/qa/khieu-nai/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAComplaintDetail /></RoleRoute>} />
          <Route path="/qa/khieu-nai" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAComplaintPage /></RoleRoute>} />
          <Route path="/qa/bao-cao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAReportListFull /></RoleRoute>} />
          <Route path="/qa/bao-cao/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAReportCreate /></RoleRoute>} />
          <Route path="/qa/bao-cao/:id/minh-chung" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAEvidenceList /></RoleRoute>} />
          <Route path="/qa/bao-cao/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QAReportDetail /></RoleRoute>} />
          <Route path="/qa/tai-san" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QATaiSanPage /></RoleRoute>} />
          <Route path="/qa/tai-san/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QATaiSanCreate /></RoleRoute>} />
          <Route path="/qa/tai-san/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QATaiSanDetail /></RoleRoute>} />
          <Route path="/qa/tai-san/:id/chinh-sua" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QATaiSanEdit /></RoleRoute>} />
          <Route path="/qa/tai-san/:id/bao-tri" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QATaiSanMaintenance /></RoleRoute>} />
          <Route path="/qa/csvc" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QACsvcPage /></RoleRoute>} />
          <Route path="/qa/csvc/tao" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QACsvcCreate /></RoleRoute>} />
          <Route path="/qa/csvc/:id" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]}><QACsvcDetail /></RoleRoute>} />

          {/* Portal */}

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

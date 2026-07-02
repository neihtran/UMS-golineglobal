// ─── Auth & IAM types ──────────────────────────────────────────────────────────

export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending';
export type MFAStatus = 'enabled' | 'disabled' | 'pending_setup';
export type LockReason = 'manual' | 'failed_attempts' | 'policy' | 'inactive';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  department: string;
  title?: string;
  phone?: string;
  status: UserStatus;
  mfaEnabled: MFAStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  lockReason?: LockReason;
  failedLoginAttempts?: number;
  passwordExpiresAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  mfaCode?: string;
}

export interface MFAVerifyRequest {
  email: string;
  code: string;
  tempToken: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  details?: string;
  timestamp: string;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
export type PermissionScope = 'own' | 'department' | 'all';

export interface Permission {
  module: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
}

// ─── HRM types ────────────────────────────────────────────────────────────────

export type VCStatus = 'active' | 'trial' | 'leave' | 'inactive';
export type ContractType = 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';

export interface VienChuc {
  id: string;
  code: string;
  name: string;
  dob: string;
  cccd: string;
  gender: 'Nam' | 'Nữ';
  ethnicity: string;
  religion?: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  title: string;
  position: string;
  dept: string;
  contractType: ContractType;
  salary: number;
  status: VCStatus;
  joinDate: string;
  education: string;
  major: string;
  school: string;
  gradYear: number;
  mfaEnabled: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  dept: string;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvedAt?: string;
  days: number;
}

// ─── SIS types ────────────────────────────────────────────────────────────────

export type StudentStatus = 'studying' | 'reserved' | 'suspended' | 'graduated' | 'quit';
export type EnrollmentStatus = 'registered' | 'completed' | 'failed' | 'withdrawn';

export interface Student {
  id: string;
  msv: string;
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  class: string;
  major: string;
  dept: string;
  cohort: string;
  gpa: number;
  credits: number;
  status: StudentStatus;
  enrollmentStatus?: EnrollmentStatus;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  type: 'theory' | 'practice' | 'project' | 'internship';
  dept: string;
  ctdtId?: string;
}

export interface GradeRecord {
  studentId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
  theoryScore?: number;
  practiceScore?: number;
  finalScore?: number;
  grade?: string;
  status: EnrollmentStatus;
}

export interface CTDT {
  id: string;
  programCode: string;
  programName: string;
  version: string;
  year: number;
  totalCredits: number;
  minGPA: number;
  subjects: Subject[];
  status: 'draft' | 'active' | 'archived';
}

// ─── FIN types ────────────────────────────────────────────────────────────────

export type TuitionStatus = 'paid' | 'unpaid' | 'partial' | 'exempted' | 'deferred';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'card' | 'scholarship' | 'debt';

export interface HocPhi {
  id: string;
  studentId: string;
  studentName: string;
  msv: string;
  class: string;
  semester: string;
  tuitionFee: number;
  otherFees: number;
  total: number;
  paid: number;
  remaining: number;
  status: TuitionStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  paidTo?: string;
}

// ─── LMS types ────────────────────────────────────────────────────────────────

export type CourseStatus = 'draft' | 'published' | 'archived' | 'closed';

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  dept: string;
  credits: number;
  semester: string;
  students: number;
  completionRate: number;
  rating: number;
  status: CourseStatus;
  ctSubjectId?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  type: 'individual' | 'group';
  dueDate: string;
  maxScore: number;
  submissions: number;
  status: 'open' | 'closed' | 'grading';
}

// ─── EXAM types ──────────────────────────────────────────────────────────────

export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
export type QuestionType = 'multiple_choice' | 'essay' | 'true_false' | 'fill_blank';

export interface Exam {
  id: string;
  code: string;
  name: string;
  courseId: string;
  courseName: string;
  type: 'midterm' | 'final' | 'quiz' | 'practice';
  duration: number;
  questions: number;
  totalScore: number;
  status: ExamStatus;
  startTime?: string;
  room?: string;
  students: number;
  submitted: number;
}

export interface Question {
  id: string;
  courseId: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer?: string | number;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// ─── DMS types ───────────────────────────────────────────────────────────────

export type DocType = 'cv' | 'qd' | 'tb' | 'ct' | 'hd' | 'tt';
export type DocUrgency = 'khẩn' | 'thường' | 'mật';
export type WorkflowStepStatus = 'pending' | 'processing' | 'approved' | 'rejected';

export interface Document {
  id: string;
  number: string;
  title: string;
  type: DocType;
  urgency: DocUrgency;
  from: string;
  date: string;
  excerpt: string;
  content?: string;
  attachments: string[];
  tags: string[];
  deadline?: string;
  workflow: WorkflowStep[];
  unread: boolean;
}

export interface WorkflowStep {
  step: string;
  assignee: string;
  status: WorkflowStepStatus;
  completedAt?: string;
  note?: string;
}

// ─── WMS types ───────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'pending_approval' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskModule = 'IAM' | 'HRM' | 'SIS' | 'FIN' | 'LMS' | 'EXAM' | 'DMS' | 'OCR' | 'PORTAL' | 'WMS' | 'KTX' | 'INT' | 'BI' | 'DCE' | 'PMS' | 'RIT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  dept: string;
  module: TaskModule;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  progress: number;
  subtasks?: string[];
  comments?: number;
  attachments?: number;
}

// ─── KTX types ───────────────────────────────────────────────────────────────

export type RoomStatus = 'available' | 'full' | 'maintenance';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Room {
  id: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  gender: 'Nam' | 'Nữ';
  status: RoomStatus;
  issues: number;
  amenities: string[];
}

export interface KTXRequest {
  id: string;
  studentId: string;
  studentName: string;
  msv: string;
  type: 'new' | 'transfer' | 'renew' | 'repair' | 'cancel';
  roomId?: string;
  reason: string;
  status: RequestStatus;
  date: string;
  processedBy?: string;
  processedAt?: string;
}

// ─── RIT types ───────────────────────────────────────────────────────────────

export type ProjectStatus = 'draft' | 'active' | 'review' | 'done' | 'cancelled';
export type ProjectLevel = 'Cấp Bộ' | 'Cấp trường';

export interface ResearchProject {
  id: string;
  code: string;
  title: string;
  leader: string;
  dept: string;
  level: ProjectLevel;
  budget: number;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  deadline: string;
  field: string;
  members: string[];
  publications?: number;
}

export interface Publication {
  id: string;
  author: string;
  coAuthors: string[];
  title: string;
  journal: string;
  year: number;
  volume?: string;
  pages?: string;
  doi?: string;
  citations: number;
  indexedIn: string[];
  type: 'article' | 'conference' | 'book' | 'chapter';
}

// ─── DCE types ───────────────────────────────────────────────────────────────

export type CompetencyLevel = 'level1' | 'level2' | 'level3' | 'level4';
export type CompetencyDomain = 'chuyen_mon' | 'ngoai_ngu' | 'cntt' | 'ky_nang_mem' | 'nghien_cuu' | 'giao_tiep';

export interface CompetencyStandard {
  id: string;
  code: string;
  name: string;
  domain: CompetencyDomain;
  level: CompetencyLevel;
  description: string;
  criteria: string[];
  assessmentMethod: string;
  programId?: string;
}

export interface CompetencyResult {
  studentId: string;
  programId: string;
  standards: {
    standardId: string;
    score: number;
    assessedAt: string;
    assessor: string;
  }[];
  overallScore: number;
  gapAnalysis?: string;
}

// ─── OCR types ───────────────────────────────────────────────────────────────

export type OCRDocType = 'contract' | 'diploma' | 'transcript' | 'id_card' | 'invoice' | 'report' | 'other';
export type OCRStatus = 'processing' | 'review' | 'done' | 'failed';

export interface OCRDocument {
  id: string;
  name: string;
  type: OCRDocType;
  pages: number;
  size: string;
  uploadedAt: string;
  processedAt?: string;
  status: OCRStatus;
  accuracy: number;
  extractedData?: Record<string, string>;
  reviewer?: string;
  reviewedAt?: string;
}

// ─── BI types ───────────────────────────────────────────────────────────────

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  unit?: string;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'flat';
  updatedAt: string;
}

export interface DashboardReport {
  id: string;
  name: string;
  type: string;
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  format: 'pdf' | 'xlsx' | 'live';
  lastUpdated: string;
  views: number;
  createdBy: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  connection: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  records?: number;
}

// ─── PMS types ───────────────────────────────────────────────────────────────

export type PartyMemberStatus = 'active' | 'probation' | 'suspended';
export type PartyRole = 'Bí thư Đảng ủy' | 'Phó Bí thư Đảng ủy' | 'Bí thư Chi bộ' | 'Chi ủy viên' | 'Đảng viên' | 'Đảng viên dự bị';

export interface PartyMember {
  id: string;
  name: string;
  dob: string;
  joinDate: string;
  branch: string;
  role: PartyRole;
  education: string;
  status: PartyMemberStatus;
  achievements: number;
  disciplines?: number;
  trainingRecords?: number;
}

// ─── QA types ───────────────────────────────────────────────────────────────

export type AUNStandard = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type EvidenceStatus = 'draft' | 'uploaded' | 'approved' | 'rejected';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'self_assessed' | 'external_assessed' | 'submitted';

export interface AUNStandard_ {
  id: string;
  code: AUNStandard;
  name: string;
  weight: number;
  description: string;
  criteria: string[];
  evidenceTypes: string[];
  minScore: number;
  maxScore: number;
}

export interface Evidence {
  id: string;
  standardId: string;
  criterionId: string;
  title: string;
  description: string;
  type: 'document' | 'link' | 'image' | 'video';
  url?: string;
  fileName?: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: EvidenceStatus;
  reviewer?: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

export interface QAAssessment {
  id: string;
  cycleId: string;
  cycleName: string;
  standardId: string;
  selfScore?: number;
  selfEvidence?: string;
  externalScore?: number;
  externalEvidence?: string;
  status: AssessmentStatus;
  comments?: string;
}

// ─── INT types ──────────────────────────────────────────────────────────────

export type IntegrationDirection = 'push' | 'pull' | 'bidirectional';
export type IntegrationStatus = 'active' | 'warning' | 'inactive';
export type EventType = 'sync' | 'error' | 'warning' | 'auth' | 'webhook';

export interface Integration {
  id: string;
  name: string;
  type: string;
  direction: IntegrationDirection;
  status: IntegrationStatus;
  uptime: number;
  lastSync: string;
  eventsToday: number;
  endpoint?: string;
  apiKey?: string;
  description: string;
  events?: IntegrationEvent[];
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: EventType;
  message: string;
  timestamp: string;
  duration?: number;
  status: 'success' | 'failure' | 'warning';
}

// ─── Common types ─────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
  error?: string;
  message?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface DateRange {
  start: string;
  end: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  key: string;
  operator: 'eq' | 'ne' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: unknown;
}

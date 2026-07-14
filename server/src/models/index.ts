// ─── Models Index ─────────────────────────────────────────────────────────────
// Models (runtime values) + Types (compile-time only)
// All I* interfaces are TypeScript-only and use `type` re-export

export { User, ROLES, ROLE_HIERARCHY, type Role, type IUser } from './User.js';
export type { IDepartment } from './Department.js';
export { Department } from './Department.js';
export type { IVienChuc } from './VienChuc.js';
export { VienChuc } from './VienChuc.js';
export type { ILeaveRequest } from './LeaveRequest.js';
export { LeaveRequest } from './LeaveRequest.js';
export type { IAuditLog } from './AuditLog.js';
export { AuditLog } from './AuditLog.js';
export type { IRole } from './Role.js';
export { RoleModel } from './Role.js';
export type { ITenant } from './Tenant.js';
export { Tenant } from './Tenant.js';
export type { ISession } from './Session.js';
export { Session } from './Session.js';
export type { IContract } from './Contract.js';
export { Contract } from './Contract.js';
export type { ISalarySheet } from './SalarySheet.js';
export { SalarySheet } from './SalarySheet.js';
export type { IStudent } from './Student.js';
export { Student } from './Student.js';
export type { ISubject } from './Subject.js';
export { Subject } from './Subject.js';
export type { ICourse } from './Course.js';
export { Course } from './Course.js';
export type { IEnrollment } from './Enrollment.js';
export { Enrollment } from './Enrollment.js';
export type { ICurriculum } from './Curriculum.js';
export { Curriculum } from './Curriculum.js';
export type { IDocument } from './Document.js';
export { DocumentModel } from './Document.js';
export type { IDocumentFolder } from './DocumentFolder.js';
export { DocumentFolder } from './DocumentFolder.js';
export type { ITuition, IExpense, IBudget } from './Finance.js';
export { Tuition, Expense, Budget } from './Finance.js';
export type { IAssignment, ISubmission } from './Learning.js';
export { Assignment, Submission } from './Learning.js';
export type { IExam, IExamSubmission, IResearchProject, IKPI, IKtxRoom, IQaEvidence, IWmsTask } from './Modules.js';
export { Exam, ExamSubmission, ResearchProject, KPI, KtxRoom, QaEvidence, WmsTask } from './Modules.js';
export type { IIntegrationLog, IOcrJob, IDceCompetency, IPmsMeeting, IPortalAnnouncement, ILibBook, ILibLoan } from './Stubs.js';
export { IntegrationLog, OcrJob, DceCompetency, PmsMeeting, PortalAnnouncement, LibBook, LibLoan } from './Stubs.js';

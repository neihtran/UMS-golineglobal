// ─── Barrel export for all models ───────────────────────────────────────────────

// GD1: Nền tảng
export { User, type IUser, type UserStatus, type MFAStatus } from './User.js';
export { Department, type IDepartment } from './Department.js';
export { VienChuc, type IVienChuc, type VCStatus, type ContractType, type Gender } from './VienChuc.js';
export { Recruitment, type IRecruitment } from './Recruitment.js';
export { AuditLog, type IAuditLog, type AuditAction, type AuditStatus } from './AuditLog.js';
export { Discipline, type IDiscipline } from './Discipline.js';
export { SalarySheet, type ISalarySheet } from './SalarySheet.js';
export { Appointment, type IAppointment } from './Appointment.js';

// GD2: SIS
export { Student, type IStudent, type StudentStatus, type EducationLevel } from './Student.js';
export { Subject, type ISubject } from './Subject.js';
export { Enrollment, type IEnrollment, type EnrollmentStatus } from './Enrollment.js';
export { Curriculum, type ICurriculum } from './Curriculum.js';
export { Internship, type IInternship } from './Internship.js';
export { GraduationSession, type IGraduationSession } from './Graduation.js';
export { GraduationRecord, type IGraduationRecord } from './Graduation.js';

// GD3: Teaching
export { Course, type ICourse, type CourseLevel, type CourseStatus } from './Course.js';
export { Assignment, type IAssignment, type AssignmentType } from './Assignment.js';
export { Attendance, type IAttendance } from './Attendance.js';
export { Exam, type IExam, type ExamStatus, type ExamType } from './Exam.js';
export { Question, type IQuestion, type QuestionType, type QuestionDifficulty } from './Question.js';
export { ExamSession, type IExamSession, type ExamSessionStatus } from './ExamSession.js';
export { ExamResult, type IExamResult } from './ExamResult.js';

// GD2: DMS
export { Document, type IDocument, type DocumentStatus, type DocumentUrgency, type DocumentSecurity } from './Document.js';
export { DocumentCategory, type IDocumentCategory } from './DocumentCategory.js';
export { ApprovalFlow, type IApprovalFlow } from './ApprovalFlow.js';

// GD2: WMS
export { Project, type IProject, type ProjectStatus } from './Project.js';
export { Task, type ITask, type TaskPriority, type TaskStatus } from './Task.js';

// GD2: OCR
export { OCRJob, type IOCRJob, type OcrJobStatus } from './OCRJob.js';

// GD4: Operations
export { Tuition, type ITuition, type PaymentStatus } from './Tuition.js';
export { Expenditure, type IExpenditure, type ExpenditureStatus, type ExpenseCategory } from './Expenditure.js';
export { Room, type IRoom, type RoomStatus, type RoomType } from './Room.js';
export { RoomRegistration, type IRoomRegistration, type RegistrationStatus } from './RoomRegistration.js';
export { ResearchProject, type IResearchProject, type ProjectStatusRit, type ProjectTypeRit } from './ResearchProject.js';
export { Notification, type INotification } from './Notification.js';
export { Announcement, type IAnnouncement, type AnnouncementStatus, type AnnouncementCategory } from './Announcement.js';
export { Report, type IReport, type ReportType, type ReportFormat } from './Report.js';
export { Integration, IntegrationLog, type IIntegration, type IIntegrationLog } from './Integration.js';
export { Book, type IBook, type BookCategory } from './Library.js';
export { BorrowRecord, type IBorrowRecord } from './Library.js';
export { Competency, type ICompetency, type CompetencyCategory, type CompetencyLevel } from './DCE.js';
export { CompetencyAssessment, type ICompetencyAssessment } from './DCE.js';
export { Evidence, type IEvidence, type EvidenceStatus } from './QA.js';
export { Assessment, type IAssessment, type AssessmentType } from './QA.js';
export { QAAsset, type IQAAsset, type AssetStatus } from './QA_Asset.js';
export { QAAssetMaintenance, type IQAAssetMaintenance } from './QA_Asset.js';
export { QAFacility, type IQAFacility } from './QA_Asset.js';
export { PartyMember, type IPartyMember, type PartyMemberStatus } from './PMS.js';
export { PartyActivity, type IPartyActivity } from './PMS.js';

// HRM: Staff Detail sub-resources
export { ContractHistory, type IContractHistory } from './ContractHistory.js';
export { SalaryHistory, type ISalaryHistory } from './SalaryHistory.js';
export { StaffTraining, type IStaffTraining } from './StaffTraining.js';
export { StaffDiscipline, type IStaffDiscipline } from './StaffDiscipline.js';
export { StaffAppointment, type IStaffAppointment } from './StaffAppointment.js';
export { StaffAttachment, type IStaffAttachment } from './StaffAttachment.js';

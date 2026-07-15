// Core models
export { User, ROLES } from './User.js';
export { RoleModel as Role } from './Role.js';
export { Tenant } from './Tenant.js';
export { AuditLog } from './AuditLog.js';
export { Session } from './Session.js';

// Department & HR
export { Department } from './Department.js';
export { VienChuc } from './VienChuc.js';
export { LeaveRequest } from './LeaveRequest.js';
export { Contract } from './Contract.js';
export { SalarySheet } from './SalarySheet.js';

// SIS (Student Information System)
export { Subject } from './Subject.js';
export { Course } from './Course.js';
export { Enrollment } from './Enrollment.js';
export { Student } from './Student.js';
export { StudentProfile } from './StudentProfile.js';
export { Curriculum } from './Curriculum.js';
export { CourseGroup } from './CourseGroup.js';
export { Major } from './Major.js';
export { StudentClass } from './StudentClass.js';
export { GraduationSession } from './GraduationSession.js';
export { Graduation } from './Graduation.js';
export { Internship } from './Internship.js';
export { ExternalMapping } from './ExternalMapping.js';
export { SyncConfig, type ISyncConfig, type SyncMode, type SyncEntity } from './SyncConfig.js';
export { SyncFailure, type ISyncFailure } from './SyncFailure.js';
export { TrainingSystem } from './TrainingSystem.js';
export { Specialization } from './Specialization.js';
export { AcademicTerm } from './AcademicTerm.js';
export { ClassSchedule } from './ClassSchedule.js';
export { ScheduleChange } from './ScheduleChange.js';
export { GPAHistory } from './GPAHistory.js';
export { AcademicWarning } from './AcademicWarning.js';
export { StudentLog, createStudentLog } from './StudentLog.js';
export { StudentStatusHistory } from './StudentStatusHistory.js';
export { StudentReservation } from './StudentReservation.js';
export { StudentDropout } from './StudentDropout.js';
export { StudentMajorChange } from './StudentMajorChange.js';
export { StudentClassChange } from './StudentClassChange.js';
export { AdmissionBatch } from './AdmissionBatch.js';
export { AdmissionStudent } from './AdmissionStudent.js';
export { SubjectType } from './SubjectType.js';
export { SubjectPrerequisite } from './SubjectPrerequisite.js';
export { SubjectCondition } from './SubjectCondition.js';

// LMS & EXAM
export { Assignment, Submission } from './Learning.js';

// DMS (Documents)
export { DocumentModel } from './Document.js';
export { DocumentFolder } from './DocumentFolder.js';

// FIN (Finance)
export { Tuition, Expense, Budget } from './Finance.js';

// Additional modules (from Modules.ts)
export { Exam, ExamSubmission, ResearchProject, KPI, KtxRoom, QaEvidence, WmsTask } from './Modules.js';

// Other stubs
export { IntegrationLog, OcrJob, DceCompetency, PmsMeeting, PortalAnnouncement, LibBook, LibLoan } from './Stubs.js';

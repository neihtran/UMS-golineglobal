# SIS Migration Roadmap
## Lộ trình đồng bộ dự án với thiết kế SIS

**Ngày tạo:** 15/07/2026  
**Nguồn:** `docs/SIS database.md`, `docs/SIS giải thích database.md`, `docs/workflow.md`

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Lộ trình chi tiết theo Phase](#2-lộ-trình-chi-tiết-theo-phase)
3. [Yêu cầu kỹ thuật](#3-yêu-cầu-kỹ-thuật)
4. [Coding Rules](#4-coding-rules)
5. [Danh sách models cần tạo/sửa](#5-danh-sách-models-cần-tạosửa)

---

## 1. Tổng quan

### Gap Analysis

| Loại | Số bảng thiết kế | Đã có | Cần thêm |
|------|------------------|-------|----------|
| Danh mục đào tạo | 5 | 2 (Major, CourseGroup) | 3 (Specialization, TrainingSystem, AcademicTerm) |
| Tuyển sinh | 2 | 0 | 2 (AdmissionBatch, AdmissionStudent) |
| Sinh viên | 10 | 5 | 5 (StudentProfile, StudentStatusHistory, Reservation, Dropout, MajorChange, ClassChange) |
| CTĐT | 5 | 3 | 2 (SubjectPrerequisite, SubjectCondition, SubjectType) |
| Đăng ký & Lịch | 3 | 1 (Course/Enrollment) | 2 (ClassSchedule, ScheduleChange) |
| Điểm & GPA | 4 | 1 (Enrollment) | 3 (StudentGrade, GPAHistory, AcademicWarning) |
| **Tổng** | **~35** | **~11** | **~20** |

### Thứ tự ưu tiên

```
Phase 1: Nền tảng (Danh mục đào tạo)
    ↓
Phase 2: Core (Students, Enrollments mở rộng)
    ↓
Phase 3: Học tập (Schedules, Grades, GPA)
    ↓
Phase 4: Quản lý SV (Status histories, Reservations)
    ↓
Phase 5: Tuyển sinh & Tốt nghiệp mở rộng
    ↓
Phase 6: Cảnh báo & Logs
```

---

## 2. Lộ trình chi tiết theo Phase

### Phase 1: Danh mục đào tạo (Foundation)

**Mục tiêu:** Tạo các bảng danh mục nền tảng cho toàn bộ SIS

#### 1.1 TrainingSystem (Hệ đào tạo)

```
Bảng: training_systems
Mục đích: Quản lý hệ đào tạo (Chính quy, Liên thông, Văn bằng 2)

Trường:
- _id: ObjectId
- code: String (unique, required) // VD: "CQ", "LT", "VB2"
- name: String (required) // VD: "Chính quy", "Liên thông"
- description: String
- status: Enum ['draft', 'pending', 'published', 'archived']
- isActive: Boolean (default: true)
- externalId: Number (nullable)
- externalSource: Enum ['hqnhat', 'manual']
- lastSyncedAt: Date
- createdAt, updatedAt

Indexes:
- code: unique
- status
- name (text search)
```

#### 1.2 Specialization (Chuyên ngành)

```
Bảng: specializations
Mục đích: Quản lý chuyên ngành thuộc ngành đào tạo

Trường:
- _id: ObjectId
- code: String (unique, required) // VD: "KTTT", "AI", "ATTT"
- name: String (required) // VD: "Khoa học máy tính", "Trí tuệ nhân tạo"
- major: ObjectId (ref: majors, required)
- description: String
- status: Enum ['draft', 'pending', 'published', 'archived']
- isActive: Boolean (default: true)
- externalId: Number
- externalSource: Enum ['hqnhat', 'manual']
- lastSyncedAt: Date
- createdAt, updatedAt

Indexes:
- code: unique
- major: index
- name (text search)
```

#### 1.3 AcademicTerm (Học kỳ)

```
Bảng: academic_terms
Mục đích: Quản lý năm học và học kỳ

Trường:
- _id: ObjectId
- code: String (unique, required) // VD: "2026-2027-HK1"
- academicYear: String (required) // VD: "2026-2027"
- semester: Number (required, 1-3)
- startDate: Date
- endDate: Date
- registrationStart: Date
- registrationEnd: Date
- status: Enum ['planning', 'registration', 'studying', 'finished']
- isActive: Boolean (default: true)
- externalId: Number
- externalSource: Enum ['hqnhat', 'manual']
- lastSyncedAt: Date
- createdAt, updatedAt

Indexes:
- code: unique
- academicYear + semester: compound
- status
- registrationStart, registrationEnd
```

#### 1.4 Cập nhật Major (đã có)

```javascript
// Thêm trường vào Major:
- degreeLevel: Number (enum: [1, 2, 3]) // 1=Cử nhân, 2=Thạc sĩ, 3=Tiến sĩ
- trainingSystem: ObjectId (ref: training_systems, nullable)
- specialization: ObjectId (ref: specializations, nullable)
```

---

### Phase 2: Core Models (Students & Enrollments)

**Mục tiêu:** Mở rộng Student, Enrollment đầy đủ theo thiết kế

#### 2.1 StudentProfile (Hồ sơ mở rộng)

```
Bảng: student_profiles
Mục đích: Lưu thông tin mở rộng của sinh viên

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required, unique)
- fatherName: String
- motherName: String
- guardianName: String
- guardianPhone: String
- emergencyContact: String
- emergencyPhone: String
- nationality: String (default: "Việt Nam")
- ethnicity: String
- religion: String
- insuranceNumber: String
- bankName: String
- bankAccount: String
- createdAt, updatedAt

Indexes:
- student: unique
```

#### 2.2 Cập nhật Student (đã có)

```javascript
// THAY ĐỔI LỚN - Thêm/sửa trường:

// Trường mới:
- admissionStudent: ObjectId (ref: admission_students, nullable) // Ứng viên trúng tuyển
- class: ObjectId (ref: student_classes) // Lớp hành chính
- specialization: ObjectId (ref: specializations)
- trainingSystem: ObjectId (ref: training_systems)
- course: ObjectId (ref: courses) // Khóa học (niên khóa)
- dob: Date // dateOfBirth
- citizenId: String // CCCD
- avatar: String // URL hoặc fileId
- enrollmentDate: Date

// Sửa trường hiện có:
- name: String → fullName (hoặc giữ nguyên)

// Sửa enum status:
status: Enum [
  'studying',    // Đang học
  'reserved',    // Bảo lưu
  'graduated',   // Đã tốt nghiệp
  'dropped',     // Thôi học
  'transferred'  // Chuyển ngành/trường
]

// Xóa trường không cần:
- className: String (thay bằng class: ObjectId)
- courseYear: Number (thay bằng course: ObjectId)
```

#### 2.3 Cập nhật Enrollment (đã có)

```javascript
// Mở rộng Enrollment thành StudentGrade:

// Trường mới:
- registeredAt: Date (default: now)
- cancelledAt: Date (nullable)
- attendanceScore: Number (0-10)
- assignmentScore: Number (0-10)
- midtermScore: Number (0-10) // Đã có
- finalScore: Number (0-10) // Đã có
- totalScore: Number (0-10)
- letterGrade: Enum ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']
- gradePoint: Number (0-4.0) // Điểm hệ 4
- isPass: Boolean
- isLocked: Boolean (default: false)
- lockedAt: Date
- lockedBy: ObjectId (ref: users)
- academicTerm: ObjectId (ref: academic_terms)

// Sửa enum status:
status: Enum [
  'registered',   // Đã đăng ký
  'cancelled',   // Đã hủy
  'completed'    // Hoàn thành (có điểm)
]

// Xóa trường:
- enrollmentDate (thay bằng registeredAt)
- totalSessions
- attendanceCount
```

---

### Phase 3: Học tập (Schedules & Grades)

#### 3.1 ClassSchedule (Lịch học)

```
Bảng: class_schedules
Mục đích: Quản lý thời khóa biểu của lớp học phần

Trường:
- _id: ObjectId
- courseSection: ObjectId (ref: courses, required) // Lớp học phần
- lecturer: ObjectId (ref: VienChuc/users, required) // Giảng viên
- room: ObjectId (ref: Room/File, required) // Phòng học
- dayOfWeek: Number (1-7, required) // Thứ trong tuần
- lessonFrom: Number (1-10, required) // Tiết bắt đầu
- lessonTo: Number (1-10, required) // Tiết kết thúc
- startDate: Date
- endDate: Date
- isActive: Boolean (default: true)
- createdAt, updatedAt

Indexes:
- courseSection: index
- lecturer: index
- room: index
- dayOfWeek + lessonFrom + lessonTo: compound (cho conflict check)
```

#### 3.2 ScheduleChange (Thay đổi lịch)

```
Bảng: schedule_changes
Mục đích: Lưu lịch sử thay đổi lịch học

Trường:
- _id: ObjectId
- schedule: ObjectId (ref: class_schedules, required)
- oldRoom: ObjectId (nullable)
- newRoom: ObjectId (nullable)
- oldLecturer: ObjectId (nullable)
- newLecturer: ObjectId (nullable)
- oldDate: Date
- newDate: Date
- oldDayOfWeek: Number
- newDayOfWeek: Number
- oldLessonFrom: Number
- newLessonFrom: Number
- oldLessonTo: Number
- newLessonTo: Number
- reason: String
- status: Enum ['pending', 'approved', 'rejected']
- createdBy: ObjectId (ref: users, required)
- createdAt, updatedAt

Indexes:
- schedule: index
- status: index
```

#### 3.3 GPAHistory (Lịch sử GPA)

```
Bảng: gpa_histories
Mục đích: Lưu GPA/CPA theo từng học kỳ

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- academicTerm: ObjectId (ref: academic_terms, required)
- registeredCredit: Number // Tín chỉ đã đăng ký
- earnedCredit: Number // Tín chỉ đạt
- accumulatedCredit: Number // Tín chỉ tích lũy
- semesterGpa: Number (0-4.0) // GPA học kỳ
- cumulativeGpa: Number (0-4.0) // CPA
- academicRank: Enum ['Excellent', 'Very Good', 'Good', 'Average', 'Weak', 'Poor']
- createdAt, updatedAt

Indexes:
- student + academicTerm: unique compound
- student: index
- academicTerm: index

Ràng buộc:
- Mỗi sinh viên chỉ có 1 GPAHistory cho mỗi học kỳ
```

#### 3.4 AcademicWarning (Cảnh báo học vụ)

```
Bảng: academic_warnings
Mục đích: Quản lý cảnh báo học vụ

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- academicTerm: ObjectId (ref: academic_terms, required)
- warningType: Enum [
  'low_gpa',              // GPA thấp
  'failed_subject',        // Nợ môn
  'insufficient_credit',   // Thiếu tín chỉ
  'academic_warning'       // Cảnh báo học vụ chung
]
- warningLevel: Number (1, 2, 3...)
- description: String
- resolvedAt: Date (nullable)
- isActive: Boolean (default: true)
- createdAt, updatedAt

Indexes:
- student + academicTerm: compound
- warningType: index
- isActive: index
```

#### 3.5 StudentLog (Nhật ký sinh viên)

```
Bảng: student_logs
Mục đích: Lưu nhật ký các sự kiện nghiệp vụ

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- action: String (required) // VD: 'REGISTER', 'CANCEL', 'TRANSFER_CLASS'
- referenceType: String (nullable) // VD: 'Enrollment', 'Grade', 'Graduation'
- referenceId: ObjectId (nullable)
- description: String
- metadata: Object (nullable) // Dữ liệu bổ sung dạng JSON
- createdBy: ObjectId (ref: users)
- createdAt

Indexes:
- student + createdAt: compound
- action: index
- referenceType + referenceId: compound

Actions mẫu:
- STUDENT_ENROLLED
- STUDENT_CANCELLED
- GRADE_ENTERED
- GRADE_LOCKED
- CLASS_CHANGED
- MAJOR_CHANGED
- RESERVATION_STARTED
- RESERVATION_ENDED
- GRADUATED
```

---

### Phase 4: Quản lý sinh viên (Student Management)

#### 4.1 StudentStatusHistory (Lịch sử trạng thái)

```
Bảng: student_status_histories
Mục đích: Lưu toàn bộ lịch sử thay đổi trạng thái

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- status: Enum [
  'studying',
  'reserved',
  'graduated',
  'dropped',
  'transferred_major',
  'transferred_class'
]
- effectiveDate: Date (required)
- decisionNo: String (nullable)
- decisionDate: Date (nullable)
- reason: String
- note: String
- createdBy: ObjectId (ref: users, required)
- createdAt, updatedAt

Indexes:
- student: index
- effectiveDate: index
- status: index
```

#### 4.2 StudentReservation (Bảo lưu)

```
Bảng: student_reservations
Mục đích: Quản lý chi tiết các đợt bảo lưu

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- fromDate: Date (required)
- toDate: Date (required)
- semesterFrom: ObjectId (ref: academic_terms)
- semesterTo: ObjectId (ref: academic_terms)
- decisionNo: String
- decisionDate: Date
- reason: String
- status: Enum ['pending', 'approved', 'cancelled']
- approvedBy: ObjectId (ref: users)
- approvedAt: Date
- createdAt, updatedAt

Indexes:
- student: index
- semesterFrom, semesterTo: index
- status: index
```

#### 4.3 StudentDropout (Thôi học)

```
Bảng: student_dropouts
Mục đích: Quản lý chi tiết thôi học

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- dropoutDate: Date (required)
- decisionNo: String
- decisionDate: Date
- reason: String
- dropoutType: Enum ['voluntary', 'academic', 'disciplinary', 'other']
- status: Enum ['pending', 'approved', 'cancelled']
- approvedBy: ObjectId (ref: users)
- approvedAt: Date
- createdAt, updatedAt

Indexes:
- student: index
- dropoutDate: index
- status: index
```

#### 4.4 StudentMajorChange (Chuyển ngành)

```
Bảng: student_major_changes
Mục đích: Lưu lịch sử chuyển ngành

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- fromMajor: ObjectId (ref: majors, required)
- toMajor: ObjectId (ref: majors, required)
- fromSpecialization: ObjectId (ref: specializations)
- toSpecialization: ObjectId (ref: specializations)
- effectiveDate: Date
- decisionNo: String
- decisionDate: Date
- reason: String
- curriculumFrom: ObjectId (ref: curriculums)
- curriculumTo: ObjectId (ref: curriculums)
- createdBy: ObjectId (ref: users, required)
- createdAt, updatedAt

Indexes:
- student: index
- fromMajor, toMajor: compound
```

#### 4.5 StudentClassChange (Chuyển lớp)

```
Bảng: student_class_changes
Mục đích: Lưu lịch sử chuyển lớp hành chính

Trường:
- _id: ObjectId
- student: ObjectId (ref: students, required)
- fromClass: ObjectId (ref: student_classes, required)
- toClass: ObjectId (ref: student_classes, required)
- effectiveDate: Date
- decisionNo: String
- decisionDate: Date
- reason: String
- createdBy: ObjectId (ref: users, required)
- createdAt, updatedAt

Indexes:
- student: index
- fromClass, toClass: compound
```

---

### Phase 5: Tuyển sinh & Tốt nghiệp

#### 5.1 AdmissionBatch (Đợt tuyển sinh)

```
Bảng: admission_batches
Mục đích: Quản lý các đợt tuyển sinh

Trường:
- _id: ObjectId
- code: String (unique, required)
- name: String (required)
- year: Number (required)
- admissionType: Enum ['regular', 'transfer', 'second_degree']
- startDate: Date
- endDate: Date
- resultDate: Date
- enrollmentStartDate: Date
- enrollmentEndDate: Date
- status: Enum ['draft', 'open', 'closed', 'enrolled']
- totalCandidates: Number (default: 0)
- totalEnrolled: Number (default: 0)
- description: String
- isActive: Boolean (default: true)
- externalId: Number
- externalSource: Enum ['hqnhat', 'manual']
- lastSyncedAt: Date
- createdAt, updatedAt

Indexes:
- code: unique
- year: index
- status: index
- year + admissionType: compound
```

#### 5.2 AdmissionStudent (Thí sinh trúng tuyển)

```
Bảng: admission_students
Mục đích: Lưu danh sách thí sinh trúng tuyển

Trường:
- _id: ObjectId
- batch: ObjectId (ref: admission_batches, required)
- candidateCode: String (unique, required)
- fullName: String (required)
- gender: Enum ['Nam', 'Nữ', 'Khác']
- dateOfBirth: Date
- citizenId: String
- phone: String
- email: String
- address: String
- nationality: String
- major: ObjectId (ref: majors)
- trainingSystem: ObjectId (ref: training_systems)
- admissionScore: Number
- priorityLevel: Number
- status: Enum [
  'pending',    // Chờ kết quả
  'accepted',   // Trúng tuyển
  'enrolled',   // Đã nhập học
  'cancelled'   // Hủy/Hoàn thành
]
- enrollmentDate: Date
- studentCode: String (nullable - sinh khi nhập học)
- student: ObjectId (ref: students, nullable - link khi nhập học)
- notes: String
- externalId: Number
- externalSource: Enum ['hqnhat', 'manual']
- lastSyncedAt: Date
- createdAt, updatedAt

Indexes:
- batch: index
- candidateCode: unique
- status: index
- student: index (nullable)
```

#### 5.3 Cập nhật Graduation (đã có)

```javascript
// Mở rộng Graduation:

// Trường mới:
- totalCredit: Number // Tổng tín chỉ tích lũy
- cpa: Number (0-4.0) // CPA tại thời điểm tốt nghiệp
- thesisTitle: String
- thesisScore: Number
- thesisAdvisor: String
- thesisDefendedAt: Date
- classification: Enum ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình'] // Đã có

// Sửa enum degree:
degree: Enum ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình']

// Sửa enum status:
status: Enum [
  'pending_review',   // Chờ xét
  'approved',         // Đủ điều kiện
  'graduated',       // Đã tốt nghiệp
  'diploma_issued',  // Đã cấp bằng
  'not_met'          // Không đủ điều kiện
]
```

---

### Phase 6: CTĐT mở rộng

#### 6.1 SubjectType (Loại môn học)

```
Bảng: subject_types
Mục đích: Phân loại môn học

Trường:
- _id: ObjectId
- code: String (unique, required)
- name: String (required)
- description: String
- category: Enum ['general', 'foundation', 'specialization', 'internship', 'thesis', 'military', 'physical']
- displayOrder: Number
- status: Enum ['active', 'inactive']
- isActive: Boolean (default: true)
- externalId: Number
- externalSource: Enum ['hqnhat', 'manual']
- lastSyncedAt: Date
- createdAt, updatedAt

Indexes:
- code: unique
- category: index
```

#### 6.2 SubjectPrerequisite (Môn tiên quyết)

```
Bảng: subject_prerequisites
Mục đích: Quản lý điều kiện tiên quyết/song hành

Trường:
- _id: ObjectId
- subject: ObjectId (ref: subjects, required)
- prerequisite: ObjectId (ref: subjects, required)
- type: Enum ['prerequisite', 'corequisite']
- // prerequisite: phải học trước
  // corequisite: có thể học cùng lúc
- isActive: Boolean (default: true)
- createdAt, updatedAt

Indexes:
- subject + prerequisite: unique compound
- prerequisite: index

Ràng buộc:
- Không cho phép A là tiên quyết của chính A
```

#### 6.3 SubjectCondition (Điều kiện đăng ký)

```
Bảng: subject_conditions
Mục đích: Điều kiện đăng ký ngoài tiên quyết

Trường:
- _id: ObjectId
- subject: ObjectId (ref: subjects, required)
- minGpa: Number (0-4.0)
- minCompletedCredit: Number
- maxFailedSubject: Number
- requiredSubjects: ObjectId[] (ref: subjects) // Môn phải đạt trước
- maxConcurrentSubject: Number
- note: String
- isActive: Boolean (default: true)
- createdAt, updatedAt

Indexes:
- subject: unique
```

#### 6.4 Cập nhật Curriculum (đã có)

```javascript
// Thêm trường vào Curriculum:

// Trường mới:
- specialization: ObjectId (ref: specializations)
- trainingSystem: ObjectId (ref: training_systems)
- course: ObjectId (ref: courses)
- electiveCredit: Number // Tín chỉ tự chọn
- requiredCredits: Number // Tín chỉ bắt buộc

// Cập nhật courseGroups structure:
// Mỗi course trong courseGroups thêm:
{
  code: String,
  name: String,
  credits: Number,
  theoryHours: Number,
  practiceHours: Number,
  semester: Number,
  isRequired: Boolean (default: true),
  isCapstone: Boolean (default: false),
  isInternship: Boolean (default: false),
  electiveGroup: String (nullable), // VD: "Nhóm A", "Nhóm B"
  displayOrder: Number
}
```

#### 6.5 Cập nhật Subject (đã có)

```javascript
// Thêm trường vào Subject:

// Trường mới:
- subjectType: ObjectId (ref: subject_types)
- theoryHours: Number (default: 0)
- practiceHours: Number (default: 0)
- labHours: Number (default: 0)
- credit: Number (required)

// Thay đổi prerequisite:
- prerequisite: ObjectId[] → Chuyển sang bảng subject_prerequisites
```

---

## 3. Yêu cầu kỹ thuật

### 3.1 Coding Standards

#### Model Pattern

```typescript
// ✅ Pattern đúng cho tất cả models
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface mô tả shape của document
export interface IModelName extends Document {
  _id: Types.ObjectId;
  // ... fields
}

// Schema definition
const ModelNameSchema = new Schema<IModelName>(
  {
    // Required fields
    field1: { type: String, required: true, trim: true, uppercase: true },
    
    // Optional fields
    field2: { type: String, trim: true },
    
    // Reference fields
    refField: { type: Schema.Types.ObjectId, ref: 'OtherModel', index: true },
    
    // Enum fields
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },
    
    // Sync fields (cho hqnhat integration)
    externalId: { type: Number, sparse: true },
    externalSource: { type: String, enum: ['hqnhat', 'manual'], default: 'manual' },
    lastSyncedAt: Date,
    
    // Timestamps
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
ModelNameSchema.index({ field1: 1 }, { unique: true });
ModelNameSchema.index({ field2: 'text', field3: 'text' });
ModelNameSchema.index({ status: 1, createdAt: -1 });

export const ModelName = mongoose.model<IModelName>('ModelName', ModelNameSchema);
```

#### Enum Conventions

```typescript
// ✅ Status enums
type Status = 'draft' | 'pending' | 'published' | 'archived';

// ✅ Training Status
type TrainingStatus = 'studying' | 'reserved' | 'graduated' | 'dropped' | 'transferred';

// ✅ Academic Status
type AcademicTermStatus = 'planning' | 'registration' | 'studying' | 'finished';
type EnrollmentStatus = 'registered' | 'cancelled' | 'completed';
type GradeStatus = 'pending' | 'entered' | 'locked' | 'published';

// ✅ Warning Types
type WarningType = 'low_gpa' | 'failed_subject' | 'insufficient_credit' | 'academic_warning';

// ✅ Degree Classification
type DegreeClassification = 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình';
```

### 3.2 API Routes Pattern

```typescript
// ✅ RESTful API structure cho SIS

// Prefix: /api/sis

// Danh mục
POST   /majors                      // Tạo ngành
GET    /majors                      // Danh sách ngành
GET    /majors/:id                  // Chi tiết ngành
PUT    /majors/:id                  // Cập nhật ngành
DELETE /majors/:id                  // Xóa ngành

POST   /specializations             // Tạo chuyên ngành
GET    /specializations             // Danh sách chuyên ngành

POST   /training-systems            // Tạo hệ đào tạo
GET    /training-systems            // Danh sách hệ đào tạo

POST   /academic-terms             // Tạo học kỳ
GET    /academic-terms              // Danh sách học kỳ
GET    /academic-terms/current      // Học kỳ hiện tại

// Sinh viên
POST   /students                    // Tạo sinh viên
GET    /students                    // Danh sách sinh viên
GET    /students/:id                // Chi tiết sinh viên
PUT    /students/:id                // Cập nhật sinh viên
DELETE /students/:id                // Xóa sinh viên

GET    /students/:id/profile        // Hồ sơ mở rộng
PUT    /students/:id/profile        // Cập nhật hồ sơ

GET    /students/:id/status-history  // Lịch sử trạng thái
POST   /students/:id/reserve        // Bảo lưu
POST   /students/:id/dropout       // Thôi học
POST   /students/:id/change-major   // Chuyển ngành
POST   /students/:id/change-class   // Chuyển lớp

// Học phần & Đăng ký
POST   /courses                    // Mở lớp học phần
GET    /courses                    // Danh sách lớp học phần
GET    /courses/:id                // Chi tiết lớp học phần
PUT    /courses/:id                // Cập nhật lớp học phần

POST   /enrollments                // Đăng ký học phần
GET    /enrollments                // Danh sách đăng ký
DELETE /enrollments/:id            // Hủy đăng ký

// Lịch học
POST   /schedules                  // Tạo lịch học
GET    /schedules                  // Danh sách lịch học
PUT    /schedules/:id              // Cập nhật lịch
POST   /schedules/:id/change      // Thay đổi lịch

// Điểm
POST   /grades                     // Nhập điểm
GET    /grades                     // Danh sách điểm
PUT    /grades/:id                 // Cập nhật điểm
POST   /grades/:id/lock            // Khóa điểm
POST   /grades/:id/publish         // Công bố điểm

// GPA
GET    /students/:id/gpa           // Xem GPA
POST   /students/:id/gpa/calculate // Tính lại GPA

// Cảnh báo
GET    /warnings                   // Danh sách cảnh báo
POST   /warnings                   // Tạo cảnh báo
PUT    /warnings/:id/resolve       // Xử lý cảnh báo

// Tuyển sinh
POST   /admission-batches          // Tạo đợt tuyển sinh
GET    /admission-batches          // Danh sách đợt tuyển sinh
POST   /admission-batches/:id/import  // Import thí sinh
POST   /admission-batches/:id/enroll  // Nhập học

// Tốt nghiệp
GET    /graduation-sessions        // Danh sách đợt xét tốt nghiệp
POST   /graduation-sessions        // Tạo đợt xét
POST   /graduations                // Xét tốt nghiệp
GET    /graduations                // Danh sách tốt nghiệp
```

### 3.3 Frontend Components Pattern

#### 3.3.1 Page Structure - Danh sách + Modal

```
src/modules/sis/pages/
├── Dashboard.tsx                    # Dashboard chính
├── students/
│   ├── StudentList.tsx            # Trang danh sách + action buttons
│   ├── StudentModal.tsx           # Modal popup cho Create/Edit/View
│   └── StudentImportModal.tsx     # Modal import Excel
├── majors/
│   ├── MajorList.tsx
│   └── MajorModal.tsx             # Modal popup cho CRUD
├── academic-terms/
│   ├── AcademicTermList.tsx
│   └── AcademicTermModal.tsx
├── courses/
│   ├── CourseList.tsx
│   └── CourseModal.tsx
├── enrollments/
│   ├── EnrollmentList.tsx
│   └── EnrollmentModal.tsx
├── grades/
│   ├── GradeList.tsx
│   ├── GradeEntryModal.tsx        # Modal nhập điểm
│   └── GradeLockModal.tsx         # Modal khóa điểm
├── schedules/
│   ├── ScheduleList.tsx
│   └── ScheduleModal.tsx
├── warnings/
│   ├── WarningList.tsx
│   └── WarningModal.tsx
├── graduation/
│   ├── GraduationList.tsx
│   └── GraduationModal.tsx
├── admission/
│   ├── AdmissionBatchList.tsx
│   └── AdmissionBatchModal.tsx
└── internships/
    ├── InternshipList.tsx
    └── InternshipModal.tsx
```

#### 3.3.2 Action Buttons Pattern (Icons)

Dùng icons từ `lucide-react`. Quy tắc:
- Button trong table action column: `variant="ghost"`, `size="sm"`
- Icon size: `h-4 w-4`
- Màu sắc dùng CSS variable

![Action Buttons](file:///C:/Users/Acer/.cursor/projects/d-mokup-UMS/assets/c__Users_Acer_AppData_Roaming_Cursor_User_workspaceStorage_70cbd11dcc9b220091ce14cb539d31d6_images_image-9826b10b-9881-4b23-b819-54705af50765.png)

> **Icon Reference:** Hình trên minh họa các action buttons trong table row:
> - Icon `Eye` (xem chi tiết) - màu muted
> - Icon `Pencil` (sửa) - màu primary
> - Icon `Trash2` (xóa) - màu error

| Hành động | Icon | Màu Icon | Button Variant | Title/Tooltip |
|------------|------|----------|----------------|---------------|
| **Xem chi tiết** | `Eye` | `text-[rgb(var(--text-muted))]` | ghost | "Xem chi tiết" |
| **Thêm mới** | `Plus` | `text-[rgb(var(--primary))]` | default | - |
| **Sửa** | `Pencil` | `text-[rgb(var(--primary))]` | ghost | "Sửa" |
| **Xóa** | `Trash2` | `text-[rgb(var(--error))]` | ghost | "Xóa" |
| **Xuất Excel** | `Download` | - | outline | - |
| **Import Excel** | `Upload` | - | outline | - |
| **Khóa** | `Lock` | - | ghost | "Khóa" |
| **Mở khóa** | `Unlock` | - | ghost | "Mở khóa" |
| **Duyệt/Phê duyệt** | `Check` | `text-[rgb(var(--success))]` | ghost | "Duyệt" |
| **Từ chối** | `X` hoặc `XCircle` | `text-[rgb(var(--error))]` | ghost | "Từ chối" |
| **Tải về** | `Download` | - | ghost | "Tải file" |
| **Gửi email** | `Mail` | - | ghost | "Gửi email" |
| **In** | `Printer` | - | ghost | "In" |
| **Lịch** | `Calendar` | - | ghost | "Xem lịch" |
| **Cảnh báo** | `AlertTriangle` | `text-[rgb(var(--warning))]` | ghost | "Cảnh báo" |
| **Lịch sử** | `History` | - | ghost | "Lịch sử" |
| **Chi tiết** | `FileText` | - | ghost | "Xem file" |
| **Cấu hình** | `Settings` | - | ghost | "Cài đặt" |
| **Refresh** | `RefreshCw` | - | ghost | "Làm mới" |

#### 3.3.2.1 Icon Usage Examples

```tsx
// ✅ Actions trong Table Row
<div className="flex items-center justify-end gap-1">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleView(item)}
    title="Xem chi tiết"
  >
    <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
  </Button>

  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleEdit(item)}
    title="Sửa"
  >
    <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
  </Button>

  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleDelete(item)}
    title="Xóa"
  >
    <Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />
  </Button>
</div>

// ✅ Buttons trong PageHeader
<PageHeader
  title="Quản lý Ngành đào tạo"
  actions={
    <>
      <Button
        variant="outline"
        leftIcon={<Download className="h-4 w-4" />}
        onClick={handleExport}
      >
        Xuất Excel
      </Button>
      <Button
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={handleCreate}
      >
        Thêm mới
      </Button>
    </>
  }
/>

// ✅ Icon với Badge (Status)
<div className="flex items-center gap-2">
  <AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))]" />
  <Badge variant="warning">Cảnh báo</Badge>
</div>

// ✅ Icon với Text (Labels)
<div className="flex items-center gap-2 text-[rgb(var(--text-muted))]">
  <Calendar className="h-4 w-4" />
  <span>15/07/2026</span>
</div>
```

#### 3.3.2.2 Icon Color Reference

```typescript
// CSS Variable colors cho icons
const IconColors = {
  // Primary (màu chính - dùng cho Edit, Create)
  primary: 'text-[rgb(var(--primary))]',

  // Text muted (dùng cho View)
  muted: 'text-[rgb(var(--text-muted))]',

  // Success (dùng cho Approve, Pass)
  success: 'text-[rgb(var(--success))]',

  // Error (dùng cho Delete, Reject, Cancel)
  error: 'text-[rgb(var(--error))]',

  // Warning (dùng cho Warning)
  warning: 'text-[rgb(var(--warning))]',
};
```

#### 3.3.2.3 Icon Size Reference

```typescript
// Icon sizes
const IconSizes = {
  // Navigation items
  nav: 'h-5 w-5',

  // Button icons (với text)
  button: 'h-4 w-4',

  // Table action buttons
  table: 'h-4 w-4',

  // Badge/Dot icons
  badge: 'h-3 w-3',

  // Section headers
  section: 'h-5 w-5',

  // Empty state
  empty: 'h-12 w-12',
};
```

#### 3.3.3 List Page Pattern

```tsx
// ✅ Pattern chuẩn cho List Page với Modal

import { useState } from 'react';
import { Plus, Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button, Table, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

// Import Modal component
import { MajorModal } from './MajorModal';

export default function MajorList() {
  // Pagination
  const { pagination, setPage, setPageSize } = usePagination();
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: IMajor;
  }>({ isOpen: false, mode: 'create' });

  // Actions
  const handleView = (item: IMajor) => {
    setModalState({ isOpen: true, mode: 'view', data: item });
  };

  const handleEdit = (item: IMajor) => {
    setModalState({ isOpen: true, mode: 'edit', data: item });
  };

  const handleCreate = () => {
    setModalState({ isOpen: true, mode: 'create' });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'create' });
  };

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <PageHeader
        title="Quản lý Ngành đào tạo"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Ngành đào tạo' }
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              leftIcon={<Download className="h-4 w-4" />}
            >
              Xuất Excel
            </Button>
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleCreate}
            >
              Thêm ngành
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên ngành..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: 'all', label: 'Tất cả' },
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Không hoạt động' }
          ]}
        />
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã ngành</TableHeadCell>
            <TableHeadCell>Tên ngành</TableHeadCell>
            <TableHeadCell>Bậc đào tạo</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={item._id}>
              <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                {(pagination.page - 1) * pagination.pageSize + i + 1}
              </TableCell>
              <TableCell className="font-mono">{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{DEGREE_LEVEL[item.degreeLevel]}</TableCell>
              <TableCell>
                <Badge variant={item.isActive ? 'success' : 'neutral'}>
                  {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {/* View */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(item)}
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                  </Button>
                  
                  {/* Edit */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    title="Sửa"
                  >
                    <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
                  </Button>
                  
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Modal - Create/Edit/View */}
      <MajorModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        mode={modalState.mode}
        data={modalState.data}
      />
    </div>
  );
}
```

#### 3.3.4 Modal Pattern (Create/Edit/View)

```tsx
// ✅ Modal Pattern cho Create/Edit/View

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal, Button, Input, Select } from '@/components/ui';

interface MajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: IMajor;
}

export function MajorModal({ isOpen, onClose, mode, data }: MajorModalProps) {
  // Form state
  const form = useForm<MajorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      faculty: '',
      degreeLevel: 1,
    },
  });

  // Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen && data) {
      form.reset({
        code: data.code,
        name: data.name,
        faculty: data.faculty?._id,
        degreeLevel: data.degreeLevel,
      });
    } else if (isOpen && mode === 'create') {
      form.reset();
    }
  }, [isOpen, data, mode]);

  // Submit handler
  const onSubmit = async (values: MajorFormValues) => {
    try {
      if (mode === 'create') {
        await createMajor(values);
      } else {
        await updateMajor(data._id, values);
      }
      onClose();
      // Refresh list
    } catch (error) {
      // Handle error
    }
  };

  // Mode configurations
  const modeConfig = {
    create: { title: 'Thêm ngành đào tạo', submitText: 'Tạo mới' },
    edit: { title: 'Sửa ngành đào tạo', submitText: 'Lưu thay đổi' },
    view: { title: 'Chi tiết ngành đào tạo', submitText: null },
  };

  const config = modeConfig[mode];
  const isViewMode = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      size="md"
      footer={
        config.submitText ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              {config.submitText}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        )
      }
    >
      <form className="space-y-4">
        {/* Code */}
        <FormField 
          label="Mã ngành" 
          error={form.formState.errors.code?.message}
        >
          {isViewMode ? (
            <div className="font-mono">{data?.code}</div>
          ) : (
            <Input
              {...form.register('code')}
              placeholder="VD: CNTT"
              uppercase
            />
          )}
        </FormField>

        {/* Name */}
        <FormField 
          label="Tên ngành" 
          error={form.formState.errors.name?.message}
        >
          {isViewMode ? (
            <div>{data?.name}</div>
          ) : (
            <Input
              {...form.register('name')}
              placeholder="VD: Công nghệ thông tin"
            />
          )}
        </FormField>

        {/* Faculty */}
        <FormField 
          label="Khoa quản lý" 
          error={form.formState.errors.faculty?.message}
        >
          {isViewMode ? (
            <div>{data?.faculty?.name}</div>
          ) : (
            <Select
              {...form.register('faculty')}
              options={faculties.map(f => ({ value: f._id, label: f.name }))}
              placeholder="Chọn khoa"
            />
          )}
        </FormField>

        {/* Degree Level */}
        <FormField 
          label="Bậc đào tạo" 
          error={form.formState.errors.degreeLevel?.message}
        >
          {isViewMode ? (
            <div>{DEGREE_LEVEL[data?.degreeLevel]}</div>
          ) : (
            <Select
              {...form.register('degreeLevel', { valueAsNumber: true })}
              options={[
                { value: 1, label: 'Cử nhân' },
                { value: 2, label: 'Thạc sĩ' },
                { value: 3, label: 'Tiến sĩ' },
              ]}
            />
          )}
        </FormField>

        {/* View mode - Additional info */}
        {isViewMode && data && (
          <>
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Thông tin bổ sung</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[rgb(var(--text-muted))]">Trạng thái:</span>
                  <Badge variant={data.isActive ? 'success' : 'neutral'} className="ml-2">
                    {data.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
                <div>
                  <span className="text-[rgb(var(--text-muted))]">Ngày tạo:</span>
                  <span className="ml-2">{formatDate(data.createdAt)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
```

#### 3.3.5 Confirm Delete Modal

```tsx
// ✅ Confirm Delete Pattern

import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isLoading
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Xóa
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-[rgb(var(--error))]/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-[rgb(var(--error))]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
        <p className="text-[rgb(var(--text-muted))]">
          Bạn có chắc chắn muốn xóa <strong>{title}</strong> không?
        </p>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
          {itemName}
        </p>
        <p className="text-sm text-[rgb(var(--error))] mt-2">
          Hành động này không thể hoàn tác.
        </p>
      </div>
    </Modal>
  );
}
```

#### 3.3.6 Import Modal Pattern

```tsx
// ✅ Import Excel Modal Pattern

import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  templateUrl: string;
  uploadEndpoint: string;
}

export function ImportModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  templateUrl,
  uploadEndpoint,
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Preview file content
      previewExcelFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadFile(uploadEndpoint, file);
      onSuccess();
      onClose();
    } catch (error) {
      // Handle error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import ${title}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!file}
          >
            Import
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Download template */}
        <div className="flex items-center justify-between p-4 bg-[rgb(var(--bg-secondary))] rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-[rgb(var(--primary))]" />
            <div>
              <p className="font-medium">Tải file mẫu</p>
              <p className="text-sm text-[rgb(var(--text-muted))]">
                Sử dụng file mẫu để đảm bảo định dạng đúng
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => window.open(templateUrl)}
          >
            Tải mẫu
          </Button>
        </div>

        {/* Upload area */}
        <div className="border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-3 text-[rgb(var(--text-muted))]" />
            <p className="font-medium">Chọn file Excel</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">
              hoặc kéo thả file vào đây
            </p>
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Preview ({preview.length} dòng)</h4>
            <Table size="sm">
              {/* Preview table */}
            </Table>
          </div>
        )}
      </div>
    </Modal>
  );
}
```

#### 3.3.7 Nested Modal Pattern (Sub-entity)

```tsx
// ✅ Nested Modal - Khi entity có sub-entities

## 4. Coding Rules

### 4.1 Model Rules

### 4.1 Model Rules

```typescript
// ✅ BẮT BUỘC cho tất cả SIS models

// 1. Luôn có timestamps
const Schema = new Schema({ ... }, { timestamps: true });

// 2. Luôn có externalId/externalSource cho sync
externalId: { type: Number, sparse: true },
externalSource: { type: String, enum: ['hqnhat', 'manual'], default: 'manual' },
lastSyncedAt: Date,

// 3. Luôn có audit fields
createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

// 4. String fields phải trim
name: { type: String, required: true, trim: true }

// 5. Code fields phải uppercase
code: { type: String, required: true, uppercase: true }

// 6. Date fields phải có Date type
startDate: Date,
endDate: Date,

// 7. Index cho foreign keys
major: { type: Schema.Types.ObjectId, ref: 'Major', index: true },
student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },

// 8. Status fields phải có index
status: { type: String, enum: [...], default: '...', index: true },

// ❌ KHÔNG BAO GIỜ làm những điều sau

// Không hardcode enum values
status: String // ❌

// Không bỏ qua required
name: String // ❌

// Không quên unique index
code: { type: String, required: true } // ❌ Thiếu unique
```

### 4.2 Controller/Service Rules

```typescript
// ✅ Validation với Zod
import { z } from 'zod';

export const createStudentSchema = z.object({
  code: z.string().min(1, 'Mã sinh viên không được để trống'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  dob: z.string().datetime().optional(),
  gender: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
  major: z.string().min(1, 'Ngành không được để trống'),
  class: z.string().optional(),
  trainingSystem: z.string().optional(),
  course: z.string().optional(),
});

// ✅ Async handler pattern
import { asyncHandler } from '@/middleware/asyncHandler';

export const createStudent = asyncHandler(async (req, res) => {
  const data = createStudentSchema.parse(req.body);
  const student = await StudentService.create(data, req.user._id);
  res.status(201).json({ success: true, data: student });
});

// ✅ Service layer separation
class StudentService {
  static async create(data: CreateStudentInput, createdBy: ObjectId) {
    // Business logic here
    const student = new Student({
      ...data,
      createdBy,
      status: 'studying',
    });
    await student.save();
    
    // Create student log
    await StudentLogService.log({
      student: student._id,
      action: 'STUDENT_CREATED',
      description: `Sinh viên ${data.fullName} được tạo`,
      createdBy,
    });
    
    return student;
  }
}
```

### 4.3 Frontend Rules

```typescript
// ✅ TypeScript interfaces phải match với backend

// types/sis.ts
export interface IStudent {
  _id: string;
  code: string;
  fullName: string;
  dob?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  phone?: string;
  email?: string;
  address?: string;
  major: IMajor;
  class?: IStudentClass;
  specialization?: ISpecialization;
  trainingSystem?: ITrainingSystem;
  course?: ICourse;
  status: StudentStatus;
  enrollmentDate?: string;
  gpa?: number;
  totalCredits?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = 'studying' | 'reserved' | 'graduated' | 'dropped' | 'transferred';

// ✅ i18n keys phải có prefix 'sinhVien'
// src/locales/vi/sinhVien.json
{
  "title": "Quản lý Sinh viên",
  "list": {
    "title": "Danh sách sinh viên",
    "searchPlaceholder": "Tìm theo mã, tên, email..."
  },
  "status": {
    "studying": "Đang học",
    "reserved": "Bảo lưu",
    "graduated": "Đã tốt nghiệp",
    "dropped": "Thôi học",
    "transferred": "Đã chuyển"
  },
  "fields": {
    "code": "Mã sinh viên",
    "fullName": "Họ và tên",
    "dob": "Ngày sinh",
    "gender": "Giới tính",
    "major": "Ngành",
    "class": "Lớp",
    "gpa": "GPA",
    "status": "Trạng thái"
  },
  "actions": {
    "create": "Thêm sinh viên",
    "edit": "Sửa thông tin",
    "delete": "Xóa sinh viên",
    "viewProfile": "Xem hồ sơ",
    "transfer": "Chuyển lớp/ngành"
  },
  "messages": {
    "createSuccess": "Thêm sinh viên thành công",
    "updateSuccess": "Cập nhật thành công",
    "deleteSuccess": "Xóa sinh viên thành công",
    "confirmDelete": "Bạn có chắc muốn xóa sinh viên này?"
  }
}
```

---

## 5. Danh sách Models cần tạo/sửa

### 5.1 Models cần TẠO MỚI

| # | Model | File | Priority |
|---|-------|------|----------|
| 1 | TrainingSystem | `server/src/models/TrainingSystem.ts` | P1 |
| 2 | Specialization | `server/src/models/Specialization.ts` | P1 |
| 3 | AcademicTerm | `server/src/models/AcademicTerm.ts` | P1 |
| 4 | StudentProfile | `server/src/models/StudentProfile.ts` | P1 |
| 5 | ClassSchedule | `server/src/models/ClassSchedule.ts` | P2 |
| 6 | ScheduleChange | `server/src/models/ScheduleChange.ts` | P2 |
| 7 | GPAHistory | `server/src/models/GPAHistory.ts` | P2 |
| 8 | AcademicWarning | `server/src/models/AcademicWarning.ts` | P3 |
| 9 | StudentLog | `server/src/models/StudentLog.ts` | P3 |
| 10 | StudentStatusHistory | `server/src/models/StudentStatusHistory.ts` | P3 |
| 11 | StudentReservation | `server/src/models/StudentReservation.ts` | P3 |
| 12 | StudentDropout | `server/src/models/StudentDropout.ts` | P3 |
| 13 | StudentMajorChange | `server/src/models/StudentMajorChange.ts` | P3 |
| 14 | StudentClassChange | `server/src/models/StudentClassChange.ts` | P3 |
| 15 | AdmissionBatch | `server/src/models/AdmissionBatch.ts` | P4 |
| 16 | AdmissionStudent | `server/src/models/AdmissionStudent.ts` | P4 |
| 17 | SubjectType | `server/src/models/SubjectType.ts` | P4 |
| 18 | SubjectPrerequisite | `server/src/models/SubjectPrerequisite.ts` | P4 |
| 19 | SubjectCondition | `server/src/models/SubjectCondition.ts` | P4 |

### 5.2 Models cần CẬP NHẬT

| # | Model | Thay đổi | Priority |
|---|-------|----------|----------|
| 1 | Student | Thêm fields, sửa enum status | P1 |
| 2 | Enrollment | Mở rộng fields điểm, thêm enrollment status | P1 |
| 3 | Major | Thêm trainingSystem, degreeLevel | P2 |
| 4 | Subject | Thêm subjectType, theoryHours, practiceHours, labHours | P2 |
| 5 | Curriculum | Thêm specialization, trainingSystem, course, electiveCredit | P2 |
| 6 | Course | Thêm academicTerm, phân biệt với course (khóa) | P2 |
| 7 | Graduation | Mở rộng fields, sửa enum | P3 |
| 8 | StudentClass | Thêm course ref | P3 |

### 5.3 Frontend cần tạo

```
src/modules/sis/
├── pages/
│   ├── specializations/
│   │   ├── SpecializationList.tsx
│   │   ├── SpecializationCreate.tsx
│   │   └── SpecializationEdit.tsx
│   ├── training-systems/
│   │   ├── TrainingSystemList.tsx
│   │   ├── TrainingSystemCreate.tsx
│   │   └── TrainingSystemEdit.tsx
│   ├── academic-terms/
│   │   ├── AcademicTermList.tsx
│   │   ├── AcademicTermCreate.tsx
│   │   └── AcademicTermEdit.tsx
│   ├── schedules/
│   │   ├── ScheduleList.tsx
│   │   ├── ScheduleCalendar.tsx
│   │   └── ScheduleChange.tsx
│   ├── grades/
│   │   ├── GradeList.tsx
│   │   ├── GradeEntry.tsx
│   │   └── GradeLock.tsx
│   ├── warnings/
│   │   ├── WarningList.tsx
│   │   └── WarningDetail.tsx
│   ├── admission/
│   │   ├── BatchList.tsx
│   │   ├── BatchDetail.tsx
│   │   ├── CandidateImport.tsx
│   │   └── EnrollmentConfirm.tsx
│   └── gpa/
│       ├── GPAHistory.tsx
│       └── GPACalculator.tsx
├── components/
│   ├── StudentProfileForm.tsx
│   ├── EnrollmentForm.tsx
│   ├── GradeForm.tsx
│   ├── ScheduleForm.tsx
│   └── WarningForm.tsx
├── hooks/
│   ├── useStudents.ts
│   ├── useEnrollments.ts
│   ├── useSchedules.ts
│   ├── useGrades.ts
│   └── useAcademicWarnings.ts
├── services/
│   ├── student.service.ts
│   ├── enrollment.service.ts
│   ├── schedule.service.ts
│   ├── grade.service.ts
│   └── graduation.service.ts
└── types/
    ├── student.types.ts
    ├── enrollment.types.ts
    ├── schedule.types.ts
    ├── grade.types.ts
    └── graduation.types.ts
```

---

## 6. Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Tạo migration scripts
- [ ] Viết unit tests cho models mới
- [ ] Review code với team

### Phase 1 - Foundation
- [ ] Tạo TrainingSystem model
- [ ] Tạo Specialization model
- [ ] Tạo AcademicTerm model
- [ ] Tạo API routes cho 3 model trên
- [ ] Tạo Frontend cho 3 model
- [ ] Viết seed data
- [ ] Test integration

### Phase 2 - Core
- [ ] Cập nhật Student model (thêm fields)
- [ ] Tạo StudentProfile model
- [ ] Cập nhật Enrollment model (thêm fields)
- [ ] Cập nhật StudentClass model
- [ ] Viết migration script cho existing data
- [ ] Test với existing records

### Phase 3 - Schedules & Grades
- [ ] Tạo ClassSchedule model
- [ ] Tạo ScheduleChange model
- [ ] Tạo GPAHistory model
- [ ] Cập nhật Enrollment → Grade fields
- [ ] Viết GPA calculation logic
- [ ] Test schedule conflict detection

### Phase 4 - Student Management
- [ ] Tạo StudentStatusHistory model
- [ ] Tạo StudentReservation model
- [ ] Tạo StudentDropout model
- [ ] Tạo StudentMajorChange model
- [ ] Tạo StudentClassChange model
- [ ] Implement status change workflows

### Phase 5 - Admission & Graduation
- [ ] Tạo AdmissionBatch model
- [ ] Tạo AdmissionStudent model
- [ ] Cập nhật Graduation model
- [ ] Implement enrollment workflow
- [ ] Implement graduation check logic

### Phase 6 - Curriculum Extension
- [ ] Tạo SubjectType model
- [ ] Tạo SubjectPrerequisite model
- [ ] Tạo SubjectCondition model
- [ ] Cập nhật Curriculum model
- [ ] Implement prerequisite check in enrollment

### Post-Migration
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Update API documentation
- [ ] Update frontend types
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 7. Dependencies & Order

```
Phase 1 Dependencies:
  AcademicTerm → Course, Enrollment, GPAHistory, AcademicWarning

Phase 2 Dependencies:
  AcademicTerm → Enrollment (enrollmentDate, semester)
  Major + TrainingSystem → Student (major, trainingSystem)
  StudentClass → Student (class)

Phase 3 Dependencies:
  Course → ClassSchedule
  Subject → ClassSchedule (lecturer)
  Enrollment → GPAHistory

Phase 4 Dependencies:
  Student → StudentProfile, StudentStatusHistory
  AcademicTerm → StudentReservation

Phase 5 Dependencies:
  AdmissionBatch → AdmissionStudent
  Student + GPAHistory → Graduation

Phase 6 Dependencies:
  Subject → SubjectPrerequisite, SubjectCondition
  Curriculum → Subject (link)
```

---

## 8. Notes

### Naming Conventions

| Database | MongoDB | Frontend |
|----------|---------|----------|
| `student_code` | `code` | `code` |
| `full_name` | `fullName` | `fullName` |
| `date_of_birth` | `dob` hoặc `dateOfBirth` | `dateOfBirth` |
| `created_at` | `createdAt` | `createdAt` |
| `is_active` | `isActive` hoặc `status` | `status` |

### Vietnamese Labels

- Ngành đào tạo: Major
- Chuyên ngành: Specialization
- Hệ đào tạo: TrainingSystem
- Khóa học: Course (niên khóa)
- Học kỳ: AcademicTerm
- Lớp hành chính: StudentClass
- Lớp học phần: CourseSection
- Chương trình đào tạo: Curriculum
- Học phần: Subject
- Đăng ký học phần: Enrollment
- Lịch học: ClassSchedule

---

**Document version:** 1.0  
**Last updated:** 15/07/2026

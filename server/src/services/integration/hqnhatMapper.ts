import { Types } from 'mongoose';
import type { ISubject } from '../../models/Subject.js';
import type { ICurriculum } from '../../models/Curriculum.js';
import type { IStudent } from '../../models/Student.js';
import type { IDepartment } from '../../models/Department.js';
import type { IVienChuc } from '../../models/VienChuc.js';
import type {
  FacultyOptionDto,
  MajorDto,
  MajorStatusCode,
  CourseGroupDto,
  CourseDto,
  CurriculumDto,
  CurriculumDegreeLevel,
  StudentClassDto,
  StudentClassStatus,
  StudentProfileDto,
  UserDto,
} from '../../integrations/hqnhat.types.js';

/**
 * Constants cho hours conversion:
 * 1 tín chỉ lý thuyết = 15 tiết
 * 1 tín chỉ thực hành = 30 tiết
 */
export const HOURS_PER_THEORY_CREDIT = 15;
export const HOURS_PER_PRACTICE_CREDIT = 30;

/**
 * Ước lượng tỷ lệ lý thuyết/thực hành từ total_credits khi API không cung cấp
 * theory_credits / pratical_credits chi tiết.
 *
 * Lý do: api.hqnhat.id.vn hiện chỉ trả về `total_credits` cho Course,
 * không có breakdown lý thuyết/thực hành.
 *
 * Heuristic dựa trên quy chế đào tạo VN:
 *   - total_credits = 1 → 100% lý thuyết (môn nhỏ, seminar)
 *   - total_credits = 2 → 70% lý thuyết / 30% thực hành
 *   - total_credits = 3 → 60% / 40%
 *   - total_credits ≥ 4 → 50% / 50%
 */
function estimateTheoryPracticeSplit(totalCredits: number): {
  theory: number;
  practice: number;
} {
  const tc = Math.max(0, totalCredits || 0);
  if (tc <= 1) return { theory: tc, practice: 0 };
  if (tc === 2) return { theory: 1, practice: 1 }; // 50/50, làm tròn
  if (tc === 3) return { theory: 2, practice: 1 };
  return { theory: Math.floor(tc / 2), practice: Math.ceil(tc / 2) };
}

const DEGREE_LEVEL_TO_UMS: Record<CurriculumDegreeLevel, 'Cử nhân' | 'Thạc sĩ' | 'Tiến sĩ'> = {
  1: 'Cử nhân',
  2: 'Thạc sĩ',
  3: 'Tiến sĩ',
};

const MAJOR_STATUS_TO_UMS: Record<
  MajorStatusCode,
  'draft' | 'pending' | 'published' | 'archived'
> = {
  0: 'draft',
  1: 'published',
  2: 'archived',
};

const CLASS_STATUS_TO_UMS: Record<
  StudentClassStatus,
  'disbanded' | 'active' | 'graduated'
> = {
  0: 'disbanded',
  1: 'active',
  2: 'graduated',
};

/**
 * Training type → duration years (ước lượng hợp lý):
 *   1 Full-time → 4 năm (Cử nhân), Master/Doctorate → duration do CTĐT quyết định
 *   2 Part-time → 5 năm
 *   3 Distance → 5 năm
 */
function trainingTypeToDurationYears(
  trainingType: CurriculumDto['training_type']
): number {
  switch (trainingType) {
    case 1:
      return 4;
    case 2:
      return 5;
    case 3:
      return 5;
    default:
      return 4;
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────
/**
 * Stable hash đơn giản dựa trên JSON.stringify với key sort đệ quy — dùng để delta sync.
 * Không cần crypto-grade, chỉ cần phát hiện thay đổi nhanh.
 */
export function payloadHash(payload: unknown): string {
  const sorted = deepSortKeys(payload);
  const json = JSON.stringify(sorted);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const chr = json.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

function deepSortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepSortKeys);
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = deepSortKeys(obj[key]);
    }
    return sorted;
  }
  return value;
}

// ─── Faculty → Department ────────────────────────────────────────────────────
export function facultyToDepartment(
  dto: FacultyOptionDto
): Partial<IDepartment> {
  return {
    code: dto.code.toUpperCase(),
    name: dto.name,
    type: 'faculty',
    isActive: true,
  };
}

// ─── Major → Major ───────────────────────────────────────────────────────────
export function majorDtoToMajor(
  dto: MajorDto,
  facultyObjectId: Types.ObjectId
): Partial<import('../../models/Major.js').IMajor> {
  return {
    code: dto.code.toUpperCase(),
    name: dto.name,
    description: dto.description,
    faculty: facultyObjectId,
    status: MAJOR_STATUS_TO_UMS[dto.status] ?? 'draft',
    externalId: dto.id,
    externalSource: 'hqnhat',
    lastSyncedAt: new Date(),
    isActive: true,
  };
}

// ─── CourseGroup → CourseGroup ────────────────────────────────────────────────
export function courseGroupDtoToCourseGroup(
  dto: CourseGroupDto,
  parentObjectId?: Types.ObjectId | null
): Partial<import('../../models/CourseGroup.js').ICourseGroup> {
  return {
    name: dto.name,
    parent: parentObjectId ?? undefined,
    externalId: dto.id,
    externalSource: 'hqnhat',
    lastSyncedAt: new Date(),
    isActive: true,
    order: 0,
  };
}

// ─── Course → Subject ─────────────────────────────────────────────────────────
/**
 * Mapping quan trọng nhất:
 *   Course.total_credits → Subject.credits
 *   Course.theory_credits × 15 → Subject.theoryHours
 *   Course.pratical_credits × 30 → Subject.practiceHours
 *
 * Lưu ý: api.hqnhat.id.vn hiện chỉ trả về total_credits.
 * Nếu theory/pratical không có, sẽ ước lượng bằng estimateTheoryPracticeSplit().
 */
export function courseDtoToSubject(
  dto: CourseDto,
  departmentObjectId?: Types.ObjectId,
  groupObjectIds?: Types.ObjectId[]
): Partial<ISubject> {
  const totalCredits = dto.total_credits ?? 0;
  const hasBreakdown =
    typeof dto.theory_credits === 'number' &&
    typeof dto.pratical_credits === 'number';

  const { theory, practice } = hasBreakdown
    ? { theory: dto.theory_credits!, practice: dto.pratical_credits! }
    : estimateTheoryPracticeSplit(totalCredits);

  return {
    code: dto.code.toUpperCase(),
    name: dto.name,
    credits: totalCredits,
    theoryHours: theory * HOURS_PER_THEORY_CREDIT,
    practiceHours: practice * HOURS_PER_PRACTICE_CREDIT,
    description: dto.description,
    isActive: dto.is_active ?? true,
    department: departmentObjectId,
    prerequisite: groupObjectIds,
    externalId: dto.id,
    externalSource: 'hqnhat',
    lastSyncedAt: new Date(),
  };
}

// ─── Curriculum → Curriculum ─────────────────────────────────────────────────
export interface CurriculumMappingContext {
  facultyObjectId: Types.ObjectId;
  majorObjectId: Types.ObjectId;
}

export function curriculumDtoToCurriculum(
  dto: CurriculumDto,
  ctx: CurriculumMappingContext
): Partial<ICurriculum> {
  // Status mapping (API status: 0-Draft, 1-Active, 2-Archived)
  const statusMap: Record<0 | 1 | 2, 'draft' | 'active' | 'archived'> = {
    0: 'draft',
    1: 'active',
    2: 'archived',
  };

  return {
    name: dto.name,
    code: `CURR-${dto.cohort_year}-${dto.major_id}-${dto.id}`, // unique code generator
    department: ctx.facultyObjectId,
    major: ctx.majorObjectId,
    degreeType: DEGREE_LEVEL_TO_UMS[dto.degree_level] ?? 'Cử nhân',
    durationYears: trainingTypeToDurationYears(dto.training_type),
    totalCredits: dto.required_credits + dto.elective_credits,
    effectiveYear: dto.cohort_year,
    status: dto.status !== undefined ? statusMap[dto.status] : 'draft',
    description: dto.major ? `Ngành: ${dto.major}` : '',
    subjects: [],
    externalId: dto.id,
    externalSource: 'hqnhat',
    lastSyncedAt: new Date(),
  };
}

// ─── StudentClass → StudentClass ──────────────────────────────────────────────
export interface StudentClassMappingContext {
  facultyObjectId: Types.ObjectId;
  majorObjectId: Types.ObjectId;
  advisorObjectId?: Types.ObjectId;
}

export function studentClassDtoToStudentClass(
  dto: StudentClassDto,
  ctx: StudentClassMappingContext
): Partial<import('../../models/StudentClass.js').IStudentClass> {
  const code = dto.name
    .toUpperCase()
    .replace(/\s+/g, '')
    .slice(0, 20);
  return {
    code,
    name: dto.name,
    cohort: dto.cohort,
    faculty: ctx.facultyObjectId,
    major: ctx.majorObjectId,
    academicAdvisor: ctx.advisorObjectId,
    status: CLASS_STATUS_TO_UMS[dto.status] ?? 'active',
    externalId: dto.id,
    externalSource: 'hqnhat',
    lastSyncedAt: new Date(),
    isActive: true,
    studentCount: 0,
  };
}

// ─── Student (merged profile + user) → Student ───────────────────────────────
// API thật trả về merged DTO có cả profile và user info trong /api/academic/students
export interface StudentMappingContext {
  facultyObjectId: Types.ObjectId;
  majorObjectId?: Types.ObjectId;
  curriculumObjectId?: Types.ObjectId;
  classObjectId?: Types.ObjectId;
  userObjectId?: Types.ObjectId;
}

/**
 * Tách tên tiếng Việt:
 *   - first_name là TÊN (cuối cùng)
 *   - last_middle_name là HỌ + TÊN ĐỆM
 *   - UMS hiển thị Họ + Đệm + Tên → ghép lại: `last_middle_name + ' ' + first_name`
 */
export function buildFullName(
  firstName: string | undefined,
  lastMiddleName: string | undefined
): string {
  const parts = [lastMiddleName, firstName]
    .map((s) => (s || '').trim())
    .filter(Boolean);
  return parts.join(' ').trim().replace(/\s+/g, ' ');
}

/**
 * Map student status (integer) → UMS enum.
 * Vì spec không ghi rõ mapping, dùng heuristic:
 *   1 → studying (default)
 *   2 → graduated
 *   3 → suspended
 *   4 → expelled
 *   5 → reserved
 *   khác → studying
 */
export function studentStatusToUms(
  status: number
): 'studying' | 'graduated' | 'suspended' | 'expelled' | 'reserved' {
  switch (status) {
    case 1:
      return 'studying';
    case 2:
      return 'graduated';
    case 3:
      return 'suspended';
    case 4:
      return 'expelled';
    case 5:
      return 'reserved';
    default:
      return 'studying';
  }
}

/**
 * Map merged StudentProfileDto từ API thật → UMS Student model.
 * API thật KHÔNG trả về: email, gender, gpa, accumulated_credits, admission_date
 * → các fields optional sẽ undefined.
 */
export function studentProfileDtoToStudent(
  dto: StudentProfileDto,
  ctx: StudentMappingContext
): Partial<IStudent> {
  return {
    code: dto.student_code,
    name: buildFullName(dto.first_name, dto.last_middle_name),
    dob: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
    phone: dto.phone_1 || undefined,
    avatar: dto.avatar || undefined,
    department: ctx.facultyObjectId,
    courseYear: parseCohortToCourseYear(dto.cohort),
    enrollmentDate: dto.admission_date ? new Date(dto.admission_date) : undefined,
    status: studentStatusToUms(dto.status),
    gpa: dto.gpa,
    totalCredits: dto.accumulated_credits,
    user: ctx.userObjectId,
    cohort: dto.cohort,
    facultyExternalId: dto.faculty_id,
    externalId: dto.id,
    externalSource: 'hqnhat',
    lastSyncedAt: new Date(),
    className: '', // populated từ classObjectId
  };
}

/**
 * Backward-compat: build từ UserDto riêng (cho code cũ)
 */
export function studentFromUserDto(dto: UserDto): Partial<IStudent> {
  return {
    code: dto.student_code,
    name: buildFullName(dto.first_name, dto.last_middle_name),
    dob: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
    phone: dto.phone_1 || undefined,
    avatar: dto.avatar || undefined,
    courseYear: 1, // unknown without cohort
    status: studentStatusToUms(dto.status),
  };
}

/**
 * Parse cohort thành courseYear.
 * Lưu ý: "K45", "K65" là mã khóa legacy VN (Khoá 45, Khoá 65) — KHÔNG phải năm.
 * API không trả về năm nhập học, nên ta mặc định trả 1 (sinh viên năm nhất).
 * Nếu cohort là 4-digit year (e.g. "2024"), tính năm học hiện tại.
 */
export function parseCohortToCourseYear(cohort: string): number {
  if (!cohort) return 1;
  const m = cohort.match(/(\d{2,4})/);
  if (!m) return 1;
  const n = parseInt(m[1], 10);

  // 4-digit year: derive năm học
  if (n >= 1000) {
    const currentYear = new Date().getFullYear();
    const diff = currentYear - n + 1;
    return Math.max(1, Math.min(diff, 10));
  }

  // 2-digit "K45"/"K65" code: return 1 as default
  // (admin có thể update thủ công sau)
  return 1;
}

// ─── VienChuc mapping (cho academic advisor) ─────────────────────────────────
export function advisorDtoToVienChuc(
  user: UserDto,
  facultyObjectId: Types.ObjectId
): Partial<IVienChuc> {
  return {
    code: user.student_code, // fallback
    name: buildFullName(user.first_name, user.last_middle_name),
    email: '',
    phone: user.phone_1 || '',
    department: facultyObjectId,
    status: 'active',
    position: 'Giảng viên',
  };
}

// ─── Re-exports ──────────────────────────────────────────────────────────────
export {
  DEGREE_LEVEL_TO_UMS,
  MAJOR_STATUS_TO_UMS,
  CLASS_STATUS_TO_UMS,
};
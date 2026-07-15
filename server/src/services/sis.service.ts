// @ts-nocheck
import { Student as StudentModel, IStudent } from '../models/Student.js';
import { StudentProfile as StudentProfileModel, IStudentProfile } from '../models/StudentProfile.js';
import { Subject as SubjectModel, ISubject } from '../models/Subject.js';
import { Course as CourseModel, ICourse } from '../models/Course.js';
import { Enrollment as EnrollmentModel, IEnrollment } from '../models/Enrollment.js';
import { Curriculum as CurriculumModel, ICurriculum } from '../models/Curriculum.js';
import { GraduationSession as GraduationSessionModel, IGraduationSession } from '../models/GraduationSession.js';
import { Graduation as GraduationModel, IGraduation } from '../models/Graduation.js';
import { Internship as InternshipModel, IInternship } from '../models/Internship.js';
import { TrainingSystem as TrainingSystemModel, ITrainingSystem } from '../models/TrainingSystem.js';
import { Specialization as SpecializationModel, ISpecialization } from '../models/Specialization.js';
import { AcademicTerm as AcademicTermModel, IAcademicTerm } from '../models/AcademicTerm.js';
import '../models/Department.js'; // Ensure Department model is registered first
import '../models/User.js'; // Ensure User model is registered for populate
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

export class SisService {
  // ─── Students ─────────────────────────────────────────────────────────────

  async createStudent(data: any, userId: string): Promise<IStudent> {
    const existing = await StudentModel.findOne({ code: data.code?.toUpperCase() });
    if (existing) throw new Error(`Mã sinh viên ${data.code} đã tồn tại`);

    const student = new StudentModel({
      ...data,
      code: data.code?.toUpperCase(),
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      class: data.class ? new Types.ObjectId(data.class) : undefined,
      specialization: data.specialization ? new Types.ObjectId(data.specialization) : undefined,
      trainingSystem: data.trainingSystem ? new Types.ObjectId(data.trainingSystem) : undefined,
      course: data.course ? new Types.ObjectId(data.course) : undefined,
      user: data.user ? new Types.ObjectId(data.user) : undefined,
      enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : undefined,
      dob: data.dob ? new Date(data.dob) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await student.save();
    return student;
  }

  async getStudentById(id: string): Promise<IStudent | null> {
    return StudentModel.findById(id)
      .populate('department', 'name code')
      .populate('class', 'name code')
      .populate('specialization', 'name code')
      .populate('trainingSystem', 'name code')
      .populate('course', 'name code')
      .populate('user', 'email displayName');
  }

  async listStudents(filters: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    class?: string;
    specialization?: string;
    trainingSystem?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 10, search, department, class: classId, specialization, trainingSystem, status } = filters;
    const filter: FilterQuery<IStudent> = {};
    if (department) filter.department = new Types.ObjectId(department);
    if (classId) filter.class = new Types.ObjectId(classId);
    if (specialization) filter.specialization = new Types.ObjectId(specialization);
    if (trainingSystem) filter.trainingSystem = new Types.ObjectId(trainingSystem);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      StudentModel.find(filter)
        .populate('department', 'name code')
        .populate('class', 'name code')
        .populate('specialization', 'name code')
        .populate('trainingSystem', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      StudentModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudent[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateStudent(id: string, data: any, userId: string): Promise<IStudent | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.department) update.department = new Types.ObjectId(data.department);
    if (data.class) update.class = new Types.ObjectId(data.class);
    if (data.specialization) update.specialization = new Types.ObjectId(data.specialization);
    if (data.trainingSystem) update.trainingSystem = new Types.ObjectId(data.trainingSystem);
    if (data.course) update.course = new Types.ObjectId(data.course);
    if (data.dob) update.dob = new Date(data.dob);
    if (data.enrollmentDate) update.enrollmentDate = new Date(data.enrollmentDate);
    return StudentModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await StudentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStudentStats() {
    const [total, byStatus, byGender, bySpecialization] = await Promise.all([
      StudentModel.countDocuments(),
      StudentModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      StudentModel.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),
      StudentModel.aggregate([
        { $match: { specialization: { $exists: true } } },
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $lookup: { from: 'specializations', localField: '_id', foreignField: '_id', as: 'spec' } },
        { $unwind: '$spec' },
        { $project: { _id: '$spec.name', count: 1 } },
      ]),
    ]);
    return { total, byStatus, byGender, bySpecialization };
  }

  // ─── Student Profiles ─────────────────────────────────────────────────────

  async createOrUpdateStudentProfile(studentId: string, data: any): Promise<IStudentProfile> {
    const profile = await StudentProfileModel.findOneAndUpdate(
      { student: new Types.ObjectId(studentId) },
      { $set: { ...data, student: new Types.ObjectId(studentId) } },
      { upsert: true, new: true, runValidators: true }
    );
    return profile;
  }

  async getStudentProfile(studentId: string): Promise<IStudentProfile | null> {
    return StudentProfileModel.findOne({ student: new Types.ObjectId(studentId) });
  }

  async updateStudentProfile(studentId: string, data: any): Promise<IStudentProfile | null> {
    return StudentProfileModel.findOneAndUpdate(
      { student: new Types.ObjectId(studentId) },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  // ─── Subjects ─────────────────────────────────────────────────────────────

  async createSubject(data: any): Promise<ISubject> {
    const existing = await SubjectModel.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error(`Mã môn học ${data.code} đã tồn tại`);
    const subject = new SubjectModel({
      ...data,
      code: data.code.toUpperCase(),
      department: data.department ? new Types.ObjectId(data.department) : undefined,
    });
    await subject.save();
    return subject;
  }

  async listSubjects(filters: { page?: number; pageSize?: number; search?: string; department?: string; isActive?: boolean }) {
    const { page = 1, pageSize = 20, search, department, isActive } = filters;
    const filter: FilterQuery<ISubject> = {};
    if (department) filter.department = new Types.ObjectId(department);
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      SubjectModel.find(filter)
        .populate('department', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ code: 1 })
        .lean(),
      SubjectModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ISubject[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getSubjectById(id: string): Promise<ISubject | null> {
    return SubjectModel.findById(id).populate('department', 'name code');
  }

  async updateSubject(id: string, data: any): Promise<ISubject | null> {
    const update: Record<string, any> = { ...data };
    if (data.department) update.department = new Types.ObjectId(data.department);
    return SubjectModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = await SubjectModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Courses ──────────────────────────────────────────────────────────────

  async createCourse(data: any, userId: string): Promise<ICourse> {
    const course = new CourseModel({
      ...data,
      subject: new Types.ObjectId(data.subject),
      lecturer: data.lecturer ? new Types.ObjectId(data.lecturer) : undefined,
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await course.save();
    return course;
  }

  async listCourses(filters: { page?: number; pageSize?: number; subject?: string; semester?: number; academicYear?: string; status?: string; lecturer?: string; search?: string }) {
    const { page = 1, pageSize = 10, subject, semester, academicYear, status, lecturer, search } = filters;
    const filter: FilterQuery<ICourse> = {};
    if (subject) filter.subject = new Types.ObjectId(subject);
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    if (lecturer) filter.lecturer = new Types.ObjectId(lecturer);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      CourseModel.find(filter)
        .populate('subject', 'name code credits')
        .populate('lecturer', 'name code')
        .populate('department', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ academicYear: -1, semester: -1 })
        .lean(),
      CourseModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ICourse[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getCourseById(id: string): Promise<ICourse | null> {
    return CourseModel.findById(id)
      .populate('subject')
      .populate('lecturer', 'name code email')
      .populate('department', 'name code');
  }

  async updateCourse(id: string, data: any, userId: string): Promise<ICourse | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.subject) update.subject = new Types.ObjectId(data.subject);
    if (data.lecturer) update.lecturer = new Types.ObjectId(data.lecturer);
    return CourseModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteCourse(id: string): Promise<boolean> {
    await EnrollmentModel.deleteMany({ course: id });
    const result = await CourseModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────

  async createEnrollment(data: { student: string; course: string; academicTerm: string }, _userId: string): Promise<IEnrollment> {
    const course = await CourseModel.findById(data.course);
    if (!course) throw new Error('Lớp học phần không tồn tại');
    if (course.enrolledCount >= course.maxStudents) throw new Error('Lớp đã đầy');
    if (course.status !== 'open') throw new Error('Lớp chưa mở đăng ký');

    const existing = await EnrollmentModel.findOne({ 
      student: new Types.ObjectId(data.student), 
      course: new Types.ObjectId(data.course) 
    });
    if (existing) throw new Error('Sinh viên đã đăng ký lớp này');

    const enrollment = new EnrollmentModel({
      student: new Types.ObjectId(data.student),
      course: new Types.ObjectId(data.course),
      academicTerm: new Types.ObjectId(data.academicTerm),
      status: 'registered',
      registeredAt: new Date(),
    });
    await enrollment.save();
    await CourseModel.findByIdAndUpdate(data.course, { $inc: { enrolledCount: 1 } });
    return enrollment;
  }

  async listEnrollments(filters: { 
    page?: number; 
    pageSize?: number; 
    student?: string; 
    course?: string; 
    academicTerm?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 10, student, course, academicTerm, status } = filters;
    const filter: FilterQuery<IEnrollment> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (course) filter.course = new Types.ObjectId(course);
    if (academicTerm) filter.academicTerm = new Types.ObjectId(academicTerm);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      EnrollmentModel.find(filter)
        .populate('student', 'name code class department specialization gpa totalCredits status')
        .populate('course', 'name code semester academicYear lecturer enrolledCount maxStudents')
        .populate('academicTerm', 'code academicYear semester')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ registeredAt: -1 })
        .lean(),
      EnrollmentModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IEnrollment[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getEnrollmentById(id: string): Promise<IEnrollment | null> {
    return EnrollmentModel.findById(id)
      .populate('student', 'name code class department specialization gpa totalCredits status')
      .populate('course', 'name code semester academicYear lecturer')
      .populate('academicTerm', 'code academicYear semester')
      .populate('gradedBy', 'name email')
      .populate('lockedBy', 'name email');
  }

  async updateEnrollment(id: string, data: any): Promise<IEnrollment | null> {
    const update: Record<string, any> = { ...data };
    if (data.academicTerm) update.academicTerm = new Types.ObjectId(data.academicTerm);
    return EnrollmentModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async gradeEnrollment(id: string, data: {
    attendanceScore?: number;
    assignmentScore?: number;
    midtermScore?: number;
    finalScore?: number;
  }, userId: string): Promise<IEnrollment | null> {
    // Check if enrollment is locked
    const enrollment = await EnrollmentModel.findById(id);
    if (!enrollment) return null;
    if (enrollment.isLocked) throw new Error('Điểm đã bị khóa, không thể sửa');

    const updateData = {
      ...data,
      gradedBy: new Types.ObjectId(userId),
      gradedAt: new Date(),
    };
    return EnrollmentModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async lockEnrollment(id: string, userId: string): Promise<IEnrollment | null> {
    return EnrollmentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: new Types.ObjectId(userId),
        },
      },
      { new: true, runValidators: true }
    );
  }

  async unlockEnrollment(id: string): Promise<IEnrollment | null> {
    return EnrollmentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isLocked: false,
        },
        $unset: {
          lockedAt: 1,
          lockedBy: 1,
        },
      },
      { new: true }
    );
  }

  async cancelEnrollment(id: string): Promise<IEnrollment | null> {
    const enrollment = await EnrollmentModel.findById(id);
    if (enrollment?.isLocked) throw new Error('Điểm đã bị khóa, không thể hủy');

    return EnrollmentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    const enrollment = await EnrollmentModel.findById(id);
    if (!enrollment) return false;
    if (enrollment.isLocked) throw new Error('Điểm đã bị khóa, không thể xóa');

    await EnrollmentModel.findByIdAndDelete(id);
    await CourseModel.findByIdAndUpdate(enrollment.course, { $inc: { enrolledCount: -1 } });
    return true;
  }

  // ─── Curricula ────────────────────────────────────────────────────────────

  async createCurriculum(data: any, userId: string): Promise<ICurriculum> {
    const subjects = data.subjects.map((s: any) => ({ ...s, subject: new Types.ObjectId(s.subject) }));
    const curriculum = new CurriculumModel({
      ...data,
      year: data.effectiveYear ?? data.year ?? new Date().getFullYear(),
      department: new Types.ObjectId(data.department),
      subjects,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await curriculum.save();
    return curriculum;
  }

  async listCurricula(filters: { page?: number; pageSize?: number; department?: string; status?: string; degreeType?: string }) {
    const { page = 1, pageSize = 10, department, status, degreeType } = filters;
    const filter: FilterQuery<ICurriculum> = {};
    if (department) filter.department = new Types.ObjectId(department);
    if (status) filter.status = status;
    if (degreeType) filter.degreeType = degreeType;

    const [data, total] = await Promise.all([
      CurriculumModel.find(filter)
        .populate('department', 'name code')
        .populate('subjects.subject', 'name code credits')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ year: -1 })
        .lean(),
      CurriculumModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ICurriculum[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getCurriculumById(id: string): Promise<ICurriculum | null> {
    return CurriculumModel.findById(id)
      .populate('department', 'name code')
      .populate('subjects.subject', 'name code credits');
  }

  async updateCurriculum(id: string, data: any, userId: string): Promise<ICurriculum | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.department) update.department = new Types.ObjectId(data.department);
    if (data.subjects) {
      update.subjects = data.subjects.map((s: any) => ({ ...s, subject: new Types.ObjectId(s.subject) }));
    }
    return CurriculumModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteCurriculum(id: string): Promise<boolean> {
    const result = await CurriculumModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Graduation Sessions ──────────────────────────────────────────────────

  async createGraduationSession(data: any, userId: string): Promise<IGraduationSession> {
    const session = new GraduationSessionModel({
      ...data,
      openDate: new Date(data.openDate),
      closeDate: new Date(data.closeDate),
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await session.save();
    return session;
  }

  async listGraduationSessions(filters: { page?: number; pageSize?: number; status?: string; semester?: string; academicYear?: string }) {
    const { page = 1, pageSize = 10, status, semester, academicYear } = filters;
    const filter: FilterQuery<IGraduationSession> = {};
    if (status) filter.status = status;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const [data, total] = await Promise.all([
      GraduationSessionModel.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ openDate: -1 }).lean(),
      GraduationSessionModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IGraduationSession[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getGraduationSessionById(id: string): Promise<IGraduationSession | null> {
    return GraduationSessionModel.findById(id);
  }

  async updateGraduationSession(id: string, data: any, userId: string): Promise<IGraduationSession | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.openDate) update.openDate = new Date(data.openDate);
    if (data.closeDate) update.closeDate = new Date(data.closeDate);
    if (data.reviewDate) update.reviewDate = new Date(data.reviewDate);
    return GraduationSessionModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteGraduationSession(id: string): Promise<boolean> {
    const result = await GraduationSessionModel.findByIdAndDelete(id);
    return !!result;
  }

  async getGraduationSessionStudents(sessionId: string) {
    const filter: FilterQuery<IGraduation> = { session: new Types.ObjectId(sessionId) };
    
    const [data, total] = await Promise.all([
      GraduationModel.find(filter)
        .populate('student', 'name code className major department gpa totalCredits')
        .sort({ createdAt: -1 })
        .lean(),
      GraduationModel.countDocuments(filter),
    ]);
    
    return { 
      data: data as unknown as IGraduation[], 
      pagination: { total, page: 1, pageSize: total, totalPages: 1 } 
    };
  }

  // ─── Graduations ──────────────────────────────────────────────────────────

  async createGraduation(data: any, userId: string): Promise<IGraduation> {
    const grad = new GraduationModel({
      ...data,
      student: new Types.ObjectId(data.student),
      session: new Types.ObjectId(data.session),
      enrollmentDate: new Date(data.enrollmentDate),
      thesisDefendedAt: data.thesisDefendedAt ? new Date(data.thesisDefendedAt) : undefined,
      diplomaDate: data.diplomaDate ? new Date(data.diplomaDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await grad.save();
    return grad;
  }

  async listGraduations(filters: { page?: number; pageSize?: number; student?: string; session?: string; status?: string; graduationYear?: number }) {
    const { page = 1, pageSize = 10, student, session, status, graduationYear } = filters;
    const filter: FilterQuery<IGraduation> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (session) filter.session = new Types.ObjectId(session);
    if (status) filter.status = status;
    if (graduationYear) filter.graduationYear = graduationYear;

    const [data, total] = await Promise.all([
      GraduationModel.find(filter)
        .populate('student', 'name code className major department gpa totalCredits')
        .populate('session', 'name semester academicYear')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ graduationYear: -1, createdAt: -1 })
        .lean(),
      GraduationModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IGraduation[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getGraduationById(id: string): Promise<IGraduation | null> {
    return GraduationModel.findById(id)
      .populate('student', 'name code className major department gpa totalCredits enrollmentDate')
      .populate('session', 'name semester academicYear openDate closeDate');
  }

  async updateGraduation(id: string, data: any, userId: string): Promise<IGraduation | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.student) update.student = new Types.ObjectId(data.student);
    if (data.session) update.session = new Types.ObjectId(data.session);
    if (data.enrollmentDate) update.enrollmentDate = new Date(data.enrollmentDate);
    if (data.thesisDefendedAt) update.thesisDefendedAt = new Date(data.thesisDefendedAt);
    if (data.diplomaDate) update.diplomaDate = new Date(data.diplomaDate);
    return GraduationModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async issueDiploma(id: string, diplomaNo: string, diplomaDate: string, userId: string): Promise<IGraduation | null> {
    return GraduationModel.findByIdAndUpdate(id, {
      $set: {
        diplomaNo,
        diplomaDate: new Date(diplomaDate),
        status: 'diploma_issued',
        updatedBy: new Types.ObjectId(userId),
      },
    }, { new: true, runValidators: true });
  }

  async deleteGraduation(id: string): Promise<boolean> {
    const result = await GraduationModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Internships ──────────────────────────────────────────────────────────

  async createInternship(data: any, userId: string): Promise<IInternship> {
    const intern = new InternshipModel({
      ...data,
      student: new Types.ObjectId(data.student),
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await intern.save();
    return intern;
  }

  async listInternships(filters: { page?: number; pageSize?: number; status?: string; major?: string; search?: string }) {
    const { page = 1, pageSize = 10, status, major, search } = filters;
    const filter: FilterQuery<IInternship> = {};
    if (status) filter.status = status;
    if (major) filter.major = major;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentCode: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      InternshipModel.find(filter)
        .populate('department', 'name code')
        .populate('student', 'name code className major')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ startDate: -1 })
        .lean(),
      InternshipModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IInternship[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getInternshipById(id: string): Promise<IInternship | null> {
    return InternshipModel.findById(id)
      .populate('department', 'name code')
      .populate('student', 'name code className major');
  }

  async updateInternship(id: string, data: any, userId: string): Promise<IInternship | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.student) update.student = new Types.ObjectId(data.student);
    if (data.department) update.department = new Types.ObjectId(data.department);
    if (data.startDate) update.startDate = new Date(data.startDate);
    if (data.endDate) update.endDate = new Date(data.endDate);
    return InternshipModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteInternship(id: string): Promise<boolean> {
    const result = await InternshipModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Training Systems ─────────────────────────────────────────────────────

  async createTrainingSystem(data: any, userId: string): Promise<ITrainingSystem> {
    const existing = await TrainingSystemModel.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error(`Mã hệ ${data.code} đã tồn tại`);

    const trainingSystem = new TrainingSystemModel({
      ...data,
      code: data.code.toUpperCase(),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await trainingSystem.save();
    return trainingSystem;
  }

  async listTrainingSystems(filters: { page?: number; pageSize?: number; search?: string; status?: string; isActive?: boolean }) {
    const { page = 1, pageSize = 10, search, status, isActive } = filters;
    const filter: FilterQuery<ITrainingSystem> = {};
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      TrainingSystemModel.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      TrainingSystemModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ITrainingSystem[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getTrainingSystemById(id: string): Promise<ITrainingSystem | null> {
    return TrainingSystemModel.findById(id);
  }

  async updateTrainingSystem(id: string, data: any, userId: string): Promise<ITrainingSystem | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.code) update.code = data.code.toUpperCase();
    return TrainingSystemModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteTrainingSystem(id: string): Promise<boolean> {
    const result = await TrainingSystemModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Specializations ─────────────────────────────────────────────────────

  async createSpecialization(data: any, userId: string): Promise<ISpecialization> {
    const existing = await SpecializationModel.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error(`Mã chuyên ngành ${data.code} đã tồn tại`);

    const specialization = new SpecializationModel({
      ...data,
      code: data.code.toUpperCase(),
      major: new Types.ObjectId(data.major),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await specialization.save();
    return specialization;
  }

  async listSpecializations(filters: { page?: number; pageSize?: number; search?: string; major?: string; status?: string; isActive?: boolean }) {
    const { page = 1, pageSize = 10, search, major, status, isActive } = filters;
    const filter: FilterQuery<ISpecialization> = {};
    if (major) filter.major = new Types.ObjectId(major);
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      SpecializationModel.find(filter)
        .populate('major', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      SpecializationModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ISpecialization[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getSpecializationById(id: string): Promise<ISpecialization | null> {
    return SpecializationModel.findById(id)
      .populate('major', 'name code');
  }

  async updateSpecialization(id: string, data: any, userId: string): Promise<ISpecialization | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.code) update.code = data.code.toUpperCase();
    if (data.major) update.major = new Types.ObjectId(data.major);
    return SpecializationModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteSpecialization(id: string): Promise<boolean> {
    const result = await SpecializationModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Academic Terms ───────────────────────────────────────────────────────

  async createAcademicTerm(data: any, userId: string): Promise<IAcademicTerm> {
    const existing = await AcademicTermModel.findOne({ academicYear: data.academicYear, semester: data.semester });
    if (existing) throw new Error(`Học kỳ ${data.academicYear} HK${data.semester} đã tồn tại`);

    const academicTerm = new AcademicTermModel({
      ...data,
      code: `${data.academicYear}-HK${data.semester}`,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationStart: data.registrationStart ? new Date(data.registrationStart) : undefined,
      registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await academicTerm.save();
    return academicTerm;
  }

  async listAcademicTerms(filters: { page?: number; pageSize?: number; academicYear?: string; semester?: number; status?: string; isActive?: boolean }) {
    const { page = 1, pageSize = 10, academicYear, semester, status, isActive } = filters;
    const filter: FilterQuery<IAcademicTerm> = {};
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      AcademicTermModel.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ academicYear: -1, semester: -1 })
        .lean(),
      AcademicTermModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IAcademicTerm[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getAcademicTermById(id: string): Promise<IAcademicTerm | null> {
    return AcademicTermModel.findById(id);
  }

  async getCurrentAcademicTerm(): Promise<IAcademicTerm | null> {
    return AcademicTermModel.findOne({ isCurrent: true });
  }

  async updateAcademicTerm(id: string, data: any, userId: string): Promise<IAcademicTerm | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.startDate) update.startDate = new Date(data.startDate);
    if (data.endDate) update.endDate = new Date(data.endDate);
    if (data.registrationStart) update.registrationStart = new Date(data.registrationStart);
    if (data.registrationEnd) update.registrationEnd = new Date(data.registrationEnd);
    if (data.code) update.code = `${data.academicYear || update.academicYear}-HK${data.semester || update.semester}`;

    // Handle isCurrent: only one term can be current
    if (data.isCurrent === true) {
      await AcademicTermModel.updateMany(
        { _id: { $ne: new Types.ObjectId(id) }, isCurrent: true },
        { isCurrent: false }
      );
    }

    return AcademicTermModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteAcademicTerm(id: string): Promise<boolean> {
    const result = await AcademicTermModel.findByIdAndDelete(id);
    return !!result;
  }
}

export const sisService = new SisService();
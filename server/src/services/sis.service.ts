import { Student as StudentModel, IStudent } from '../models/Student.js';
import { Subject as SubjectModel, ISubject } from '../models/Subject.js';
import { Course as CourseModel, ICourse } from '../models/Course.js';
import { Enrollment as EnrollmentModel, IEnrollment } from '../models/Enrollment.js';
import { Curriculum as CurriculumModel, ICurriculum } from '../models/Curriculum.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

export class SisService {
  // ─── Students ─────────────────────────────────────────────────────────────

  async createStudent(data: any, userId: string): Promise<IStudent> {
    const existing = await StudentModel.findOne({ code: data.code });
    if (existing) throw new Error(`Mã sinh viên ${data.code} đã tồn tại`);

    const student = new StudentModel({
      ...data,
      department: new Types.ObjectId(data.department),
      enrollmentDate: new Date(data.enrollmentDate),
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
      .populate('user', 'email displayName');
  }

  async listStudents(filters: { page?: number; pageSize?: number; search?: string; department?: string; courseYear?: number; status?: string }) {
    const { page = 1, pageSize = 10, search, department, courseYear, status } = filters;
    const filter: FilterQuery<IStudent> = {};
    if (department) filter.department = new Types.ObjectId(department);
    if (courseYear) filter.courseYear = courseYear;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      StudentModel.find(filter)
        .populate('department', 'name code')
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
    if (data.dob) update.dob = new Date(data.dob);
    if (data.enrollmentDate) update.enrollmentDate = new Date(data.enrollmentDate);
    return StudentModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await StudentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStudentStats() {
    const [total, byStatus, byYear, byGender] = await Promise.all([
      StudentModel.countDocuments(),
      StudentModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      StudentModel.aggregate([{ $group: { _id: '$courseYear', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      StudentModel.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),
    ]);
    return { total, byStatus, byYear, byGender };
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
      SubjectModel.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ code: 1 }).lean(),
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

  async listCourses(filters: { page?: number; pageSize?: number; subject?: string; semester?: number; academicYear?: string; status?: string; lecturer?: string }) {
    const { page = 1, pageSize = 10, subject, semester, academicYear, status, lecturer } = filters;
    const filter: FilterQuery<ICourse> = {};
    if (subject) filter.subject = new Types.ObjectId(subject);
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    if (lecturer) filter.lecturer = new Types.ObjectId(lecturer);

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

  async createEnrollment(data: { student: string; course: string }, _userId: string): Promise<IEnrollment> {
    const course = await CourseModel.findById(data.course);
    if (!course) throw new Error('Lớp học phần không tồn tại');
    if (course.enrolledCount >= course.maxStudents) throw new Error('Lớp đã đầy');
    if (course.status !== 'open') throw new Error('Lớp chưa mở đăng ký');

    const existing = await EnrollmentModel.findOne({ student: data.student, course: data.course });
    if (existing) throw new Error('Sinh viên đã đăng ký lớp này');

    const enrollment = new EnrollmentModel({
      student: new Types.ObjectId(data.student),
      course: new Types.ObjectId(data.course),
      status: 'enrolled',
      enrollmentDate: new Date(),
    });
    await enrollment.save();
    await CourseModel.findByIdAndUpdate(data.course, { $inc: { enrolledCount: 1 } });
    return enrollment;
  }

  async listEnrollments(filters: { page?: number; pageSize?: number; student?: string; course?: string; status?: string }) {
    const { page = 1, pageSize = 10, student, course, status } = filters;
    const filter: FilterQuery<IEnrollment> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (course) filter.course = new Types.ObjectId(course);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      EnrollmentModel.find(filter)
        .populate('student', 'name code')
        .populate('course', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ enrollmentDate: -1 })
        .lean(),
      EnrollmentModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IEnrollment[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async gradeEnrollment(id: string, data: { midtermScore?: number; finalScore?: number; attendanceCount?: number; totalSessions?: number; notes?: string }, userId: string): Promise<IEnrollment | null> {
    const totalScore = (data.midtermScore !== undefined && data.finalScore !== undefined)
      ? Math.round((data.midtermScore * 0.4 + data.finalScore * 0.6) * 10) / 10
      : undefined;

    let letterGrade: any = undefined;
    if (totalScore !== undefined) {
      if (totalScore >= 9.0) letterGrade = 'A+';
      else if (totalScore >= 8.5) letterGrade = 'A';
      else if (totalScore >= 8.0) letterGrade = 'B+';
      else if (totalScore >= 7.0) letterGrade = 'B';
      else if (totalScore >= 6.5) letterGrade = 'C+';
      else if (totalScore >= 5.5) letterGrade = 'C';
      else if (totalScore >= 5.0) letterGrade = 'D+';
      else if (totalScore >= 4.0) letterGrade = 'D';
      else letterGrade = 'F';
    }

    return EnrollmentModel.findByIdAndUpdate(id, {
      $set: {
        ...data,
        totalScore,
        letterGrade,
        gradedBy: new Types.ObjectId(userId),
        gradedAt: new Date(),
        status: totalScore !== undefined ? (totalScore >= 4.0 ? 'completed' : 'failed') : 'in_progress',
      },
    }, { new: true });
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    const enrollment = await EnrollmentModel.findByIdAndDelete(id);
    if (enrollment) {
      await CourseModel.findByIdAndUpdate(enrollment.course, { $inc: { enrolledCount: -1 } });
      return true;
    }
    return false;
  }

  // ─── Curricula ────────────────────────────────────────────────────────────

  async createCurriculum(data: any, userId: string): Promise<ICurriculum> {
    const subjects = data.subjects.map((s: any) => ({ ...s, subject: new Types.ObjectId(s.subject) }));
    const curriculum = new CurriculumModel({
      ...data,
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
        .sort({ effectiveYear: -1 })
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
}

export const sisService = new SisService();
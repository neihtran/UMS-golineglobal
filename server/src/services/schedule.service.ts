import { ClassSchedule as ClassScheduleModel, IClassSchedule } from '../models/ClassSchedule.js';
import { ScheduleChange as ScheduleChangeModel, IScheduleChange } from '../models/ScheduleChange.js';
import { GPAHistory as GPAHistoryModel, IGPAHistory } from '../models/GPAHistory.js';
import { AcademicWarning as AcademicWarningModel, IAcademicWarning } from '../models/AcademicWarning.js';
import { StudentLog as StudentLogModel, IStudentLog, createStudentLog } from '../models/StudentLog.js';
import { Enrollment as EnrollmentModel } from '../models/Enrollment.js';
import { Student as StudentModel } from '../models/Student.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

// ─── ClassSchedule Service ──────────────────────────────────────────────────

export class ScheduleService {
  async createSchedule(data: any, userId: string): Promise<IClassSchedule> {
    const schedule = new ClassScheduleModel({
      ...data,
      course: new Types.ObjectId(data.course),
      lecturer: new Types.ObjectId(data.lecturer),
      room: data.room ? new Types.ObjectId(data.room) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await schedule.save();
    return schedule;
  }

  async listSchedules(filters: {
    page?: number;
    pageSize?: number;
    course?: string;
    lecturer?: string;
    room?: string;
    dayOfWeek?: number;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 50, course, lecturer, room, dayOfWeek, isActive } = filters;
    const filter: FilterQuery<IClassSchedule> = {};
    if (course) filter.course = new Types.ObjectId(course);
    if (lecturer) filter.lecturer = new Types.ObjectId(lecturer);
    if (room) filter.room = new Types.ObjectId(room);
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      ClassScheduleModel.find(filter)
        .populate('course', 'name code')
        .populate('lecturer', 'name code')
        .populate('room', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ dayOfWeek: 1, lessonFrom: 1 })
        .lean(),
      ClassScheduleModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IClassSchedule[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getScheduleById(id: string): Promise<IClassSchedule | null> {
    return ClassScheduleModel.findById(id)
      .populate('course', 'name code')
      .populate('lecturer', 'name code')
      .populate('room', 'name code');
  }

  async getSchedulesByCourse(courseId: string): Promise<IClassSchedule[]> {
    return ClassScheduleModel.find({ course: new Types.ObjectId(courseId), isActive: true })
      .populate('course', 'name code')
      .populate('lecturer', 'name code')
      .populate('room', 'name code')
      .sort({ dayOfWeek: 1, lessonFrom: 1 })
      .lean();
  }

  async updateSchedule(id: string, data: any, userId: string): Promise<IClassSchedule | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.course) update.course = new Types.ObjectId(data.course);
    if (data.lecturer) update.lecturer = new Types.ObjectId(data.lecturer);
    if (data.room) update.room = new Types.ObjectId(data.room);
    return ClassScheduleModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  }

  async deleteSchedule(id: string): Promise<boolean> {
    // Soft delete - just set isActive to false
    const result = await ClassScheduleModel.findByIdAndUpdate(id, { $set: { isActive: false } });
    return !!result;
  }

  // ─── ScheduleChange Service ─────────────────────────────────────────────────

  async createScheduleChange(data: any, userId: string): Promise<IScheduleChange> {
    const change = new ScheduleChangeModel({
      ...data,
      schedule: new Types.ObjectId(data.schedule),
      oldRoom: data.oldRoom ? new Types.ObjectId(data.oldRoom) : undefined,
      newRoom: data.newRoom ? new Types.ObjectId(data.newRoom) : undefined,
      oldLecturer: data.oldLecturer ? new Types.ObjectId(data.oldLecturer) : undefined,
      newLecturer: data.newLecturer ? new Types.ObjectId(data.newLecturer) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await change.save();
    return change;
  }

  async listScheduleChanges(filters: {
    page?: number;
    pageSize?: number;
    schedule?: string;
    status?: string;
    changeType?: string;
  }) {
    const { page = 1, pageSize = 20, schedule, status, changeType } = filters;
    const filter: FilterQuery<IScheduleChange> = {};
    if (schedule) filter.schedule = new Types.ObjectId(schedule);
    if (status) filter.status = status;
    if (changeType) filter.changeType = changeType;

    const [data, total] = await Promise.all([
      ScheduleChangeModel.find(filter)
        .populate('schedule', 'name code')
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      ScheduleChangeModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IScheduleChange[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async approveScheduleChange(id: string, userId: string): Promise<IScheduleChange | null> {
    const change = await ScheduleChangeModel.findById(id);
    if (!change) return null;

    // Update the original schedule based on change type
    const schedule = await ClassScheduleModel.findById(change.schedule);
    if (!schedule) return null;

    const updateData: Record<string, any> = {};
    
    if (change.changeType === 'room' && change.newRoom) {
      updateData.room = change.newRoom;
    }
    if (change.changeType === 'lecturer' && change.newLecturer) {
      updateData.lecturer = change.newLecturer;
    }
    if (change.changeType === 'time') {
      if (change.newDayOfWeek) updateData.dayOfWeek = change.newDayOfWeek;
      if (change.newLessonFrom) updateData.lessonFrom = change.newLessonFrom;
      if (change.newLessonTo) updateData.lessonTo = change.newLessonTo;
      if (change.newDate) updateData.startDate = change.newDate;
    }
    if (change.changeType === 'cancel') {
      updateData.isActive = false;
    }

    await ClassScheduleModel.findByIdAndUpdate(change.schedule, { $set: updateData });

    // Approve the change request
    return ScheduleChangeModel.findByIdAndUpdate(
      id,
      { $set: { status: 'approved', approvedBy: new Types.ObjectId(userId), approvedAt: new Date() } },
      { new: true }
    );
  }

  async rejectScheduleChange(id: string): Promise<IScheduleChange | null> {
    return ScheduleChangeModel.findByIdAndUpdate(
      id,
      { $set: { status: 'rejected' } },
      { new: true }
    );
  }

  // ─── GPAHistory Service ────────────────────────────────────────────────────

  async calculateGPA(studentId: string, academicTermId: string): Promise<IGPAHistory | null> {
    // Get all enrollments for this student in this term
    const enrollments = await EnrollmentModel.find({
      student: new Types.ObjectId(studentId),
      academicTerm: new Types.ObjectId(academicTermId),
      status: 'completed',
    }).populate('course', 'credits');

    if (enrollments.length === 0) return null;

    // Calculate semester GPA
    let totalPoints = 0;
    let totalCredits = 0;
    let earnedCredits = 0;
    let passedSubjects = 0;
    let failedSubjects = 0;

    for (const enrollment of enrollments) {
      if (enrollment.gradePoint !== undefined && enrollment.course) {
        const course = enrollment.course as any;
        const credits = course.credits || 3;
        totalPoints += enrollment.gradePoint * credits;
        totalCredits += credits;
        if (enrollment.isPass) {
          earnedCredits += credits;
          passedSubjects++;
        } else {
          failedSubjects++;
        }
      }
    }

    const semesterGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Calculate cumulative GPA
    const previousGpas = await GPAHistoryModel.find({
      student: new Types.ObjectId(studentId),
    }).sort({ calculatedAt: -1 });

    let accumulatedCredits = 0;
    let cumulativePoints = 0;
    for (const gpa of previousGpas) {
      accumulatedCredits += gpa.earnedCredit;
      cumulativePoints += gpa.cumulativeGpa * gpa.earnedCredit;
    }
    accumulatedCredits += earnedCredits;
    cumulativePoints += semesterGpa * earnedCredits;
    const cumulativeGpa = accumulatedCredits > 0 ? cumulativePoints / accumulatedCredits : 0;

    // Create or update GPAHistory
    const gpaHistory = await GPAHistoryModel.findOneAndUpdate(
      {
        student: new Types.ObjectId(studentId),
        academicTerm: new Types.ObjectId(academicTermId),
      },
      {
        $set: {
          registeredCredit: totalCredits,
          earnedCredit: earnedCredits,
          accumulatedCredit: accumulatedCredits,
          semesterGpa: Math.round(semesterGpa * 100) / 100,
          cumulativeGpa: Math.round(cumulativeGpa * 100) / 100,
          academicRank: GPAHistoryModel.calculateRank(cumulativeGpa),
          totalSubjects: enrollments.length,
          passedSubjects,
          failedSubjects,
          calculatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Update student's cumulative GPA
    await StudentModel.findByIdAndUpdate(studentId, {
      $set: {
        gpa: cumulativeGpa,
        totalCredits: accumulatedCredits,
      },
    });

    return gpaHistory;
  }

  async getGPAHistory(studentId: string): Promise<IGPAHistory[]> {
    return GPAHistoryModel.find({ student: new Types.ObjectId(studentId) })
      .populate('academicTerm', 'code academicYear semester')
      .sort({ calculatedAt: -1 })
      .lean();
  }

  // ─── AcademicWarning Service ────────────────────────────────────────────────

  async createWarning(data: {
    student: string;
    academicTerm: string;
    warningType: string;
    description: string;
    warningLevel?: number;
    gpa?: number;
    failedSubjects?: string[];
    creditDeficit?: number;
  }, userId: string): Promise<IAcademicWarning> {
    const warning = new AcademicWarningModel({
      ...data,
      student: new Types.ObjectId(data.student),
      academicTerm: new Types.ObjectId(data.academicTerm),
      createdBy: new Types.ObjectId(userId),
    });
    await warning.save();

    // Log the warning
    await createStudentLog(data.student, 'WARNING_ISSUED', data.description, {
      referenceType: 'AcademicWarning',
      referenceId: warning._id.toString(),
      metadata: { warningType: data.warningType, warningLevel: data.warningLevel },
      createdBy: userId,
    });

    return warning;
  }

  async listWarnings(filters: {
    page?: number;
    pageSize?: number;
    student?: string;
    academicTerm?: string;
    warningType?: string;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 20, student, academicTerm, warningType, isActive } = filters;
    const filter: FilterQuery<IAcademicWarning> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (academicTerm) filter.academicTerm = new Types.ObjectId(academicTerm);
    if (warningType) filter.warningType = warningType;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      AcademicWarningModel.find(filter)
        .populate('student', 'name code')
        .populate('academicTerm', 'code academicYear semester')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      AcademicWarningModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IAcademicWarning[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async resolveWarning(id: string, resolutionNote: string, userId: string): Promise<IAcademicWarning | null> {
    const warning = await AcademicWarningModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
          resolvedAt: new Date(),
          resolvedBy: new Types.ObjectId(userId),
          resolutionNote,
        },
      },
      { new: true }
    );

    if (warning) {
      await createStudentLog(warning.student.toString(), 'WARNING_RESOLVED', resolutionNote, {
        referenceType: 'AcademicWarning',
        referenceId: id,
        createdBy: userId,
      });
    }

    return warning;
  }

  // ─── StudentLog Service ─────────────────────────────────────────────────────

  async getStudentLogs(studentId: string, page = 1, pageSize = 50) {
    const filter = { student: new Types.ObjectId(studentId) };
    const [data, total] = await Promise.all([
      StudentLogModel.find(filter)
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      StudentLogModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudentLog[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}

export const scheduleService = new ScheduleService();

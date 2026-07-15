import {
  StudentStatusHistory as StudentStatusHistoryModel,
  IStudentStatusHistory,
  StudentStatus,
} from '../models/StudentStatusHistory.js';
import {
  StudentReservation as StudentReservationModel,
  IStudentReservation,
} from '../models/StudentReservation.js';
import {
  StudentDropout as StudentDropoutModel,
  IStudentDropout,
} from '../models/StudentDropout.js';
import {
  StudentMajorChange as StudentMajorChangeModel,
  IStudentMajorChange,
} from '../models/StudentMajorChange.js';
import {
  StudentClassChange as StudentClassChangeModel,
  IStudentClassChange,
} from '../models/StudentClassChange.js';
import { Student as StudentModel } from '../models/Student.js';
import { createStudentLog } from '../models/StudentLog.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

// ─── StudentStatusHistory Service ──────────────────────────────────────────────

export class StudentManagementService {
  async createStatusChange(data: {
    student: string;
    status: StudentStatus;
    effectiveDate: Date;
    decisionNo?: string;
    decisionDate?: Date;
    reason?: string;
    note?: string;
  }, userId: string): Promise<IStudentStatusHistory> {
    // Get current student status
    const student = await StudentModel.findById(data.student);
    const previousStatus = student?.status as StudentStatus;

    // Create status history record
    const statusChange = new StudentStatusHistoryModel({
      ...data,
      student: new Types.ObjectId(data.student),
      previousStatus,
      createdBy: new Types.ObjectId(userId),
    });
    await statusChange.save();

    // Update student status
    await StudentModel.findByIdAndUpdate(data.student, { $set: { status: data.status } });

    // Log the change
    await createStudentLog(data.student, 'UPDATED', `Đổi trạng thái: ${previousStatus} → ${data.status}`, {
      referenceType: 'StudentStatusHistory',
      referenceId: statusChange._id.toString(),
      metadata: { previousStatus, newStatus: data.status, reason: data.reason },
      createdBy: userId,
    });

    return statusChange;
  }

  async listStatusHistory(filters: {
    page?: number;
    pageSize?: number;
    student?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 20, student, status } = filters;
    const filter: FilterQuery<IStudentStatusHistory> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      StudentStatusHistoryModel.find(filter)
        .populate('student', 'name code')
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ effectiveDate: -1 })
        .lean(),
      StudentStatusHistoryModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudentStatusHistory[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── StudentReservation Service ───────────────────────────────────────────────

  async createReservation(data: {
    student: string;
    fromDate: Date;
    toDate: Date;
    semesterFrom?: string;
    semesterTo?: string;
    decisionNo?: string;
    decisionDate?: Date;
    reason?: string;
  }, userId: string): Promise<IStudentReservation> {
    const reservation = new StudentReservationModel({
      ...data,
      student: new Types.ObjectId(data.student),
      semesterFrom: data.semesterFrom ? new Types.ObjectId(data.semesterFrom) : undefined,
      semesterTo: data.semesterTo ? new Types.ObjectId(data.semesterTo) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await reservation.save();

    await createStudentLog(data.student, 'UPDATED', `Yêu cầu bảo lưu từ ${data.fromDate.toLocaleDateString('vi-VN')} đến ${data.toDate.toLocaleDateString('vi-VN')}`, {
      referenceType: 'StudentReservation',
      referenceId: reservation._id.toString(),
      createdBy: userId,
    });

    return reservation;
  }

  async approveReservation(id: string, userId: string): Promise<IStudentReservation | null> {
    const reservation = await StudentReservationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'approved',
          approvedBy: new Types.ObjectId(userId),
          approvedAt: new Date(),
        },
      },
      { new: true }
    );

    if (reservation) {
      // Update student status to reserved
      await StudentModel.findByIdAndUpdate(reservation.student, { $set: { status: 'reserved' } });
      await createStudentLog(reservation.student.toString(), 'RESERVATION_STARTED', 'Bảo lưu được duyệt', {
        referenceType: 'StudentReservation',
        referenceId: id,
        createdBy: userId,
      });
    }

    return reservation;
  }

  async cancelReservation(id: string): Promise<IStudentReservation | null> {
    return StudentReservationModel.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }

  async listReservations(filters: {
    page?: number;
    pageSize?: number;
    student?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 20, student, status } = filters;
    const filter: FilterQuery<IStudentReservation> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      StudentReservationModel.find(filter)
        .populate('student', 'name code')
        .populate('semesterFrom', 'code academicYear semester')
        .populate('semesterTo', 'code academicYear semester')
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      StudentReservationModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudentReservation[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── StudentDropout Service ──────────────────────────────────────────────────

  async createDropout(data: {
    student: string;
    dropoutDate: Date;
    dropoutType: string;
    decisionNo?: string;
    decisionDate?: Date;
    reason?: string;
    refundAmount?: number;
  }, userId: string): Promise<IStudentDropout> {
    const dropout = new StudentDropoutModel({
      ...data,
      student: new Types.ObjectId(data.student),
      createdBy: new Types.ObjectId(userId),
    });
    await dropout.save();

    await createStudentLog(data.student, 'DROPPED', `Yêu cầu thôi học (${data.dropoutType})`, {
      referenceType: 'StudentDropout',
      referenceId: dropout._id.toString(),
      metadata: { dropoutType: data.dropoutType, reason: data.reason },
      createdBy: userId,
    });

    return dropout;
  }

  async approveDropout(id: string, userId: string): Promise<IStudentDropout | null> {
    const dropout = await StudentDropoutModel.findById(id);
    if (!dropout) return null;

    // Update dropout status
    dropout.status = 'approved';
    dropout.approvedBy = new Types.ObjectId(userId);
    dropout.approvedAt = new Date();
    await dropout.save();

    // Update student status to dropped
    await StudentModel.findByIdAndUpdate(dropout.student, { $set: { status: 'dropped' } });

    await createStudentLog(dropout.student.toString(), 'DROPPED', 'Thôi học được duyệt', {
      referenceType: 'StudentDropout',
      referenceId: id,
      createdBy: userId,
    });

    return dropout;
  }

  async cancelDropout(id: string): Promise<IStudentDropout | null> {
    return StudentDropoutModel.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }

  async listDropouts(filters: {
    page?: number;
    pageSize?: number;
    student?: string;
    status?: string;
    dropoutType?: string;
  }) {
    const { page = 1, pageSize = 20, student, status, dropoutType } = filters;
    const filter: FilterQuery<IStudentDropout> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (status) filter.status = status;
    if (dropoutType) filter.dropoutType = dropoutType;

    const [data, total] = await Promise.all([
      StudentDropoutModel.find(filter)
        .populate('student', 'name code')
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      StudentDropoutModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudentDropout[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── StudentMajorChange Service ──────────────────────────────────────────────

  async createMajorChange(data: {
    student: string;
    fromMajor: string;
    toMajor: string;
    fromSpecialization?: string;
    toSpecialization?: string;
    fromTrainingSystem?: string;
    toTrainingSystem?: string;
    effectiveDate?: Date;
    decisionNo?: string;
    decisionDate?: Date;
    reason?: string;
    curriculumFrom?: string;
    curriculumTo?: string;
  }, userId: string): Promise<IStudentMajorChange> {
    const change = new StudentMajorChangeModel({
      ...data,
      student: new Types.ObjectId(data.student),
      fromMajor: new Types.ObjectId(data.fromMajor),
      toMajor: new Types.ObjectId(data.toMajor),
      fromSpecialization: data.fromSpecialization ? new Types.ObjectId(data.fromSpecialization) : undefined,
      toSpecialization: data.toSpecialization ? new Types.ObjectId(data.toSpecialization) : undefined,
      fromTrainingSystem: data.fromTrainingSystem ? new Types.ObjectId(data.fromTrainingSystem) : undefined,
      toTrainingSystem: data.toTrainingSystem ? new Types.ObjectId(data.toTrainingSystem) : undefined,
      curriculumFrom: data.curriculumFrom ? new Types.ObjectId(data.curriculumFrom) : undefined,
      curriculumTo: data.curriculumTo ? new Types.ObjectId(data.curriculumTo) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await change.save();

    await createStudentLog(data.student, 'MAJOR_CHANGED', 'Yêu cầu chuyển ngành', {
      referenceType: 'StudentMajorChange',
      referenceId: change._id.toString(),
      createdBy: userId,
    });

    return change;
  }

  async approveMajorChange(id: string, userId: string): Promise<IStudentMajorChange | null> {
    const change = await StudentMajorChangeModel.findById(id);
    if (!change) return null;

    change.status = 'approved';
    change.approvedBy = new Types.ObjectId(userId);
    change.approvedAt = new Date();
    await change.save();

    // Update student major
    const updateData: Record<string, any> = {
      major: change.toMajor,
    };
    if (change.toSpecialization) updateData.specialization = change.toSpecialization;
    if (change.toTrainingSystem) updateData.trainingSystem = change.toTrainingSystem;
    if (change.curriculumTo) updateData.curriculum = change.curriculumTo;

    await StudentModel.findByIdAndUpdate(change.student, {
      $set: updateData,
    });

    await createStudentLog(change.student.toString(), 'MAJOR_CHANGED', 'Chuyển ngành được duyệt', {
      referenceType: 'StudentMajorChange',
      referenceId: id,
      createdBy: userId,
    });

    return change;
  }

  async cancelMajorChange(id: string): Promise<IStudentMajorChange | null> {
    return StudentMajorChangeModel.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }

  async listMajorChanges(filters: {
    page?: number;
    pageSize?: number;
    student?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 20, student, status } = filters;
    const filter: FilterQuery<IStudentMajorChange> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      StudentMajorChangeModel.find(filter)
        .populate('student', 'name code')
        .populate('fromMajor', 'name code')
        .populate('toMajor', 'name code')
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      StudentMajorChangeModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudentMajorChange[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── StudentClassChange Service ─────────────────────────────────────────────

  async createClassChange(data: {
    student: string;
    fromClass: string;
    toClass: string;
    effectiveDate?: Date;
    decisionNo?: string;
    decisionDate?: Date;
    reason?: string;
  }, userId: string): Promise<IStudentClassChange> {
    const change = new StudentClassChangeModel({
      ...data,
      student: new Types.ObjectId(data.student),
      fromClass: new Types.ObjectId(data.fromClass),
      toClass: new Types.ObjectId(data.toClass),
      createdBy: new Types.ObjectId(userId),
    });
    await change.save();

    await createStudentLog(data.student, 'CLASS_CHANGED', 'Yêu cầu chuyển lớp', {
      referenceType: 'StudentClassChange',
      referenceId: change._id.toString(),
      createdBy: userId,
    });

    return change;
  }

  async approveClassChange(id: string, userId: string): Promise<IStudentClassChange | null> {
    const change = await StudentClassChangeModel.findById(id);
    if (!change) return null;

    await StudentClassChangeModel.findByIdAndUpdate(id, {
      $set: {
        status: 'approved',
        approvedBy: new Types.ObjectId(userId),
        approvedAt: new Date(),
      },
    });

    // Update student class
    await StudentModel.findByIdAndUpdate(change.student, {
      $set: { class: change.toClass },
    });

    await createStudentLog(change.student.toString(), 'CLASS_CHANGED', 'Chuyển lớp được duyệt', {
      referenceType: 'StudentClassChange',
      referenceId: id,
      createdBy: userId,
    });

    return change;
  }

  async cancelClassChange(id: string): Promise<IStudentClassChange | null> {
    return StudentClassChangeModel.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }

  async listClassChanges(filters: {
    page?: number;
    pageSize?: number;
    student?: string;
  }) {
    const { page = 1, pageSize = 20, student } = filters;
    const filter: FilterQuery<IStudentClassChange> = {};
    if (student) filter.student = new Types.ObjectId(student);

    const [data, total] = await Promise.all([
      StudentClassChangeModel.find(filter)
        .populate('student', 'name code')
        .populate('fromClass', 'name code')
        .populate('toClass', 'name code')
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      StudentClassChangeModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IStudentClassChange[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}

export const studentManagementService = new StudentManagementService();

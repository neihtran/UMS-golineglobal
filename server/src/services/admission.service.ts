import {
  AdmissionBatch as AdmissionBatchModel,
  IAdmissionBatch,
} from '../models/AdmissionBatch.js';
import {
  AdmissionStudent as AdmissionStudentModel,
  IAdmissionStudent,
} from '../models/AdmissionStudent.js';
import { Student as StudentModel } from '../models/Student.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

// ─── AdmissionBatch Service ─────────────────────────────────────────────────────

export class AdmissionService {
  async createBatch(data: {
    code: string;
    name: string;
    year: number;
    admissionType: string;
    startDate?: Date;
    endDate?: Date;
    resultDate?: Date;
    enrollmentStartDate?: Date;
    enrollmentEndDate?: Date;
    description?: string;
  }, userId: string): Promise<IAdmissionBatch> {
    const batch = new AdmissionBatchModel({
      ...data,
      createdBy: new Types.ObjectId(userId),
    });
    await batch.save();
    return batch;
  }

  async listBatches(filters: {
    page?: number;
    pageSize?: number;
    year?: number;
    admissionType?: string;
    status?: string;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 20, year, admissionType, status, isActive } = filters;
    const filter: FilterQuery<IAdmissionBatch> = {};
    if (year) filter.year = year;
    if (admissionType) filter.admissionType = admissionType;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      AdmissionBatchModel.find(filter)
        .populate('createdBy', 'name email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ year: -1, code: -1 })
        .lean(),
      AdmissionBatchModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IAdmissionBatch[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getBatchById(id: string): Promise<IAdmissionBatch | null> {
    return AdmissionBatchModel.findById(id).populate('createdBy', 'name email');
  }

  async updateBatch(id: string, data: any, userId: string): Promise<IAdmissionBatch | null> {
    return AdmissionBatchModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedBy: new Types.ObjectId(userId) } },
      { new: true, runValidators: true }
    );
  }

  async deleteBatch(id: string): Promise<boolean> {
    const result = await AdmissionBatchModel.findByIdAndUpdate(id, { $set: { isActive: false } });
    return !!result;
  }

  // ─── AdmissionStudent Service ─────────────────────────────────────────────────

  async createStudent(data: {
    batch: string;
    candidateCode: string;
    fullName: string;
    gender?: string;
    dateOfBirth?: Date;
    citizenId?: string;
    phone?: string;
    email?: string;
    address?: string;
    nationality?: string;
    major?: string;
    trainingSystem?: string;
    admissionScore?: number;
    priorityLevel?: number;
    notes?: string;
  }, userId: string): Promise<IAdmissionStudent> {
    const student = new AdmissionStudentModel({
      ...data,
      batch: new Types.ObjectId(data.batch),
      major: data.major ? new Types.ObjectId(data.major) : undefined,
      trainingSystem: data.trainingSystem ? new Types.ObjectId(data.trainingSystem) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await student.save();

    // Update batch totalCandidates
    await AdmissionBatchModel.findByIdAndUpdate(data.batch, { $inc: { totalCandidates: 1 } });

    return student;
  }

  async listStudents(filters: {
    page?: number;
    pageSize?: number;
    batch?: string;
    status?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, batch, status, search } = filters;
    const filter: FilterQuery<IAdmissionStudent> = {};
    if (batch) filter.batch = new Types.ObjectId(batch);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { candidateCode: { $regex: search, $options: 'i' } },
        { citizenId: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      AdmissionStudentModel.find(filter)
        .populate('batch', 'code name year')
        .populate('major', 'name code')
        .populate('student', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ admissionScore: -1 })
        .lean(),
      AdmissionStudentModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IAdmissionStudent[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getStudentById(id: string): Promise<IAdmissionStudent | null> {
    return AdmissionStudentModel.findById(id)
      .populate('batch', 'code name year')
      .populate('major', 'name code')
      .populate('student', 'name code');
  }

  async updateStudent(id: string, data: any, userId: string): Promise<IAdmissionStudent | null> {
    const updateData: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.major) updateData.major = new Types.ObjectId(data.major);
    if (data.trainingSystem) updateData.trainingSystem = new Types.ObjectId(data.trainingSystem);

    return AdmissionStudentModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async enrollStudent(id: string, studentData: {
    studentCode: string;
    class?: string;
    major?: string;
    trainingSystem?: string;
    enrollmentDate?: Date;
  }, userId: string): Promise<IAdmissionStudent | null> {
    const admissionStudent = await AdmissionStudentModel.findById(id);
    if (!admissionStudent) return null;

    // Create actual Student record
    const student = new StudentModel({
      code: studentData.studentCode,
      name: admissionStudent.fullName,
      gender: admissionStudent.gender,
      dateOfBirth: admissionStudent.dateOfBirth,
      citizenId: admissionStudent.citizenId,
      phone: admissionStudent.phone,
      email: admissionStudent.email,
      status: 'studying',
      enrollmentDate: studentData.enrollmentDate || new Date(),
      major: studentData.major ? new Types.ObjectId(studentData.major) : admissionStudent.major,
      trainingSystem: studentData.trainingSystem ? new Types.ObjectId(studentData.trainingSystem) : admissionStudent.trainingSystem,
      class: studentData.class ? new Types.ObjectId(studentData.class) : undefined,
      admissionStudent: admissionStudent._id,
    });
    await student.save();

    // Update admission student status
    admissionStudent.status = 'enrolled';
    admissionStudent.studentCode = studentData.studentCode;
    admissionStudent.student = student._id;
    admissionStudent.enrollmentDate = studentData.enrollmentDate || new Date();
    admissionStudent.updatedBy = new Types.ObjectId(userId);
    await admissionStudent.save();

    // Update batch totalEnrolled
    await AdmissionBatchModel.findByIdAndUpdate(admissionStudent.batch, { $inc: { totalEnrolled: 1 } });

    return admissionStudent;
  }

  async deleteStudent(id: string): Promise<boolean> {
    const student = await AdmissionStudentModel.findById(id);
    if (!student) return false;

    await AdmissionStudentModel.findByIdAndDelete(id);

    // Update batch totalCandidates
    await AdmissionBatchModel.findByIdAndUpdate(student.batch, { $inc: { totalCandidates: -1 } });

    return true;
  }
}

export const admissionService = new AdmissionService();

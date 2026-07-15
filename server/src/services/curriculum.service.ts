// @ts-nocheck
import {
  SubjectType as SubjectTypeModel,
  ISubjectType,
} from '../models/SubjectType.js';
import {
  SubjectPrerequisite as SubjectPrerequisiteModel,
  ISubjectPrerequisite,
} from '../models/SubjectPrerequisite.js';
import {
  SubjectCondition as SubjectConditionModel,
  ISubjectCondition,
} from '../models/SubjectCondition.js';
import { Subject as SubjectModel } from '../models/Subject.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

// ─── SubjectType Service ─────────────────────────────────────────────────────

export class CurriculumService {
  // ─── SubjectType ──────────────────────────────────────────────────────────
  async createSubjectType(data: {
    code: string;
    name: string;
    description?: string;
    category: string;
    displayOrder?: number;
  }, userId: string): Promise<ISubjectType> {
    const subjectType = new SubjectTypeModel({
      ...data,
      createdBy: new Types.ObjectId(userId),
    });
    await subjectType.save();
    return subjectType;
  }

  async listSubjectTypes(filters: {
    page?: number;
    pageSize?: number;
    category?: string;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 20, category, isActive } = filters;
    const filter: FilterQuery<ISubjectType> = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      SubjectTypeModel.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ displayOrder: 1 })
        .lean(),
      SubjectTypeModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ISubjectType[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getSubjectTypeById(id: string): Promise<ISubjectType | null> {
    return SubjectTypeModel.findById(id);
  }

  async updateSubjectType(id: string, data: any, userId: string): Promise<ISubjectType | null> {
    return SubjectTypeModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedBy: new Types.ObjectId(userId) } },
      { new: true, runValidators: true }
    );
  }

  async deleteSubjectType(id: string): Promise<boolean> {
    const result = await SubjectTypeModel.findByIdAndUpdate(id, { $set: { isActive: false } });
    return !!result;
  }

  // ─── SubjectPrerequisite ────────────────────────────────────────────────
  async addPrerequisite(data: {
    subject: string;
    prerequisite: string;
    type: string;
    note?: string;
  }, userId: string): Promise<ISubjectPrerequisite> {
    const prerequisite = new SubjectPrerequisiteModel({
      subject: new Types.ObjectId(data.subject),
      prerequisite: new Types.ObjectId(data.prerequisite),
      type: data.type,
      note: data.note,
      createdBy: new Types.ObjectId(userId),
    });
    await prerequisite.save();
    return prerequisite;
  }

  async listPrerequisites(filters: {
    page?: number;
    pageSize?: number;
    subject?: string;
  }) {
    const { page = 1, pageSize = 20, subject } = filters;
    const filter: FilterQuery<ISubjectPrerequisite> = {};
    if (subject) filter.subject = new Types.ObjectId(subject);

    const [data, total] = await Promise.all([
      SubjectPrerequisiteModel.find(filter)
        .populate('subject', 'name code')
        .populate('prerequisite', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      SubjectPrerequisiteModel.countDocuments(filter),
    ]);
    return { data: data as unknown as ISubjectPrerequisite[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async deletePrerequisite(id: string): Promise<boolean> {
    const result = await SubjectPrerequisiteModel.findByIdAndUpdate(id, { $set: { isActive: false } });
    return !!result;
  }

  async getPrerequisitesForSubject(subjectId: string): Promise<ISubjectPrerequisite[]> {
    return SubjectPrerequisiteModel.find({
      subject: new Types.ObjectId(subjectId),
      isActive: true,
    })
      .populate('prerequisite', 'name code')
      .lean();
  }

  // ─── SubjectCondition ────────────────────────────────────────────────
  async createOrUpdateCondition(data: {
    subject: string;
    minGpa?: number;
    minCompletedCredit?: number;
    maxFailedSubject?: number;
    requiredSubjects?: string[];
    maxConcurrentSubject?: number;
    note?: string;
  }, userId: string): Promise<ISubjectCondition> {
    const updateData: Record<string, any> = {
      minGpa: data.minGpa,
      minCompletedCredit: data.minCompletedCredit,
      maxFailedSubject: data.maxFailedSubject,
      requiredSubjects: data.requiredSubjects?.map((id) => new Types.ObjectId(id)),
      maxConcurrentSubject: data.maxConcurrentSubject,
      note: data.note,
      isActive: true,
    };

    const condition = await SubjectConditionModel.findOneAndUpdate(
      { subject: new Types.ObjectId(data.subject) },
      { $set: updateData },
      { upsert: true, new: true }
    );
    return condition;
  }

  async getConditionForSubject(subjectId: string): Promise<ISubjectCondition | null> {
    return SubjectConditionModel.findOne({
      subject: new Types.ObjectId(subjectId),
      isActive: true,
    })
      .populate('requiredSubjects', 'name code')
      .lean();
  }

  async listConditions(filters: {
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 20 } = filters;

    const [data, total] = await Promise.all([
      SubjectConditionModel.find({ isActive: true })
        .populate('subject', 'name code')
        .populate('requiredSubjects', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      SubjectConditionModel.countDocuments({ isActive: true }),
    ]);
    return { data: data as unknown as ISubjectCondition[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}

export const curriculumService = new CurriculumService();

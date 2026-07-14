import { Exam, IExam, ExamSubmission, IExamSubmission, ResearchProject, IResearchProject, KPI, IKPI, KtxRoom, IKtxRoom, QaEvidence, IQaEvidence, WmsTask, IWmsTask } from '../models/Modules.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

export class ExamRitBiKtxQaWmsService {
  async listExams(filters: any) {
    const { page = 1, pageSize = 10, course, status, type, academicYear } = filters;
    const filter: FilterQuery<IExam> = {};
    if (course) filter.course = new Types.ObjectId(course);
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (academicYear) filter.academicYear = academicYear;
    const [data, total] = await Promise.all([
      Exam.find(filter).populate('course', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
      Exam.countDocuments(filter),
    ]);
    return { data: data as unknown as IExam[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createExam(data: any, userId: string): Promise<IExam> {
    const exam = new Exam({
      ...data,
      course: data.course ? new Types.ObjectId(data.course) : undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await exam.save();
    return exam;
  }

  async updateExam(id: string, data: any): Promise<IExam | null> {
    return Exam.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteExam(id: string): Promise<boolean> {
    await ExamSubmission.deleteMany({ exam: id });
    const result = await Exam.findByIdAndDelete(id);
    return !!result;
  }

  async listExamSubmissions(filters: any) {
    const { page = 1, pageSize = 20, exam, student, status } = filters;
    const filter: FilterQuery<IExamSubmission> = {};
    if (exam) filter.exam = new Types.ObjectId(exam);
    if (student) filter.student = new Types.ObjectId(student);
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      ExamSubmission.find(filter).populate('student', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort({ submittedAt: -1 }).lean(),
      ExamSubmission.countDocuments(filter),
    ]);
    return { data: data as unknown as IExamSubmission[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async gradeExamSubmission(id: string, score: number, userId: string): Promise<IExamSubmission | null> {
    return ExamSubmission.findByIdAndUpdate(id, { $set: { score, status: 'graded', gradedAt: new Date(), gradedBy: new Types.ObjectId(userId) } }, { new: true });
  }

  async listResearch(filters: any) {
    const { page = 1, pageSize = 10, status, leader } = filters;
    const filter: FilterQuery<IResearchProject> = {};
    if (status) filter.status = status;
    if (leader) filter.leader = new Types.ObjectId(leader);
    const [data, total] = await Promise.all([
      ResearchProject.find(filter).populate('leader', 'displayName').skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
      ResearchProject.countDocuments(filter),
    ]);
    return { data: data as unknown as IResearchProject[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createResearch(data: any, userId: string): Promise<IResearchProject> {
    const rp = new ResearchProject({
      ...data,
      leader: new Types.ObjectId(data.leader),
      members: (data.members || []).map((m: string) => new Types.ObjectId(m)),
      createdBy: new Types.ObjectId(userId),
    });
    await rp.save();
    return rp;
  }

  async updateResearch(id: string, data: any): Promise<IResearchProject | null> {
    return ResearchProject.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async listKpis(filters: any) {
    const { page = 1, pageSize = 20, module, status, year } = filters;
    const filter: FilterQuery<IKPI> = {};
    if (module) filter.module = module;
    if (status) filter.status = status;
    if (year) filter.year = Number(year);
    const [data, total] = await Promise.all([
      KPI.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ year: -1 }).lean(),
      KPI.countDocuments(filter),
    ]);
    return { data: data as unknown as IKPI[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createKpi(data: any): Promise<IKPI> {
    const kpi = new KPI(data);
    await kpi.save();
    return kpi;
  }

  async updateKpi(id: string, data: any): Promise<IKPI | null> {
    return KPI.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async listKtxRooms(filters: any) {
    const { page = 1, pageSize = 20, building, status, type } = filters;
    const filter: FilterQuery<IKtxRoom> = {};
    if (building) filter.building = building;
    if (status) filter.status = status;
    if (type) filter.type = type;
    const [data, total] = await Promise.all([
      KtxRoom.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ building: 1, floor: 1 }).lean(),
      KtxRoom.countDocuments(filter),
    ]);
    return { data: data as unknown as IKtxRoom[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createKtxRoom(data: any): Promise<IKtxRoom> {
    const room = new KtxRoom(data);
    await room.save();
    return room;
  }

  async updateKtxRoom(id: string, data: any): Promise<IKtxRoom | null> {
    return KtxRoom.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async listQaEvidence(filters: any) {
    const { page = 1, pageSize = 20, standard, status } = filters;
    const filter: FilterQuery<IQaEvidence> = {};
    if (standard) filter.standard = standard;
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      QaEvidence.find(filter).populate('uploadedBy', 'displayName').skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
      QaEvidence.countDocuments(filter),
    ]);
    return { data: data as unknown as IQaEvidence[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createQaEvidence(data: any, userId: string): Promise<IQaEvidence> {
    const ev = new QaEvidence({ ...data, uploadedBy: new Types.ObjectId(userId) });
    await ev.save();
    return ev;
  }

  async updateQaEvidence(id: string, data: any): Promise<IQaEvidence | null> {
    return QaEvidence.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async listWmsTasks(filters: any) {
    const { page = 1, pageSize = 20, assignee, status, priority } = filters;
    const filter: FilterQuery<IWmsTask> = {};
    if (assignee) filter.assignee = new Types.ObjectId(assignee);
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const [data, total] = await Promise.all([
      WmsTask.find(filter).populate('assignee', 'displayName').skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
      WmsTask.countDocuments(filter),
    ]);
    return { data: data as unknown as IWmsTask[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createWmsTask(data: any, userId: string): Promise<IWmsTask> {
    const task = new WmsTask({
      ...data,
      assignee: data.assignee ? new Types.ObjectId(data.assignee) : undefined,
      project: data.project ? new Types.ObjectId(data.project) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await task.save();
    return task;
  }

  async updateWmsTask(id: string, data: any): Promise<IWmsTask | null> {
    const update: Record<string, any> = { ...data };
    if (data.assignee) update.assignee = new Types.ObjectId(data.assignee);
    if (data.dueDate) update.dueDate = new Date(data.dueDate);
    if (data.status === 'done') update.completedAt = new Date();
    return WmsTask.findByIdAndUpdate(id, { $set: update }, { new: true });
  }
}

export const examRitBiKtxQaWmsService = new ExamRitBiKtxQaWmsService();
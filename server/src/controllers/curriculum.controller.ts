import { Request, Response } from 'express';
import { curriculumService } from '../services/curriculum.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// ─── SubjectType ─────────────────────────────────────────────────────────────

const createSubjectType = asyncHandler(async (req: Request, res: Response) => {
  try {
    const subjectType = await curriculumService.createSubjectType(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: subjectType });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listSubjectTypes = asyncHandler(async (req: Request, res: Response) => {
  const result = await curriculumService.listSubjectTypes({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    category: req.query.category as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getSubjectTypeById = asyncHandler(async (req: Request, res: Response) => {
  const subjectType = await curriculumService.getSubjectTypeById(req.params.id);
  if (!subjectType) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy loại môn học' } });
    return;
  }
  res.json({ success: true, data: subjectType });
});

const updateSubjectType = asyncHandler(async (req: Request, res: Response) => {
  const subjectType = await curriculumService.updateSubjectType(req.params.id, req.body, req.user!._id.toString());
  if (!subjectType) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy loại môn học' } });
    return;
  }
  res.json({ success: true, data: subjectType });
});

const deleteSubjectType = asyncHandler(async (req: Request, res: Response) => {
  const ok = await curriculumService.deleteSubjectType(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy loại môn học' } });
    return;
  }
  res.json({ success: true, message: 'Đã xóa loại môn học' });
});

// ─── SubjectPrerequisite ───────────────────────────────────────────────────

const addPrerequisite = asyncHandler(async (req: Request, res: Response) => {
  try {
    const prerequisite = await curriculumService.addPrerequisite(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: prerequisite });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listPrerequisites = asyncHandler(async (req: Request, res: Response) => {
  const result = await curriculumService.listPrerequisites({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    subject: req.query.subject as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getPrerequisitesForSubject = asyncHandler(async (req: Request, res: Response) => {
  const prerequisites = await curriculumService.getPrerequisitesForSubject(req.params.subjectId);
  res.json({ success: true, data: prerequisites });
});

const deletePrerequisite = asyncHandler(async (req: Request, res: Response) => {
  const ok = await curriculumService.deletePrerequisite(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tiên quyết' } });
    return;
  }
  res.json({ success: true, message: 'Đã xóa tiên quyết' });
});

// ─── SubjectCondition ───────────────────────────────────────────────────────

const createOrUpdateCondition = asyncHandler(async (req: Request, res: Response) => {
  try {
    const condition = await curriculumService.createOrUpdateCondition(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: condition });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const getConditionForSubject = asyncHandler(async (req: Request, res: Response) => {
  const condition = await curriculumService.getConditionForSubject(req.params.subjectId);
  res.json({ success: true, data: condition });
});

const listConditions = asyncHandler(async (req: Request, res: Response) => {
  const result = await curriculumService.listConditions({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

export const curriculumController = {
  // SubjectType
  createSubjectType, listSubjectTypes, getSubjectTypeById, updateSubjectType, deleteSubjectType,
  // Prerequisite
  addPrerequisite, listPrerequisites, getPrerequisitesForSubject, deletePrerequisite,
  // Condition
  createOrUpdateCondition, getConditionForSubject, listConditions,
};

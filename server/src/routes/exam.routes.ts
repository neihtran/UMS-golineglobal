import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  examQuerySchema,
  createExamSchema,
  updateExamSchema,
  questionQuerySchema,
  createQuestionSchema,
  updateQuestionSchema,
  examSessionQuerySchema,
  examResultQuerySchema,
  idParamSchema,
} from '@/validators/exam.validator.js';
import {
  getExamStats,
  getExamList,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getQuestionList,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getExamSessionList,
  startExamSession,
  submitExamSession,
  getExamResultList,
  gradeExamSession,
} from '@/controllers/exam.controller.js';

const router = Router();
router.use(authMiddleware);

// EXAM Dashboard
router.get('/stats', getExamStats);

// Exams
router.get('/exams', validate(examQuerySchema, 'query'), getExamList);
router.get('/exams/:id', validate(idParamSchema, 'params'), getExamById);
router.post('/exams', validate(createExamSchema), createExam);
router.patch('/exams/:id', validate(idParamSchema, 'params'), validate(updateExamSchema), updateExam);
router.delete('/exams/:id', validate(idParamSchema, 'params'), deleteExam);

// Questions
router.get('/questions', validate(questionQuerySchema, 'query'), getQuestionList);
router.post('/questions', validate(createQuestionSchema), createQuestion);
router.patch('/questions/:id', validate(idParamSchema, 'params'), validate(updateQuestionSchema), updateQuestion);
router.delete('/questions/:id', validate(idParamSchema, 'params'), deleteQuestion);

// Exam Sessions
router.get('/sessions', validate(examSessionQuerySchema, 'query'), getExamSessionList);
router.post('/sessions/start', startExamSession);
router.post('/sessions/:id/submit', validate(idParamSchema, 'params'), submitExamSession);

// Exam Results
router.get('/results', validate(examResultQuerySchema, 'query'), getExamResultList);
router.get('/results/statistics', getExamResultStatistics);
router.post('/sessions/:id/grade', validate(idParamSchema, 'params'), gradeExamSession);

export default router;

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  evidenceQuerySchema,
  createEvidenceSchema,
  updateEvidenceSchema,
  assessmentQuerySchema,
  createAssessmentSchema,
  idParamSchema,
} from '@/validators/shared.validator.js';
import {
  getQaStats,
  getEvidenceList,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  getAssessmentList,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} from '@/controllers/qa.controller.js';
import {
  getQaAssetList,
  getQaAssetById,
  createQaAsset,
  updateQaAsset,
  deleteQaAsset,
  getQaAssetDepreciation,
  getQaAssetMaintenance,
  createQaAssetMaintenance,
  getQaFacilityList,
  getQaFacilityById,
  createQaFacility,
  updateQaFacility,
  deleteQaFacility,
} from '@/controllers/qa-asset.controller.js';

const router = Router();
router.use(authMiddleware);

// QA Dashboard
router.get('/stats', getQaStats);

// Evidence
router.get('/evidences', validate(evidenceQuerySchema, 'query'), getEvidenceList);
router.get('/evidences/:id', validate(idParamSchema, 'params'), getEvidenceById);
router.post('/evidences', validate(createEvidenceSchema), createEvidence);
router.patch('/evidences/:id', validate(idParamSchema, 'params'), validate(updateEvidenceSchema), updateEvidence);
router.delete('/evidences/:id', validate(idParamSchema, 'params'), deleteEvidence);

// Assessments
router.get('/assessments', validate(assessmentQuerySchema, 'query'), getAssessmentList);
router.get('/assessments/:id', validate(idParamSchema, 'params'), getAssessmentById);
router.post('/assessments', validate(createAssessmentSchema), createAssessment);
router.patch('/assessments/:id', validate(idParamSchema, 'params'), validate(createAssessmentSchema), updateAssessment);
router.delete('/assessments/:id', validate(idParamSchema, 'params'), deleteAssessment);

// ─── Assets / Tài sản ──────────────────────────────────────────────────────────
router.get('/assets', getQaAssetList);
router.get('/assets/:id', validate(idParamSchema, 'params'), getQaAssetById);
router.post('/assets', validate(createEvidenceSchema), createQaAsset);
router.patch('/assets/:id', validate(idParamSchema, 'params'), validate(updateEvidenceSchema), updateQaAsset);
router.delete('/assets/:id', validate(idParamSchema, 'params'), deleteQaAsset);
router.get('/assets/:id/depreciation', validate(idParamSchema, 'params'), getQaAssetDepreciation);
router.get('/assets/:id/maintenance', validate(idParamSchema, 'params'), getQaAssetMaintenance);
router.post('/assets/:id/maintenance', validate(idParamSchema, 'params'), createQaAssetMaintenance);

// ─── Facilities / CSVC ─────────────────────────────────────────────────────────
router.get('/facilities', getQaFacilityList);
router.get('/facilities/:id', validate(idParamSchema, 'params'), getQaFacilityById);
router.post('/facilities', validate(createEvidenceSchema), createQaFacility);
router.patch('/facilities/:id', validate(idParamSchema, 'params'), validate(updateEvidenceSchema), updateQaFacility);
router.delete('/facilities/:id', validate(idParamSchema, 'params'), deleteQaFacility);

export default router;

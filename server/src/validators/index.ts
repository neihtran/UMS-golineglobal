// ─── Barrel export for validators ────────────────────────────────────────────────
export * from './auth.validator.js';
export * from './hrm.validator.js';
export * from './sis.validator.js';
export * from './dms.validator.js';
export * from './lms.validator.js';
export * from './exam.validator.js';
export * from './portal.validator.js';
// idParamSchema only from shared.validator to avoid duplicate exports
export { idParamSchema } from './shared.validator.js';
export * from './int.validator.js';

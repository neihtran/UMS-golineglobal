import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ─── Vietnamese ───────────────────────────────────────────────────────────────
import common_vi from './vi/common.json';
import nav_vi from './vi/nav.json';
import hrm_vi from './vi/hrm.json';
import vienChuc_vi from './vi/vienChuc.json';
import sis_vi from './vi/sis.json';
import dms_vi from './vi/dms.json';
import fin_vi from './vi/fin.json';
import lms_vi from './vi/lms.json';
import exam_vi from './vi/exam.json';
import wms_vi from './vi/wms.json';
import ktx_vi from './vi/ktx.json';
import rit_vi from './vi/rit.json';
import bi_vi from './vi/bi.json';
import qa_vi from './vi/qa.json';
import dce_vi from './vi/dce.json';
import ocr_vi from './vi/ocr.json';
import int_vi from './vi/int.json';
import portal_vi from './vi/portal.json';
import pms_vi from './vi/pms.json';
import lib_vi from './vi/lib.json';
import iam_vi from './vi/iam.json';

// ─── English ─────────────────────────────────────────────────────────────────
import common_en from './en/common.json';
import nav_en from './en/nav.json';
import hrm_en from './en/hrm.json';
import vienChuc_en from './en/vienChuc.json';
import sis_en from './en/sis.json';
import dms_en from './en/dms.json';
import fin_en from './en/fin.json';
import lms_en from './en/lms.json';
import exam_en from './en/exam.json';
import wms_en from './en/wms.json';
import ktx_en from './en/ktx.json';
import rit_en from './en/rit.json';
import bi_en from './en/bi.json';
import qa_en from './en/qa.json';
import dce_en from './en/dce.json';
import ocr_en from './en/ocr.json';
import int_en from './en/int.json';
import portal_en from './en/portal.json';
import pms_en from './en/pms.json';
import lib_en from './en/lib.json';
import iam_en from './en/iam.json';

// ─── Resources ────────────────────────────────────────────────────────────────
export const resources = {
  vi: {
    common: common_vi,
    nav: nav_vi,
    hrm: hrm_vi,
    vienChuc: vienChuc_vi,
    sis: sis_vi,
    dms: dms_vi,
    fin: fin_vi,
    lms: lms_vi,
    exam: exam_vi,
    wms: wms_vi,
    ktx: ktx_vi,
    rit: rit_vi,
    bi: bi_vi,
    qa: qa_vi,
    dce: dce_vi,
    ocr: ocr_vi,
    int: int_vi,
    portal: portal_vi,
    pms: pms_vi,
    lib: lib_vi,
    iam: iam_vi,
  },
  en: {
    common: common_en,
    nav: nav_en,
    hrm: hrm_en,
    vienChuc: vienChuc_en,
    sis: sis_en,
    dms: dms_en,
    fin: fin_en,
    lms: lms_en,
    exam: exam_en,
    wms: wms_en,
    ktx: ktx_en,
    rit: rit_en,
    bi: bi_en,
    qa: qa_en,
    dce: dce_en,
    ocr: ocr_en,
    int: int_en,
    portal: portal_en,
    pms: pms_en,
    lib: lib_en,
    iam: iam_en,
  },
};

// ─── All namespaces ───────────────────────────────────────────────────────────
export const namespaces = [
  'common', 'nav',
  'hrm', 'vienChuc',
  'sis', 'dms', 'fin', 'lms', 'exam', 'wms', 'ktx', 'rit', 'bi', 'qa', 'dce', 'ocr', 'int', 'portal', 'pms', 'lib', 'iam',
] as const;

export type Namespace = (typeof namespaces)[number];

// ─── Init ─────────────────────────────────────────────────────────────────────
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: [...namespaces],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ums_language',
    },
  });

export default i18n;

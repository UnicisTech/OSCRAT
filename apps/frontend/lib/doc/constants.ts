import { AssessmentType, DeclarationType } from './types';

export const DOC_GUIDE_URL = 'https://cloud.unicis.tech/f/262437';

export const ASSESSMENT_OPTIONS = [
  { value: AssessmentType.SELF, labelKey: 'oscrat.ui.doc.self-assessment' },
  { value: AssessmentType.EXTERNAL_BC, labelKey: 'oscrat.ui.doc.external-bc' },
  { value: AssessmentType.EXTERNAL_H, labelKey: 'oscrat.ui.doc.external-h' },
] as const;

export const DECLARATION_OPTIONS = [
  {
    value: DeclarationType.SIMPLE,
    labelKey: 'oscrat.ui.doc.simple-declaration',
    descKey: 'oscrat.ui.doc.simple-declaration-desc',
  },
  {
    value: DeclarationType.FULL,
    labelKey: 'oscrat.ui.doc.full-declaration',
    descKey: 'oscrat.ui.doc.full-declaration-desc',
  },
] as const;

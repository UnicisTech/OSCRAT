import type { TFunction } from 'next-i18next';

export interface PDFTranslations {
  reportTitle: string;
  product: string;
  organization: string;
  generated: string;
  overallProgress: string;
  complete: string;
  of: string;
  requirementsEvaluated: string;
  summaryStatistics: string;
  evaluated: string;
  notEvaluated: string;
  compliant: string;
  partiallyCompliant: string;
  notCompliant: string;
  notApplicable: string;
  requirementsStatusSummary: string;
  id: string;
  requirement: string;
  status: string;
  conformity: string;
  page: string;
  craReference: string;
  hint: string;
  questionsAndAnswers: string;
  answer: string;
  yes: string;
  no: string;
  additionalInfo: string;
  evidence: string;
  evidenceAttached: string;
  noAnswerProvided: string;
  detailedAssessment: string;
  area: string;
}

/**
 * Builds the translations object for compliance PDF export.
 * Centralizes the translation keys to avoid duplication across components.
 */
export function buildPDFTranslations(t: TFunction): PDFTranslations {
  return {
    reportTitle: t('oscrat.ui.dashboard.pdf.report-title'),
    product: t('oscrat.ui.dashboard.pdf.product'),
    organization: t('oscrat.ui.dashboard.pdf.organization'),
    generated: t('oscrat.ui.dashboard.pdf.generated'),
    overallProgress: t('oscrat.ui.dashboard.overall-progress'),
    complete: t('oscrat.ui.dashboard.pdf.complete'),
    of: t('oscrat.ui.dashboard.pdf.of'),
    requirementsEvaluated: t('oscrat.ui.dashboard.requirements-evaluated'),
    summaryStatistics: t('oscrat.ui.dashboard.pdf.summary-statistics'),
    evaluated: t('oscrat.ui.dashboard.evaluated'),
    notEvaluated: t('oscrat.ui.dashboard.not-evaluated'),
    compliant: t('oscrat.ui.dashboard.compliant'),
    partiallyCompliant: t('oscrat.ui.dashboard.partially-compliant'),
    notCompliant: t('oscrat.ui.dashboard.not-compliant'),
    notApplicable: t('oscrat.ui.dashboard.not-applicable'),
    requirementsStatusSummary: t('oscrat.ui.dashboard.pdf.requirements-status-summary'),
    id: t('oscrat.ui.dashboard.pdf.id'),
    requirement: t('oscrat.ui.dashboard.pdf.requirement'),
    status: t('oscrat.ui.dashboard.pdf.status'),
    conformity: t('oscrat.ui.dashboard.pdf.conformity'),
    page: t('oscrat.ui.dashboard.pdf.page'),
    craReference: t('oscrat.ui.dashboard.pdf.cra-reference'),
    hint: t('oscrat.ui.dashboard.pdf.hint'),
    questionsAndAnswers: t('oscrat.ui.dashboard.pdf.questions-and-answers'),
    answer: t('oscrat.ui.dashboard.pdf.answer'),
    yes: t('oscrat.ui.dashboard.pdf.yes'),
    no: t('oscrat.ui.dashboard.pdf.no'),
    additionalInfo: t('oscrat.ui.dashboard.pdf.additional-info'),
    evidence: t('oscrat.ui.dashboard.pdf.evidence'),
    evidenceAttached: t('oscrat.ui.dashboard.pdf.evidence-attached'),
    noAnswerProvided: t('oscrat.ui.dashboard.pdf.no-answer-provided'),
    detailedAssessment: t('oscrat.ui.dashboard.pdf.detailed-assessment'),
    area: t('oscrat.ui.dashboard.area'),
  };
}

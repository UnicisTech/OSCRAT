import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import type { Task, Team } from '@oscrat/model';
import Button from '@/components/button';
import { useTask } from '@/hooks/useTask';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { riskDetailsSchema, riskTreatmentSchema } from '@/lib/validation/risk';
import type {
  RiskDetailsFormValues,
  RiskTreatmentFormValues,
} from '@/lib/validation/risk';
import {
  RISK_LEVELS,
  RISK_CATEGORIES,
  RISK_TREATMENT_OPTIONS,
  type RiskLevel,
  type TaskRiskProperties,
} from '@/types/risk';
import {
  calculateExposure,
  RISK_LEVEL_BADGE_CLASSES,
} from '@/utils/riskCalculation';
import type { ApiError } from '@/types';

interface RiskAssessmentSectionProps {
  task: Task;
  team: Team;
}

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({
  task,
  team,
}) => {
  const { t } = useTranslation('common');
  const { updateTask } = useTask(team.slug, task.taskNumber.toString());
  const { members } = useTeamMembers(team.slug);

  const { project: product } = useOscratProject(
    team.slug,
    task.productId || '',
    { enabled: !!task.productId }
  );

  const existingProps = task.properties as TaskRiskProperties | null;
  const existingDetails = existingProps?.riskDetails;
  const existingTreatment = existingProps?.riskTreatment;

  const detailsInitial: RiskDetailsFormValues = useMemo(
    () => ({
      threat: existingDetails?.threat || '',
      category: existingDetails?.category || [],
      likelihood: existingDetails?.likelihood || ('' as RiskLevel),
      impact: existingDetails?.impact || ('' as RiskLevel),
      ownerId: existingDetails?.ownerId || '',
    }),
    [existingDetails]
  );

  const treatmentInitial: RiskTreatmentFormValues = useMemo(
    () => ({
      treatment: existingTreatment?.treatment || ('' as any),
      measures: existingTreatment?.measures || '',
      residualExposure:
        existingTreatment?.residualExposure || ('' as RiskLevel),
      responsibleId: existingTreatment?.responsibleId || '',
    }),
    [existingTreatment]
  );

  const detailsFormik = useFormik<RiskDetailsFormValues>({
    initialValues: detailsInitial,
    validationSchema: riskDetailsSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const exposure = calculateExposure(values.likelihood, values.impact);
        const mergedProps: TaskRiskProperties = {
          ...existingProps,
          riskDetails: { ...values, exposure },
        };
        await updateTask({ properties: mergedProps } as any);
        toast.success(t('oscrat.ui.risk.risk-details-saved'));
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const treatmentFormik = useFormik<RiskTreatmentFormValues>({
    initialValues: treatmentInitial,
    validationSchema: riskTreatmentSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const mergedProps: TaskRiskProperties = {
          ...existingProps,
          riskTreatment: values,
        };
        await updateTask({ properties: mergedProps } as any);
        toast.success(t('oscrat.ui.risk.risk-treatment-saved'));
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const computedExposure = useMemo(() => {
    if (detailsFormik.values.likelihood && detailsFormik.values.impact) {
      return calculateExposure(
        detailsFormik.values.likelihood,
        detailsFormik.values.impact
      );
    }
    return existingDetails?.exposure || null;
  }, [
    detailsFormik.values.likelihood,
    detailsFormik.values.impact,
    existingDetails?.exposure,
  ]);

  const isSection1Complete = useMemo(() => {
    const v = detailsFormik.values;
    return !!(
      v.threat?.trim() &&
      v.category?.length > 0 &&
      v.likelihood &&
      v.impact &&
      v.ownerId
    );
  }, [detailsFormik.values]);

  useEffect(() => {
    if (!isSection1Complete) {
      treatmentFormik.resetForm();
    }
  }, [isSection1Complete]);

  const riskLevelLabel = (level: RiskLevel) =>
    t(`oscrat.ui.risk.level-${level.toLowerCase()}`);

  const selectClass = (hasError: boolean) =>
    `w-full rounded-input border px-3 py-2 text-content-secondary shadow-2 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-muted ${
      hasError
        ? 'border-danger-border focus:border-danger focus:ring-danger'
        : 'border-line'
    }`;

  const textareaClass = (hasError: boolean) =>
    `w-full rounded-input border px-3 py-2 text-content-secondary shadow-2 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-muted resize-none ${
      hasError
        ? 'border-danger-border focus:border-danger focus:ring-danger'
        : 'border-line'
    }`;

  const requiredMark = <span className="text-danger ml-1">*</span>;

  return (
    <div className="space-y-6">
      {/* Section 1: Risk Details */}
      <form onSubmit={detailsFormik.handleSubmit}>
        <div className="border-line bg-surface rounded-card border p-6">
          <h2 className="text-content mb-6 text-lg font-semibold">
            {t('oscrat.ui.risk.section-details')}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Asset (read-only, from product) */}
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.asset')}
                {requiredMark}
              </label>
              <input
                type="text"
                value={product?.name || t('oscrat.ui.risk.no-product-linked')}
                readOnly
                disabled
                className="border-line-subtle bg-surface-muted text-content-secondary rounded-input w-full cursor-not-allowed border px-3 py-2"
              />
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.owner')}
                {requiredMark}
              </label>
              <select
                name="ownerId"
                value={detailsFormik.values.ownerId}
                onChange={detailsFormik.handleChange}
                onBlur={detailsFormik.handleBlur}
                disabled={detailsFormik.isSubmitting}
                className={selectClass(
                  !!detailsFormik.touched.ownerId &&
                    !!detailsFormik.errors.ownerId
                )}
              >
                <option value="">{t('oscrat.ui.risk.select-owner')}</option>
                {members?.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name}
                  </option>
                ))}
              </select>
              {detailsFormik.touched.ownerId &&
                detailsFormik.errors.ownerId && (
                  <p className="text-danger mt-1 text-sm">
                    {t(detailsFormik.errors.ownerId)}
                  </p>
                )}
            </div>

            {/* Likelihood */}
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.likelihood')}
                {requiredMark}
              </label>
              <select
                name="likelihood"
                value={detailsFormik.values.likelihood}
                onChange={detailsFormik.handleChange}
                onBlur={detailsFormik.handleBlur}
                disabled={detailsFormik.isSubmitting}
                className={selectClass(
                  !!detailsFormik.touched.likelihood &&
                    !!detailsFormik.errors.likelihood
                )}
              >
                <option value="">{t('oscrat.ui.risk.select-level')}</option>
                {RISK_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {riskLevelLabel(level)}
                  </option>
                ))}
              </select>
              {detailsFormik.touched.likelihood &&
                detailsFormik.errors.likelihood && (
                  <p className="text-danger mt-1 text-sm">
                    {t(detailsFormik.errors.likelihood)}
                  </p>
                )}
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.impact')}
                {requiredMark}
              </label>
              <select
                name="impact"
                value={detailsFormik.values.impact}
                onChange={detailsFormik.handleChange}
                onBlur={detailsFormik.handleBlur}
                disabled={detailsFormik.isSubmitting}
                className={selectClass(
                  !!detailsFormik.touched.impact &&
                    !!detailsFormik.errors.impact
                )}
              >
                <option value="">{t('oscrat.ui.risk.select-level')}</option>
                {RISK_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {riskLevelLabel(level)}
                  </option>
                ))}
              </select>
              {detailsFormik.touched.impact && detailsFormik.errors.impact && (
                <p className="text-danger mt-1 text-sm">
                  {t(detailsFormik.errors.impact)}
                </p>
              )}
            </div>

            {/* Exposure (auto-calculated) */}
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.exposure')}
              </label>
              {computedExposure ? (
                <div
                  className={`rounded-input w-full border px-3 py-2 font-medium ${RISK_LEVEL_BADGE_CLASSES[computedExposure]}`}
                >
                  {riskLevelLabel(computedExposure)}
                </div>
              ) : (
                <div className="border-line-subtle bg-surface-muted text-content-placeholder rounded-input w-full border px-3 py-2 italic">
                  —
                </div>
              )}
            </div>

            {/* Category (multi-select checkboxes) */}
            <div className="space-y-2 lg:col-span-3">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.category')}
                {requiredMark}
              </label>
              <div className="flex flex-wrap gap-4">
                {RISK_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="inline-flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={
                        detailsFormik.values.category?.includes(cat) || false
                      }
                      onChange={() => {
                        const current = detailsFormik.values.category || [];
                        const next = current.includes(cat)
                          ? current.filter((c) => c !== cat)
                          : [...current, cat];
                        detailsFormik.setFieldValue('category', next);
                        detailsFormik.setFieldTouched('category', true, false);
                      }}
                      disabled={detailsFormik.isSubmitting}
                      className="border-line text-primary focus:ring-primary h-4 w-4 rounded"
                    />
                    <span className="text-content-secondary text-sm">
                      {t(`oscrat.ui.risk.category-${cat.toLowerCase()}`)}
                    </span>
                  </label>
                ))}
              </div>
              {detailsFormik.touched.category &&
                detailsFormik.errors.category && (
                  <p className="text-danger mt-1 text-sm">
                    {t(String(detailsFormik.errors.category))}
                  </p>
                )}
            </div>

            {/* Threat */}
            <div className="space-y-2 lg:col-span-3">
              <label className="text-content-secondary block text-sm font-medium">
                {t('oscrat.ui.risk.threat')}
                {requiredMark}
              </label>
              <textarea
                name="threat"
                value={detailsFormik.values.threat}
                onChange={detailsFormik.handleChange}
                onBlur={detailsFormik.handleBlur}
                rows={4}
                disabled={detailsFormik.isSubmitting}
                className={textareaClass(
                  !!detailsFormik.touched.threat &&
                    !!detailsFormik.errors.threat
                )}
                placeholder={t('oscrat.ui.risk.threat-placeholder')}
              />
              {detailsFormik.touched.threat && detailsFormik.errors.threat && (
                <p className="text-danger mt-1 text-sm">
                  {t(detailsFormik.errors.threat)}
                </p>
              )}
            </div>
          </div>

          <div className="border-line-subtle mt-6 flex justify-end border-t pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={detailsFormik.isSubmitting}
              disabled={detailsFormik.isSubmitting || !detailsFormik.dirty}
            >
              {detailsFormik.isSubmitting
                ? t('oscrat.ui.saving')
                : t('oscrat.ui.risk.save-risk-details')}
            </Button>
          </div>
        </div>
      </form>

      {/* Section 2: Risk Treatment */}
      <form onSubmit={treatmentFormik.handleSubmit}>
        <div
          className={`bg-surface rounded-card border-line border p-6 ${
            isSection1Complete
              ? 'border-line-subtle'
              : 'border-line-subtle opacity-60'
          }`}
        >
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-content text-lg font-semibold">
              {t('oscrat.ui.risk.section-treatment')}
            </h2>
            {!isSection1Complete && (
              <div className="bg-warning-subtle border-warning-border rounded-input flex items-center gap-1.5 border px-3 py-1">
                <LockClosedIcon className="text-warning h-4 w-4" />
                <span className="text-warning text-xs font-medium">
                  {t('oscrat.ui.risk.section-treatment-locked')}
                </span>
              </div>
            )}
          </div>

          <fieldset
            disabled={!isSection1Complete || treatmentFormik.isSubmitting}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Treatment */}
              <div className="space-y-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.risk.treatment')}
                  {requiredMark}
                </label>
                <select
                  name="treatment"
                  value={treatmentFormik.values.treatment}
                  onChange={treatmentFormik.handleChange}
                  onBlur={treatmentFormik.handleBlur}
                  className={selectClass(
                    !!treatmentFormik.touched.treatment &&
                      !!treatmentFormik.errors.treatment
                  )}
                >
                  <option value="">
                    {t('oscrat.ui.risk.select-treatment')}
                  </option>
                  {RISK_TREATMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`oscrat.ui.risk.treatment-${opt.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
                {treatmentFormik.touched.treatment &&
                  treatmentFormik.errors.treatment && (
                    <p className="text-danger mt-1 text-sm">
                      {t(treatmentFormik.errors.treatment)}
                    </p>
                  )}
              </div>

              {/* Residual Exposure */}
              <div className="space-y-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.risk.residual-exposure')}
                  {requiredMark}
                </label>
                <select
                  name="residualExposure"
                  value={treatmentFormik.values.residualExposure}
                  onChange={treatmentFormik.handleChange}
                  onBlur={treatmentFormik.handleBlur}
                  className={selectClass(
                    !!treatmentFormik.touched.residualExposure &&
                      !!treatmentFormik.errors.residualExposure
                  )}
                >
                  <option value="">{t('oscrat.ui.risk.select-level')}</option>
                  {RISK_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {riskLevelLabel(level)}
                    </option>
                  ))}
                </select>
                {treatmentFormik.touched.residualExposure &&
                  treatmentFormik.errors.residualExposure && (
                    <p className="text-danger mt-1 text-sm">
                      {t(treatmentFormik.errors.residualExposure)}
                    </p>
                  )}
              </div>

              {/* Responsible */}
              <div className="space-y-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.risk.responsible')}
                  {requiredMark}
                </label>
                <select
                  name="responsibleId"
                  value={treatmentFormik.values.responsibleId}
                  onChange={treatmentFormik.handleChange}
                  onBlur={treatmentFormik.handleBlur}
                  className={selectClass(
                    !!treatmentFormik.touched.responsibleId &&
                      !!treatmentFormik.errors.responsibleId
                  )}
                >
                  <option value="">
                    {t('oscrat.ui.risk.select-responsible')}
                  </option>
                  {members?.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
                {treatmentFormik.touched.responsibleId &&
                  treatmentFormik.errors.responsibleId && (
                    <p className="text-danger mt-1 text-sm">
                      {t(treatmentFormik.errors.responsibleId)}
                    </p>
                  )}
              </div>

              {/* Measures */}
              <div className="space-y-2 lg:col-span-3">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.risk.measures')}
                </label>
                <textarea
                  name="measures"
                  value={treatmentFormik.values.measures || ''}
                  onChange={treatmentFormik.handleChange}
                  onBlur={treatmentFormik.handleBlur}
                  rows={4}
                  className={textareaClass(
                    !!treatmentFormik.touched.measures &&
                      !!treatmentFormik.errors.measures
                  )}
                  placeholder={t('oscrat.ui.risk.measures-placeholder')}
                />
                {treatmentFormik.touched.measures &&
                  treatmentFormik.errors.measures && (
                    <p className="text-danger mt-1 text-sm">
                      {t(treatmentFormik.errors.measures)}
                    </p>
                  )}
              </div>
            </div>

            <div className="border-line-subtle mt-6 flex justify-end border-t pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={treatmentFormik.isSubmitting}
                disabled={
                  !isSection1Complete ||
                  treatmentFormik.isSubmitting ||
                  !treatmentFormik.dirty
                }
              >
                {treatmentFormik.isSubmitting
                  ? t('oscrat.ui.saving')
                  : t('oscrat.ui.risk.save-risk-treatment')}
              </Button>
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
};

export default RiskAssessmentSection;

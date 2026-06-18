import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductType } from '@oscrat/model';
import { getProductTypeKey } from '@/utils/translation';
import { FullScreenModal } from '@/components/shared';
import type { OscratProductUpdate } from '@oscrat/model';
import { useTeamContext } from '@/context/TeamContext';
import { useFormik } from 'formik';
import { productUpdateSchema } from '@/lib/validation/product';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OscratProductUpdate) => void;
  initialData: OscratProductUpdate;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { t, ready } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const { team } = teamContext;

  const allTeamOrganizations = team?.reportingOrganizations || [];
  const productTypes = Object.values(OscratProductType);
  const externalReportingOptions = allTeamOrganizations.map(
    (org) => org.acronym
  );

  const formik = useFormik({
    initialValues: {
      name: (initialData.name as string) || '',
      acronym: initialData.acronym || '',
      description: initialData.description || '',
      type: initialData.type || OscratProductType.APPLICATION_SOFTWARE,
      externalReporting:
        initialData.reportingOrganizations?.map((org) => org.acronym) || [],
    },
    validationSchema: productUpdateSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: (values) => {
      const selectedReportingOrgs = allTeamOrganizations.filter((org) =>
        values.externalReporting.includes(org.acronym)
      );

      onSave({
        name: values.name.trim(),
        acronym: values.acronym.trim(),
        description: values.description.trim(),
        type: values.type,
        reportingOrganizations: selectedReportingOrgs,
        status: initialData.status,
        updatedBy: initialData.updatedBy,
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          name: (initialData.name as string) || '',
          acronym: initialData.acronym || '',
          description: initialData.description || '',
          type: initialData.type || OscratProductType.APPLICATION_SOFTWARE,
          externalReporting:
            initialData.reportingOrganizations?.map((org) => org.acronym) || [],
        },
      });
    }
  }, [isOpen, initialData]);

  const handleExternalReportingToggle = useCallback(
    (option: string) => {
      const current = formik.values.externalReporting;
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      formik.setFieldValue('externalReporting', updated);
    },
    [formik]
  );

  if (!ready) return null;

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('oscrat.ui.edit-product')}
      cancelButtonText={t('cancel')}
      continueButtonText={t('save')}
      onCancel={onClose}
      onContinue={formik.handleSubmit}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t('oscrat.ui.product-name')} *
          </label>
          <input
            type="text"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="bg-surface-muted w-full rounded border p-2"
            placeholder={t('oscrat.ui.product-name')}
            maxLength={60}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-danger mt-1 text-sm">{t(formik.errors.name)}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t('oscrat.ui.product-acronym')} *
          </label>
          <input
            type="text"
            name="acronym"
            value={formik.values.acronym}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength={10}
            className="bg-surface-muted w-full rounded border p-2"
            placeholder={t('oscrat.ui.validation.product-acronym-placeholder')}
          />
          {formik.touched.acronym && formik.errors.acronym && (
            <p className="text-danger mt-1 text-sm">
              {t(formik.errors.acronym)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t('oscrat.ui.product-description')}
          </label>
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={3}
            maxLength={500}
            className="bg-surface-muted w-full rounded border p-2"
            placeholder={t('description')}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-danger mt-1 text-sm">
              {t(formik.errors.description)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t('oscrat.ui.product-type')}
          </label>
          <select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="bg-surface-muted w-full rounded border p-2"
          >
            {productTypes.map((productType) => (
              <option key={productType} value={productType}>
                {t(getProductTypeKey(productType))}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t('oscrat.ui.external-reporting')}
          </label>
          <div className="flex flex-wrap gap-2">
            {externalReportingOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`reporting-${option}`}
                  checked={formik.values.externalReporting.includes(option)}
                  onChange={() => handleExternalReportingToggle(option)}
                  className="border-line text-primary focus:ring-primary h-4 w-4 rounded"
                />
                <label
                  htmlFor={`reporting-${option}`}
                  className="ml-2 cursor-pointer text-sm"
                >
                  {option}
                </label>
              </div>
            ))}
            {externalReportingOptions.length === 0 && (
              <p className="text-content-muted text-sm">
                {t('oscrat.ui.no-external-reporting-options')}
              </p>
            )}
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default ProductEditModal;

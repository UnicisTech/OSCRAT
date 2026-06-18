import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersions } from '@/hooks/oscrat/useOscratVersion';
import { withProductLayout } from '@/lib/layout-helpers';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import { Breadcrumb } from '@/components/shared';
import Button from '@/components/button';
import {
  OscratProductVersionStatus,
  type OscratProductVersionCreate,
} from '@oscrat/model';
import { useFormik } from 'formik';
import { versionCreateSchema } from '@/lib/validation/version';
import {
  getInputClassName,
  getTextareaClassName,
  getSelectClassName,
  formStyles,
} from '@/utils/formStyles';
import { getProductVersionStatusKey } from '@/utils/translation';

function NewProductVersionPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const { teamId, productId } = useProductContext();

  const { project } = useOscratProject(teamId, productId);
  const { createVersion } = useOscratVersions(teamId, productId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      version: '',
      description: '',
      status: OscratProductVersionStatus.ACTIVE,
    },
    validationSchema: versionCreateSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const createData = {
          version: values.version.trim(),
          status: values.status,
          productId,
        };

        await createVersion(createData as OscratProductVersionCreate);
        toast.success(t('oscrat.ui.version-created-successfully'));
        router.push(`/organization/${slug}/products/${productId}`);
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, t('oscrat.ui.failed-to-create-version'))
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleCancel = () => {
    router.back();
  };

  if (!ready || !teamId || !productId) return null;

  const STATUS_OPTIONS = Object.values(OscratProductVersionStatus);

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${slug}/products`,
    },
    {
      label: project?.name,
      href: `/organization/${slug}/products/${productId}`,
    },
    {
      label: t('oscrat.ui.add-new-product-version'),
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-content mb-6 text-2xl font-bold">
          {t('oscrat.ui.add-new-product-version')}
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Product Information (Read-Only) */}
          <div className="border-line bg-surface-muted rounded-lg border p-6">
            <h2 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.product-information')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.product-acronym')}
                </label>
                <input
                  type="text"
                  value={project?.acronym}
                  disabled
                  className={getInputClassName(false, true)}
                />
              </div>
              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.product-name')}
                </label>
                <input
                  type="text"
                  value={project?.name}
                  disabled
                  className={getInputClassName(false, true)}
                />
              </div>
            </div>
          </div>

          {/* New Version Information */}
          <div className="border-line bg-surface rounded-lg border p-6">
            <h2 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.new-version-information')}
            </h2>
            <div className="space-y-6">
              <div>
                <label className={formStyles.label.default}>
                  {t('oscrat.ui.new-product-version')} *
                </label>
                <input
                  type="text"
                  name="version"
                  value={formik.values.version}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., 1.2.4"
                  className={getInputClassName(
                    !!(formik.touched.version && formik.errors.version)
                  )}
                  disabled={isSubmitting}
                />
                {formik.touched.version && formik.errors.version && (
                  <p className={formStyles.error.text}>
                    {t(formik.errors.version)}
                  </p>
                )}
              </div>

              <div>
                <label className={formStyles.label.default}>
                  {t('oscrat.ui.version-short-description')}
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={4}
                  placeholder={t('oscrat.ui.type-here')}
                  className={getTextareaClassName(
                    !!(formik.touched.description && formik.errors.description)
                  )}
                  disabled={isSubmitting}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className={formStyles.error.text}>
                    {t(formik.errors.description)}
                  </p>
                )}
              </div>

              <div>
                <label className={formStyles.label.default}>
                  {t('status')} *
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getSelectClassName(
                    !!(formik.touched.status && formik.errors.status)
                  )}
                  disabled={isSubmitting}
                >
                  {STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {t(getProductVersionStatusKey(statusOption))}
                    </option>
                  ))}
                </select>
                {formik.touched.status && formik.errors.status && (
                  <p className={formStyles.error.text}>
                    {t(formik.errors.status)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="secondary"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('oscrat.ui.back')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || !formik.isValid}
            >
              {isSubmitting
                ? t('oscrat.ui.creating')
                : t('oscrat.ui.create-version')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

NewProductVersionPage.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default NewProductVersionPage;

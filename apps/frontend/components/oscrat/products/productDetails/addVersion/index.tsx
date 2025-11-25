import React from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductVersionStatus } from '@oscrat/model';
import { FullScreenModal } from '@/components/shared';
import toast from 'react-hot-toast';
import normalizeText from '@/utils/normalizeText';
import { useOscratVersions } from '@/hooks/oscrat/useOscratVersion';
import { useFormik } from 'formik';
import { versionCreateSchema } from '@/lib/validation/version';

interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  productId: string;
  createdBy: string;
}

const Index: React.FC<CreateVersionModalProps> = ({
  isOpen,
  onClose,
  teamId,
  productId,
  createdBy,
}) => {
  const { t, ready } = useTranslation('common');
  const { createVersion, isLoading } = useOscratVersions(teamId, productId);

  const statusOptions = Object.values(OscratProductVersionStatus);

  const formik = useFormik({
    initialValues: {
      version: '',
      status: OscratProductVersionStatus.DRAFT,
    },
    validationSchema: versionCreateSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await createVersion({
          version: values.version.trim(),
          status: values.status,
          productId,
          createdBy,
        });
        toast.success(t('oscrat.ui.version-created-successfully'));
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error('Failed to create version:', error);
        toast.error(t('oscrat.ui.failed-to-create-version'));
      }
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      onClose();
    }
  };

  if (!ready) return null;

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('oscrat.ui.create-version')}
      cancelButtonText={t('cancel')}
      continueButtonText={t('create')}
      onCancel={handleClose}
      onContinue={formik.handleSubmit}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('oscrat.ui.version-name')} *
          </label>
          <input
            type="text"
            name="version"
            value={formik.values.version}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            placeholder="e.g., 1.2.4"
            disabled={isLoading}
            maxLength={20}
          />
          {formik.touched.version && formik.errors.version && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {t(formik.errors.version)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('status')} *
          </label>
          <select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading}
          >
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {normalizeText(statusOption)}
              </option>
            ))}
          </select>
          {formik.touched.status && formik.errors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {t(formik.errors.status)}
            </p>
          )}
        </div>
      </div>
    </FullScreenModal>
  );
};

export default Index;

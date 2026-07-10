import React from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductVersionStatus } from '@oscrat/model';
import { FullScreenModal } from '@/components/shared';
import type { OscratProductVersionUpdate } from '@oscrat/model';
import { useFormik } from 'formik';
import { versionUpdateSchema } from '@/lib/validation/version';
import {
  formStyles,
  getInputClassName,
  getSelectClassName,
} from '@/utils/formStyles';
import { getProductVersionStatusKey } from '@/utils/translation';

interface VersionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OscratProductVersionUpdate) => void;
  initialData: {
    version: string;
    status: OscratProductVersionStatus;
    releaseDate?: string;
    supportEndDate?: string;
  };
}

const formatDateForInput = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const VersionEditModal: React.FC<VersionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { t, ready } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      version: initialData.version,
      status: initialData.status,
      releaseDate: formatDateForInput(initialData.releaseDate),
      supportEndDate: formatDateForInput(initialData.supportEndDate),
    },
    enableReinitialize: true,
    validationSchema: versionUpdateSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      onSave({
        version: values.version.trim(),
        status: values.status as OscratProductVersionStatus,
        releaseDate: values.releaseDate
          ? new Date(values.releaseDate)
          : undefined,
        supportEndDate: values.supportEndDate
          ? new Date(values.supportEndDate)
          : undefined,
      });
    },
  });

  const versionStatuses = Object.values(OscratProductVersionStatus).filter(
    (status) =>
      status !== OscratProductVersionStatus.SUPPORTED ||
      status === initialData.status
  );

  if (!ready) return null;

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('oscrat.ui.edit-version')}
      cancelButtonText={t('cancel')}
      continueButtonText={t('save')}
      onCancel={onClose}
      onContinue={formik.handleSubmit}
    >
      <div className="space-y-6">
        <div>
          <label className={formStyles.label.default}>
            {t('oscrat.ui.version-name')}
          </label>
          <input
            type="text"
            name="version"
            value={formik.values.version}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={getInputClassName(
              !!(formik.touched.version && formik.errors.version)
            )}
            placeholder={t('oscrat.ui.version-name')}
          />
          {formik.touched.version && formik.errors.version && (
            <p className={formStyles.error.text}>{t(formik.errors.version)}</p>
          )}
        </div>

        <div>
          <label className={formStyles.label.default}>{t('status')}</label>
          <select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={getSelectClassName(
              !!(formik.touched.status && formik.errors.status)
            )}
          >
            {versionStatuses.map((status) => (
              <option key={status} value={status}>
                {t(getProductVersionStatusKey(status))}
              </option>
            ))}
          </select>
          {formik.touched.status && formik.errors.status && (
            <p className={formStyles.error.text}>{t(formik.errors.status)}</p>
          )}
        </div>

        <div>
          <label className={formStyles.label.default}>
            {t('oscrat.ui.release-date')}
          </label>
          <input
            type="date"
            name="releaseDate"
            value={formik.values.releaseDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={getInputClassName(false)}
          />
        </div>

        <div>
          <label className={formStyles.label.default}>
            {t('oscrat.ui.support-period')}
          </label>
          <input
            type="date"
            name="supportEndDate"
            value={formik.values.supportEndDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={getInputClassName(false)}
          />
        </div>
      </div>
    </FullScreenModal>
  );
};

export default VersionEditModal;

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductVersionStatus } from '@oscrat/model';
import { FullScreenModal } from '@/components/shared';
import type { OscratProductVersionCreate } from '@oscrat/model';
import toast from 'react-hot-toast';
import normalizeText from '@/utils/normalizeText';
import { useOscratVersions } from '@/hooks/oscrat/useOscratVersion';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Use OSCRAT hook for version management
  const { createVersion, isLoading } = useOscratVersions(teamId, productId);

  // Form state
  const [versionName, setVersionName] = useState('');
  const [status, setStatus] = useState<OscratProductVersionStatus>(
    OscratProductVersionStatus.DRAFT
  );

  // Available status options
  const statusOptions = Object.values(OscratProductVersionStatus);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setVersionName('');
      setStatus(OscratProductVersionStatus.DRAFT);
      setFormErrors({});
    }
  }, [isOpen]);

  // Handle save
  const handleSave = async () => {
    // Validate form
    const errors: Record<string, string> = {};

    if (!versionName.trim()) {
      errors.version = 'Version name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await createVersion({
        version: versionName.trim(),
        status,
        productId,
        createdBy,
      });
      toast.success('Version created successfully');
      onClose();
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error('Failed to create version');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
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
      onContinue={handleSave}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('oscrat.ui.version-name')}
          </label>
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            placeholder="e.g., 1.2.4"
            disabled={isLoading}
          />
          {formErrors.version && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formErrors.version}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('status')}
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as OscratProductVersionStatus)
            }
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading}
          >
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {normalizeText(statusOption)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default Index;

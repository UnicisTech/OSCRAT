import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductType } from '@oscrat/model';
import { getProductTypeKey } from '@/utils/translation';
import { FullScreenModal } from '@/components/shared';
import type { OscratProductUpdate } from '@oscrat/model';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [editName, setEditName] = useState<string>(initialData.name as string);
  const [editDescription, setEditDescription] = useState(
    initialData.description || ''
  );
  const [editType, setEditType] = useState(initialData.type);
  const [editExternalReporting, setEditExternalReporting] = useState<string[]>(
    initialData.reportingOrganizations || []
  );

  // Reset form when modal opens or initial data changes
  useEffect(() => {
    if (isOpen) {
      setEditName(initialData.name as string);
      setEditDescription(initialData.description || '');
      setEditType(initialData.type);
      setEditExternalReporting(initialData.reportingOrganizations || []);
      setFormErrors({});
    }
  }, [isOpen, initialData]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave({
      name: editName.trim(),
      description: editDescription.trim(),
      type: editType,
      reportingOrganizations: editExternalReporting,
      status: initialData.status,
      updatedBy: initialData.updatedBy,
    });
  }, [editName, editDescription, editType, editExternalReporting, onSave]);

  // Handle external reporting toggle
  const handleExternalReportingToggle = useCallback((option: string) => {
    setEditExternalReporting((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  }, []);

  // Available options
  const productTypes = Object.values(OscratProductType);
  // TODO: Get external reporting options from DB
  const externalReportingOptions = [
    'CERT-EU',
    'NCSC-NL',
    'NCSC-UK',
    'NIST',
    'BSI',
    'ANSSI',
  ];

  if (!ready) return null;

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('oscrat.ui.edit-product')}
      cancelButtonText={t('cancel')}
      continueButtonText={t('save')}
      onCancel={onClose}
      onContinue={handleSave}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('oscrat.ui.product-name')}
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            placeholder={t('oscrat.ui.product-name')}
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formErrors.name}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('oscrat.ui.product-description')}
          </label>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            placeholder={t('description')}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('oscrat.ui.role')}
          </label>
          <select
            value={editType}
            onChange={(e) => setEditType(e.target.value as OscratProductType)}
            className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            {productTypes.map((productType) => (
              <option key={productType} value={productType}>
                {t(getProductTypeKey(productType))}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-gray-300">
            {t('oscrat.ui.external-reporting')}
          </label>
          <div className="flex flex-wrap gap-2">
            {externalReportingOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`reporting-${option}`}
                  checked={editExternalReporting.includes(option)}
                  onChange={() => handleExternalReportingToggle(option)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor={`reporting-${option}`}
                  className="ml-2 cursor-pointer text-sm dark:text-gray-300"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default ProductEditModal;

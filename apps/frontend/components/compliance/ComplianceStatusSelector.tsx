import React from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceStatus } from '@/types/compliance';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaBan,
} from 'react-icons/fa';

interface ComplianceStatusSelectorProps {
  onSelect: (status: ComplianceStatus) => void;
  selectedStatus?: ComplianceStatus;
}

const ComplianceStatusSelector: React.FC<ComplianceStatusSelectorProps> = ({
  onSelect,
  selectedStatus,
}) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  const statusOptions: {
    value: ComplianceStatus;
    label: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    borderClass: string;
    bgClass: string;
  }[] = [
    {
      value: 'Fully compliant' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.fully-compliant'),
      description: t('oscrat.ui.compliance-status.fully-compliant-desc'),
      icon: <FaCheckCircle className="text-3xl" />,
      colorClass: 'text-success',
      borderClass: 'border-success',
      bgClass: 'bg-success-subtle hover:bg-success-subtle',
    },
    {
      value: 'Partially compliant' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.partially-compliant'),
      description: t('oscrat.ui.compliance-status.partially-compliant-desc'),
      icon: <FaExclamationTriangle className="text-3xl" />,
      colorClass: 'text-warning',
      borderClass: 'border-warning',
      bgClass: 'bg-warning-subtle hover:bg-warning-subtle',
    },
    {
      value: 'Not Compliant' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.not-compliant'),
      description: t('oscrat.ui.compliance-status.not-compliant-desc'),
      icon: <FaTimesCircle className="text-3xl" />,
      colorClass: 'text-danger',
      borderClass: 'border-danger',
      bgClass: 'bg-danger-subtle hover:bg-danger-subtle',
    },
    {
      value: 'Not Applicable' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.not-applicable'),
      description: t('oscrat.ui.compliance-status.not-applicable-desc'),
      icon: <FaBan className="text-3xl" />,
      colorClass: 'text-content-secondary',
      borderClass: 'border-line',
      bgClass: 'bg-surface-muted hover:bg-surface-muted',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-h6 text-content mb-4 font-medium">
        {t('oscrat.ui.select-compliance-status')}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`rounded-lg border-2 p-4 text-left transition-all duration-200 ${
              selectedStatus === option.value
                ? `${option.borderClass} ${option.bgClass}`
                : 'border-line bg-surface hover:border-line'
            } `}
          >
            <div className="flex items-start space-x-3">
              <div className={option.colorClass}>{option.icon}</div>
              <div className="flex-1">
                <h4 className="text-content font-medium">{option.label}</h4>
                <p className="text-b2 text-content-secondary mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-info-subtle mt-6 rounded-lg p-4">
        <p className="text-b2 text-info-emphasis">
          <strong>{t('note')}:</strong> {t('oscrat.ui.compliance-status-note')}
        </p>
      </div>
    </div>
  );
};

export default ComplianceStatusSelector;

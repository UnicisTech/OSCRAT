import React from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceStatus } from '@/types/compliance';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaBan 
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
      colorClass: 'text-green-600',
      borderClass: 'border-green-500',
      bgClass: 'bg-green-50 hover:bg-green-100',
    },
    {
      value: 'Partially compliant' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.partially-compliant'),
      description: t('oscrat.ui.compliance-status.partially-compliant-desc'),
      icon: <FaExclamationTriangle className="text-3xl" />,
      colorClass: 'text-yellow-600',
      borderClass: 'border-yellow-500',
      bgClass: 'bg-yellow-50 hover:bg-yellow-100',
    },
    {
      value: 'Not Compliant' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.not-compliant'),
      description: t('oscrat.ui.compliance-status.not-compliant-desc'),
      icon: <FaTimesCircle className="text-3xl" />,
      colorClass: 'text-red-600',
      borderClass: 'border-red-500',
      bgClass: 'bg-red-50 hover:bg-red-100',
    },
    {
      value: 'Not Applicable' as ComplianceStatus,
      label: t('oscrat.ui.compliance-status.not-applicable'),
      description: t('oscrat.ui.compliance-status.not-applicable-desc'),
      icon: <FaBan className="text-3xl" />,
      colorClass: 'text-gray-600',
      borderClass: 'border-gray-400',
      bgClass: 'bg-gray-50 hover:bg-gray-100',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {t('oscrat.ui.select-compliance-status')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedStatus === option.value 
                ? `${option.borderClass} ${option.bgClass}` 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={option.colorClass}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {option.label}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{t('note')}:</strong> {t('oscrat.ui.compliance-status-note')}
        </p>
      </div>
    </div>
  );
};

export default ComplianceStatusSelector;

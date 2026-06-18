import React from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBan,
} from 'react-icons/fa';
import {
  COMPLIANCE_STATUS,
  type ComplianceStatus,
} from '@/constants/conformityStatuses';

interface StatusConfig {
  icon: React.ReactElement;
  textColor: string;
}

const STATUS_CONFIG: Record<ComplianceStatus, StatusConfig> = {
  [COMPLIANCE_STATUS.FULLY_COMPLIANT]: {
    icon: <FaCheckCircle className="text-green-500" />,
    textColor: 'text-green-600',
  },
  [COMPLIANCE_STATUS.PARTIALLY_COMPLIANT]: {
    icon: <FaExclamationTriangle className="text-yellow-500" />,
    textColor: 'text-yellow-600',
  },
  [COMPLIANCE_STATUS.NOT_COMPLIANT]: {
    icon: <FaTimesCircle className="text-red-500" />,
    textColor: 'text-red-600',
  },
  [COMPLIANCE_STATUS.NOT_APPLICABLE]: {
    icon: <FaBan className="text-gray-400" />,
    textColor: 'text-gray-500',
  },
};

export const getStatusIcon = (
  status?: ComplianceStatus
): React.ReactElement | null => {
  return status ? STATUS_CONFIG[status]?.icon || null : null;
};

export const getStatusColor = (status?: ComplianceStatus): string => {
  return status
    ? STATUS_CONFIG[status]?.textColor || 'text-gray-600'
    : 'text-gray-600';
};

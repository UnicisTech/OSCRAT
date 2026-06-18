import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { ComplianceNamespace } from '@/lib/compliance/translations';
import {
  FaDownload,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
} from 'react-icons/fa';
import {
  CONFORMITY_STATUS,
  getConformityStatusLabel,
} from '@/constants/conformityStatuses';
import {
  computeRequirementsStatus,
  getStatusBadgeColor,
} from '@/utils/compliance';
import { Button } from '@/components/shared';

interface ComplianceDashboardProps {
  complianceData: ComplianceArea[];
  state: ComplianceState;
  onExportPDF: () => void;
  complianceNamespace: ComplianceNamespace;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  complianceData,
  state,
  onExportPDF,
  complianceNamespace,
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);

  const requirementsStatus = useMemo(
    () =>
      computeRequirementsStatus(
        complianceData,
        state.assessments,
        t,
        complianceNamespace
      ),
    [complianceData, state.assessments, t, complianceNamespace]
  );

  const getStatusIcon = (status: string) => {
    if (status === CONFORMITY_STATUS.FULLY_COMPLIANT) {
      return <FaCheckCircle className="text-success" />;
    } else if (status.startsWith(CONFORMITY_STATUS.IN_EVALUATION)) {
      return <FaClock className="text-info" />;
    } else if (status === CONFORMITY_STATUS.NOT_EVALUATED) {
      return <FaExclamationCircle className="text-content-placeholder" />;
    } else if (status === CONFORMITY_STATUS.NOT_COMPLIANT) {
      return <FaExclamationCircle className="text-danger" />;
    }
    return null;
  };

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-h4 text-content font-bold">
          {t('oscrat.ui.dashboard.title')}
        </h2>
        <Button
          variant="primary"
          onClick={onExportPDF}
          startIcon={<FaDownload />}
        >
          {t('oscrat.ui.dashboard.export-pdf')}
        </Button>
      </div>

      {/* Status Table */}
      <div className="bg-surface border-line rounded-card overflow-hidden border">
        <div className="border-line-subtle border-b px-4 py-4">
          <h3 className="text-h6 text-content font-medium">
            {t('oscrat.ui.dashboard.requirements-status')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="divide-line-subtle min-w-full divide-y">
            <thead className="bg-surface-muted border-b border-line-header">
              <tr>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.requirement-id')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.requirement-name')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.area')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.evaluation-status')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.conformity-status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-line-subtle divide-y">
              {requirementsStatus.map((req) => (
                <tr key={req.id} className="hover:bg-surface-muted">
                  <td className="text-b2 text-content whitespace-nowrap px-4 py-4 font-medium">
                    {req.id}
                  </td>
                  <td className="text-b2 text-content px-4 py-4">{req.name}</td>
                  <td className="text-b2 text-content-secondary px-4 py-4">
                    {req.areaName}
                  </td>
                  <td className="text-b2 whitespace-nowrap px-4 py-4">
                    <span
                      className={`text-c1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
                        req.isEvaluated
                          ? 'bg-success-subtle text-success-emphasis'
                          : 'bg-surface-muted text-content'
                      }`}
                    >
                      {req.isEvaluated
                        ? t('oscrat.ui.dashboard.evaluated')
                        : t('oscrat.ui.dashboard.not-evaluated')}
                    </span>
                  </td>
                  <td className="text-b2 whitespace-nowrap px-4 py-4">
                    <span
                      className={`text-c1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${getStatusBadgeColor(req.conformityStatus)}`}
                    >
                      {getStatusIcon(req.conformityStatus)}
                      {getConformityStatusLabel(req.conformityStatus, t)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;

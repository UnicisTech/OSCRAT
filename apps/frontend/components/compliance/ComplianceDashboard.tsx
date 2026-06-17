import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { ComplianceNamespace } from '@/lib/compliance/translations';
import { FaDownload, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { CONFORMITY_STATUS, getConformityStatusLabel } from '@/constants/conformityStatuses';
import { computeRequirementsStatus, getStatusBadgeColor } from '@/utils/compliance';

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
    () => computeRequirementsStatus(complianceData, state.assessments, t, complianceNamespace),
    [complianceData, state.assessments, t, complianceNamespace]
  );

  const getStatusIcon = (status: string) => {
    if (status === CONFORMITY_STATUS.FULLY_COMPLIANT) {
      return <FaCheckCircle className="text-green-500" />;
    } else if (status.startsWith(CONFORMITY_STATUS.IN_EVALUATION)) {
      return <FaClock className="text-blue-500" />;
    } else if (status === CONFORMITY_STATUS.NOT_EVALUATED) {
      return <FaExclamationCircle className="text-gray-400" />;
    } else if (status === CONFORMITY_STATUS.NOT_COMPLIANT) {
      return <FaExclamationCircle className="text-red-500" />;
    }
    return null;
  };

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('oscrat.ui.dashboard.title')}
        </h2>
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaDownload />
          {t('oscrat.ui.dashboard.export-pdf')}
        </button>
      </div>

      {/* Status Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {t('oscrat.ui.dashboard.requirements-status')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.requirement-id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.requirement-name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.area')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.evaluation-status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.conformity-status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requirementsStatus.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {req.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {req.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {req.areaName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.isEvaluated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {req.isEvaluated ? t('oscrat.ui.dashboard.evaluated') : t('oscrat.ui.dashboard.not-evaluated')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(req.conformityStatus)}`}>
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


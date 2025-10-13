import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { FaPlay, FaCheckCircle, FaChartPie, FaList } from 'react-icons/fa';
import ComplianceDashboard from './ComplianceDashboard';
import { exportComplianceToPDF } from './CompliancePDFExport';

interface AreaListProps {
  areas: ComplianceArea[];
  completedAreas: Array<{ id: number; text: string }>;
  onAreaSelect: (areaIndex: number) => void;
  getAreaProgress: (areaId: number) => number;
  complianceState: ComplianceState;
  productId: string;
  teamName: string;
  productName: string;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  completedAreas,
  onAreaSelect,
  getAreaProgress,
  complianceState,
  productId,
  teamName,
  productName,
}) => { 
  const { t, ready } = useTranslation('common');
  const [showDashboard, setShowDashboard] = useState(false);

  const handleExportPDF = async () => {
    const pdfTranslations = {
      reportTitle: t('oscrat.ui.dashboard.pdf.report-title'),
      product: t('oscrat.ui.dashboard.pdf.product'),
      organization: t('oscrat.ui.dashboard.pdf.organization'),
      generated: t('oscrat.ui.dashboard.pdf.generated'),
      overallProgress: t('oscrat.ui.dashboard.overall-progress'),
      complete: t('oscrat.ui.dashboard.pdf.complete'),
      of: t('oscrat.ui.dashboard.pdf.of'),
      requirementsEvaluated: t('oscrat.ui.dashboard.requirements-evaluated'),
      summaryStatistics: t('oscrat.ui.dashboard.pdf.summary-statistics'),
      evaluated: t('oscrat.ui.dashboard.evaluated'),
      notEvaluated: t('oscrat.ui.dashboard.not-evaluated'),
      compliant: t('oscrat.ui.dashboard.compliant'),
      partiallyCompliant: t('oscrat.ui.dashboard.partially-compliant'),
      notCompliant: t('oscrat.ui.dashboard.not-compliant'),
      notApplicable: t('oscrat.ui.dashboard.not-applicable'),
      requirementsStatusSummary: t('oscrat.ui.dashboard.pdf.requirements-status-summary'),
      id: t('oscrat.ui.dashboard.pdf.id'),
      requirement: t('oscrat.ui.dashboard.pdf.requirement'),
      status: t('oscrat.ui.dashboard.pdf.status'),
      conformity: t('oscrat.ui.dashboard.pdf.conformity'),
      page: t('oscrat.ui.dashboard.pdf.page'),
      craReference: t('oscrat.ui.dashboard.pdf.cra-reference'),
      hint: t('oscrat.ui.dashboard.pdf.hint'),
      questionsAndAnswers: t('oscrat.ui.dashboard.pdf.questions-and-answers'),
      answer: t('oscrat.ui.dashboard.pdf.answer'),
      yes: t('oscrat.ui.dashboard.pdf.yes'),
      no: t('oscrat.ui.dashboard.pdf.no'),
      additionalInfo: t('oscrat.ui.dashboard.pdf.additional-info'),
      evidence: t('oscrat.ui.dashboard.pdf.evidence'),
      evidenceAttached: t('oscrat.ui.dashboard.pdf.evidence-attached'),
      noAnswerProvided: t('oscrat.ui.dashboard.pdf.no-answer-provided'),
      detailedAssessment: t('oscrat.ui.dashboard.pdf.detailed-assessment'),
      area: t('oscrat.ui.dashboard.area'),
    };
    
    await exportComplianceToPDF(
      areas, 
      complianceState, 
      productId, 
      teamName, 
      productName,
      pdfTranslations
    );
  };
  
  if (!ready) return null;

  if (showDashboard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('oscrat.ui.areas-of-requirements')}
          </h2>
          <button
            onClick={() => setShowDashboard(false)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaList />
            {t('oscrat.ui.dashboard.view-list')}
          </button>
        </div>
        <ComplianceDashboard
          complianceData={areas}
          state={complianceState}
          onExportPDF={handleExportPDF}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t('oscrat.ui.areas-of-requirements')}
        </h2>
        <button
          onClick={() => setShowDashboard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaChartPie />
          {t('oscrat.ui.dashboard.view-dashboard')}
        </button>
      </div>
      
      <div className="grid gap-4">
        {areas.map((area, index) => {
          const isCompleted = completedAreas.some(ca => ca.id === area.id);
          const progress = getAreaProgress(area.id);
          const isInProgress = progress > 0 && !isCompleted;

          return (
            <div
              key={area.id}
              className={`
                border rounded-lg p-6 transition-all duration-200 cursor-pointer
                ${isCompleted 
                  ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                  : isInProgress
                  ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                }
              `}
              onClick={() => !isCompleted && onAreaSelect(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {area.areaOfRequirements}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('oscrat.ui.total-requirements', { count: area.content.length })}
                  </p>
                  
                  {(isInProgress || isCompleted) && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {t('oscrat.ui.progress')}
                        </span>
                        <span className="font-medium">
                          {Math.floor(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {isCompleted ? (
                    <div className="flex flex-col items-center">
                      <FaCheckCircle className="text-green-500 text-3xl mb-1" />
                      <span className="text-xs text-green-600 font-medium">
                        {t('completed')}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAreaSelect(index);
                      }}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label={t('oscrat.ui.start-assessment-area', { area: area.areaOfRequirements })}
                    >
                      <FaPlay className="text-blue-600 text-2xl mb-1" />
                      <span className="text-xs text-blue-600 font-medium">
                        {isInProgress ? t('continue') : t('start')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {completedAreas.length === areas.length && (
        <div className="mt-8 p-6 bg-green-100 border border-green-500 rounded-lg text-center">
          <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            {t('oscrat.ui.all-areas-completed')}
          </h3>
          <p className="text-green-700">
            {t('oscrat.ui.compliance-assessment-ready-for-submission')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AreaList;

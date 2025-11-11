import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { ComplianceNamespace } from '@/lib/compliance/translations';
import { FaPlay, FaCheckCircle, FaRedo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FullScreenModal from '@/components/shared/FullScreenModal';

interface AreaListProps {
  areas: ComplianceArea[];
  completedAreas: Array<{ id: number; text: string }>;
  onAreaSelect: (areaIndex: number) => void;
  getAreaProgress: (areaId: number) => number;
  complianceState: ComplianceState;
  productId?: string;
  teamName: string;
  productName: string;
  onReset: () => void;
  complianceNamespace: ComplianceNamespace;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  completedAreas,
  onAreaSelect,
  getAreaProgress,
  complianceState: _complianceState,
  productId: _productId,
  teamName: _teamName,
  productName: _productName,
  onReset,
  complianceNamespace,
}) => { 
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetConfirm = () => {
    onReset();
    setShowResetConfirm(false);
    toast.success(t('oscrat.ui.compliance-reset-success'));
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };
  
  if (!ready) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t('oscrat.ui.areas-of-requirements')}
        </h2>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaRedo />
          {t('oscrat.ui.reset-assessment')}
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
                    {t(area.areaOfRequirements, { ns: complianceNamespace })}
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
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors min-w-[70px]"
                      aria-label={t('oscrat.ui.start-assessment-area', { area: t(area.areaOfRequirements, { ns: complianceNamespace }) })}
                    >
                      <FaPlay className="text-blue-600 text-2xl mb-1" />
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
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

      <FullScreenModal
        isOpen={showResetConfirm}
        onClose={handleCancelReset}
        title={t('oscrat.ui.reset-assessment-confirm-title')}
        text={t('oscrat.ui.reset-assessment-confirm-message')}
        cancelButtonText={t('cancel')}
        continueButtonText={t('oscrat.ui.reset-assessment')}
        onCancel={handleCancelReset}
        onContinue={handleResetConfirm}
      />
    </div>
  );
};

export default AreaList;

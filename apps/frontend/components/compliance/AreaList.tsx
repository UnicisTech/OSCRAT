import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import {
  ComplianceNamespace,
  createComplianceTranslator,
  TECH_DOC_CHECKLIST_NAMESPACE,
} from '@/lib/compliance/translations';
import { FaPlay, FaCheckCircle, FaRedo, FaClipboardList } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FullScreenModal from '@/components/shared/FullScreenModal';
import { Button } from '@/components/shared';

interface AreaListProps {
  areas: ComplianceArea[];
  completedAreas: Array<{ id: number; text: string }>;
  onAreaSelect: (areaIndex: number) => void;
  getAreaProgress: (areaId: number) => number;
  complianceState?: ComplianceState;
  onReset: () => void;
  complianceNamespace: ComplianceNamespace;
  customTranslations?: Record<string, string> | null;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  completedAreas,
  onAreaSelect,
  getAreaProgress,
  complianceState,
  onReset,
  complianceNamespace,
  customTranslations = null,
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const tr = createComplianceTranslator(
    t,
    complianceNamespace,
    customTranslations
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hasStarted =
    !!complianceState?.started ||
    (complianceState?.assessments?.length ?? 0) > 0 ||
    completedAreas.length > 0;

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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-h5 text-content font-bold">
          {t('oscrat.ui.areas-of-requirements')}
        </h2>
        <Button
          tone="danger"
          variant="primary"
          onClick={() => setShowResetConfirm(true)}
          disabled={!hasStarted}
          startIcon={<FaRedo />}
        >
          {t('oscrat.ui.reset-assessment')}
        </Button>
      </div>

      <div className="grid gap-4">
        {areas.map((area, index) => {
          const isCompleted = completedAreas.some((ca) => ca.id === area.id);
          const progress = getAreaProgress(area.id);
          const isInProgress = progress > 0 && !isCompleted;

          return (
            <div
              key={area.id}
              className={`cursor-pointer rounded-lg border p-6 transition-all duration-200 ${
                isCompleted
                  ? 'border-success bg-success-subtle hover:bg-success-subtle'
                  : isInProgress
                    ? 'border-info bg-info-subtle hover:bg-info-subtle'
                    : 'border-line bg-surface hover:bg-surface-muted hover:border-line'
              } `}
              onClick={() => onAreaSelect(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-h6 text-content font-medium">
                      {area.areaType === 'checklist'
                        ? t(area.areaOfRequirements, {
                            ns: TECH_DOC_CHECKLIST_NAMESPACE,
                          })
                        : tr(area.areaOfRequirements)}
                    </h3>
                    {area.optional && (
                      <span className="text-c1 bg-warning-subtle text-warning rounded-full px-2 py-0.5 font-medium">
                        {t('optional')}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const totalCount = area.content.length;
                    const actualCompleted = Math.round(
                      (progress / 100) * totalCount
                    );

                    return (
                      <>
                        <p className="text-b2 text-content-secondary">
                          {t('oscrat.ui.assessments-completed-of-total', {
                            completed: actualCompleted,
                            total: totalCount,
                          })}
                        </p>

                        {(isInProgress || isCompleted) && (
                          <div className="mt-3">
                            <div className="text-b2 mb-1 flex items-center justify-between">
                              <span className="text-content-secondary">
                                {isCompleted
                                  ? t('oscrat.ui.area-complete')
                                  : t('oscrat.ui.assessments-remaining', {
                                      count: totalCount - actualCompleted,
                                    })}
                              </span>
                              <span className="font-medium">
                                {Math.floor(progress)}%
                              </span>
                            </div>
                            <div className="bg-surface-muted h-2 w-full rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-success' : 'bg-primary'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAreaSelect(index);
                    }}
                    className="hover:bg-surface-muted flex min-w-[70px] flex-col items-center rounded-lg p-2 transition-colors"
                    aria-label={t(
                      isCompleted ? 'edit' : 'oscrat.ui.start-assessment-area',
                      { area: tr(area.areaOfRequirements) }
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <FaCheckCircle className="text-success mb-1 text-2xl" />
                        <span className="text-c1 text-success font-medium">
                          {t('edit')}
                        </span>
                      </>
                    ) : area.areaType === 'checklist' ? (
                      <>
                        <FaClipboardList className="text-primary mb-1 text-2xl" />
                        <span className="text-c1 text-primary whitespace-nowrap font-medium">
                          {isInProgress
                            ? t('continue')
                            : t('oscrat.ui.open-checklist')}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaPlay className="text-primary mb-1 text-2xl" />
                        <span className="text-c1 text-primary whitespace-nowrap font-medium">
                          {isInProgress ? t('continue') : t('start')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completedAreas.length === areas.length && (
        <div className="bg-success-subtle border-success mt-8 rounded-lg border p-6 text-center">
          <FaCheckCircle className="text-success mx-auto mb-3 text-4xl" />
          <h3 className="text-h6 text-success-emphasis mb-2 font-bold">
            {t('oscrat.ui.all-areas-completed')}
          </h3>
          <p className="text-success">
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

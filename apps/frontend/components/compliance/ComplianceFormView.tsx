import React from 'react';
import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { AreaList, RequirementQuestionnaire } from '@/components/compliance';
import type { ComplianceNamespace } from '@/lib/compliance/translations';

interface ComplianceFormViewProps {
  complianceData: ComplianceArea[];
  localState: ComplianceState;
  showQuestionnaire: boolean;
  complianceNamespace: ComplianceNamespace;
  customTranslations?: Record<string, string> | null;
  onAreaSelect: (areaIndex: number) => void;
  onRequirementComplete: (assessment: RequirementAssessment) => Promise<void>;
  onBack: () => void;
  onReset: () => Promise<void>;
  getAreaProgress: (areaId: number) => number;
  getRequirementAssessment: (requirementId: string) => RequirementAssessment | undefined;
}

const ComplianceFormView: React.FC<ComplianceFormViewProps> = ({
  complianceData,
  localState,
  showQuestionnaire,
  complianceNamespace,
  customTranslations = null,
  onAreaSelect,
  onRequirementComplete,
  onBack,
  onReset,
  getAreaProgress,
  getRequirementAssessment,
}) => {
  if (
    showQuestionnaire &&
    localState.currentAreaIndex !== null &&
    localState.currentRequirementIndex !== null
  ) {
    const currentArea = complianceData[localState.currentAreaIndex];
    const currentRequirement = currentArea.content[localState.currentRequirementIndex];

    if (!currentRequirement) {
      return null;
    }

    return (
      <RequirementQuestionnaire
        area={currentArea}
        requirement={currentRequirement}
        requirementIndex={localState.currentRequirementIndex}
        totalRequirements={currentArea.content.length}
        existingAssessment={getRequirementAssessment(currentRequirement.reqId)}
        onComplete={onRequirementComplete}
        onBack={onBack}
        complianceNamespace={complianceNamespace}
        customTranslations={customTranslations}
      />
    );
  }

  return (
    <AreaList
      areas={complianceData}
      completedAreas={localState.completedAreas}
      onAreaSelect={onAreaSelect}
      getAreaProgress={getAreaProgress}
      complianceState={localState}
      onReset={onReset}
      complianceNamespace={complianceNamespace}
      customTranslations={customTranslations}
    />
  );
};

export default ComplianceFormView;

import React, { useState } from 'react';
import { OscratOrganizationRole } from '@oscrat/model';
import { ComplianceArea } from '@/types/compliance';
import AssessmentLanguageSelector from './AssessmentLanguageSelector';
import { ComplianceForm } from '@/components/compliance';
import type { ComplianceType } from '@/lib/compliance/translations';

type TranslationsState = Record<string, string> | null | undefined;

interface Props {
  complianceData: ComplianceArea[];
  productId?: string;
  versionId?: string;
  teamSlug: string;
  teamId: string;
  teamRole: OscratOrganizationRole;
  teamName: string;
  productName: string;
  complianceType: ComplianceType;
  isAssessmentStarted?: boolean;
}

const ComplianceAssessmentWrapper: React.FC<Props> = ({
  complianceData,
  productId,
  versionId,
  teamSlug,
  teamId,
  teamRole,
  teamName,
  productName,
  complianceType,
  isAssessmentStarted = false,
}) => {
  const [translations, setTranslations] = useState<TranslationsState>(undefined);

  if (translations === undefined) {
    return (
      <AssessmentLanguageSelector
        teamSlug={teamSlug}
        teamRole={teamRole}
        complianceType={complianceType}
        isAssessmentStarted={isAssessmentStarted}
        onLanguageSelect={(_, t) => setTranslations(t)}
      />
    );
  }

  return (
    <ComplianceForm
      complianceData={complianceData}
      productId={productId}
      versionId={versionId}
      teamSlug={teamSlug}
      teamId={teamId}
      teamRole={teamRole}
      teamName={teamName}
      productName={productName}
      complianceType={complianceType}
      customTranslations={translations}
    />
  );
};

export default ComplianceAssessmentWrapper;

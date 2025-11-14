import Tab from './tab';
import ViewModal from '@/components/oscrat/versions/versionDetails/conformityRow/tab/modal';
import { useState, useMemo, useCallback } from 'react';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { useVersionCompliance } from '@/hooks/oscrat/useVersionCompliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getComplianceNamespace } from '@/lib/compliance/translations';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { OscratOrganizationRole } from '@oscrat/model';
import type { ComplianceAnswer } from '@/types/compliance';

export default function ConformityRow() {
  const router = useRouter();
  const { data: session } = useSession();
  const { productId, versionId } = useVersionContext();
  const { teamContext } = useTeamContext();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);

  const team = teamContext.team;
  if (!team) return null;
  const complianceNamespace = useMemo(() => {
    return getComplianceNamespace(getRoleForTeam(team.orgRoles[0] as OscratOrganizationRole), 'version');
  }, [team]);

  const { t } = useTranslation(['common', complianceNamespace]);
  
  const { complianceState } = useVersionCompliance({
    teamSlug: team?.slug,
    productId,
    versionId,
    teamRole: team?.orgRoles[0],
    userId: session?.user?.id,
  });

  const { complianceData } = useComplianceData({
    teamSlug: team?.slug,
    teamRole: team?.orgRoles[0],
    complianceType: 'version',
    enabled: !!team,
  });

  const formatAnswerText = useCallback((answer: ComplianceAnswer) => {
    let text = typeof answer.answer === 'boolean' 
      ? (answer.answer ? t('yes') : t('no'))
      : answer.answer;

    if (answer.additionalInformation) {
      text += ` - ${answer.additionalInformation}`;
    }

    return text;
  }, [t]);

  const structuredContent = useMemo(() => {
    if (!complianceState?.assessments || !complianceData) return [];

    return complianceData
      .map((area) => {
        const requirements = area.content
          .map((requirement) => {
            const assessment = complianceState.assessments.find(
              (a) => a.requirementId === requirement.reqId
            );
            if (!assessment) return null;

            const questions = requirement.questions
              .map((question) => {
                const answer = assessment.answers.find((a) => a.questionId === question.questionId);
                return answer ? {
                  question: t(question.questionText, { ns: complianceNamespace }),
                  answer: formatAnswerText(answer),
                } : null;
              })
              .filter((q): q is NonNullable<typeof q> => q !== null);

            return questions.length > 0 ? {
              requirementTitle: t(requirement.requirement, { ns: complianceNamespace }),
              requirementId: requirement.reqId,
              status: assessment.complianceStatus,
              questions,
            } : null;
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        return requirements.length > 0 ? {
          areaTitle: t(area.areaOfRequirements, { ns: complianceNamespace }),
          areaId: area.id,
          requirements,
        } : null;
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);
  }, [complianceState, complianceData, t, complianceNamespace, formatAnswerText]);

  const declarationContent = useMemo(() => [
    {
      question: 'Has the product been tested against EN 62368-1:2020?',
      answer: 'Yes, passed all tests.',
    },
    {
      question: 'Does the product comply with RoHS directive 2011/65/EU?',
      answer: 'Yes, all components are compliant.',
    },
    {
      question: 'Is the CE marking affixed to the product?',
      answer: 'Yes, the CE mark is present on the product label.',
    },
  ], []);

  const handleDirectEdit = useCallback(() => {
    router.push(`/teams/${team?.slug}/products/${productId}/versions/${versionId}/compliance`);
  }, [router, team?.slug, productId, versionId]);

  const handleDirectDownload = useCallback(() => {
    // TODO: Implement download functionality
  }, []);

  return (
    <div className="mt-4 flex w-full items-center justify-center space-x-4">
      <Tab
        title="Conformity Assessment"
        onViewClick={() => setEditModalOpen(true)}
        actionType="edit"
        onActionClick={handleDirectEdit}
      />

      <Tab
        title="Declaration of Conformity"
        onViewClick={() => setDownloadModalOpen(true)}
        actionType="download"
        onActionClick={handleDirectDownload}
      />

      <ViewModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Conformity Assessment"
        structuredContent={structuredContent}
        variant="edit"
        onEdit={handleDirectEdit}
      />

      <ViewModal
        isOpen={isDownloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Declaration of Conformity"
        content={declarationContent}
        variant="download"
        onDownload={handleDirectDownload}
      />
    </div>
  );
}

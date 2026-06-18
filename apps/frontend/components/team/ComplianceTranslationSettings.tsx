import React, { useMemo } from 'react';
import { Card } from '@/components/shared';
import { Team } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { useTeamData } from '@/hooks/useTeamData';
import {
  UploadTranslationForm,
  ExistingTranslationsTable,
  parseExistingTranslations,
} from './complianceTranslation';

const ComplianceTranslationSettings = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const {
    dataList,
    upsertData,
    fetchDataItem,
    fetchComplianceTemplate,
    isLoading,
    isUpserting,
  } = useTeamData(team.slug);

  const existingTranslations = useMemo(
    () => parseExistingTranslations(dataList),
    [dataList]
  );

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>
            {t('oscrat.ui.compliance-translation.title')}
          </Card.Title>
          <Card.Description>
            {t('oscrat.ui.compliance-translation.description')}
          </Card.Description>
        </Card.Header>
        <div className="space-y-6">
          <UploadTranslationForm
            upsertData={upsertData}
            fetchDataItem={fetchDataItem}
            fetchComplianceTemplate={fetchComplianceTemplate}
            existingTranslations={existingTranslations}
            isLoading={isLoading}
            isUpserting={isUpserting}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('oscrat.ui.compliance-translation.existing-translations')}
            </h3>
            <ExistingTranslationsTable
              translations={existingTranslations}
              teamSlug={team.slug}
              isLoading={isLoading}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ComplianceTranslationSettings;

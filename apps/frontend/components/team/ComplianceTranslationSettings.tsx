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
  const { dataList, upsertData, fetchDataItem, fetchComplianceTemplate, isLoading, isUpserting } = useTeamData(team.slug);

  const existingTranslations = useMemo(() => parseExistingTranslations(dataList), [dataList]);

  return (
    <Card heading={t('oscrat.ui.compliance-translation.title')}>
      <Card.Body className="px-3 py-3">
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('oscrat.ui.compliance-translation.description')}
          </p>

          <UploadTranslationForm
            upsertData={upsertData}
            fetchDataItem={fetchDataItem}
            fetchComplianceTemplate={fetchComplianceTemplate}
            existingTranslations={existingTranslations}
            isLoading={isLoading}
            isUpserting={isUpserting}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('oscrat.ui.compliance-translation.existing-translations')}</h3>
            <ExistingTranslationsTable translations={existingTranslations} teamSlug={team.slug} isLoading={isLoading} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ComplianceTranslationSettings;

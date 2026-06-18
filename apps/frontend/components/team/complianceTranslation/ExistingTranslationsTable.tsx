import React from 'react';
import { useTranslation } from 'next-i18next';
import { FaLanguage } from 'react-icons/fa';
import TranslationRow from './TranslationRow';
import type { ExistingTranslation } from './constants';

interface ExistingTranslationsTableProps {
  translations: ExistingTranslation[];
  teamSlug: string;
  isLoading: boolean;
}

const ExistingTranslationsTable: React.FC<ExistingTranslationsTableProps> = ({
  translations,
  teamSlug,
  isLoading,
}) => {
  const { t } = useTranslation('common');

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (translations.length === 0) {
    return (
      <div className="text-content-muted py-8 text-center">
        <FaLanguage className="mx-auto mb-2 text-4xl opacity-50" />
        <p>{t('oscrat.ui.compliance-translation.no-translations')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead className="bg-surface-muted text-content border-b border-line-header">
          <tr>
            <th className="p-4 text-b2 font-medium">
              {t('oscrat.ui.compliance-translation.assessment-type')}
            </th>
            <th className="p-4 text-b2 font-medium">
              {t('oscrat.ui.compliance-translation.language')}
            </th>
            <th className="p-4 text-b2 font-medium">
              {t('oscrat.ui.last-edited')}
            </th>
            <th className="p-4 text-b2 font-medium">
              {t('oscrat.ui.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {translations.map((translation) => (
            <TranslationRow
              key={translation.dataKey}
              translation={translation}
              teamSlug={teamSlug}
              t={t}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExistingTranslationsTable;

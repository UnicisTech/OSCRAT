import React from 'react';
import Version from '../../../version';
import { useTranslation } from 'react-i18next';
import type { OscratProductVersionSummary } from '@oscrat/model';

type SupportedTabProps = {
  data: OscratProductVersionSummary[];
};

export default function SupportedTab({ data }: SupportedTabProps) {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {data?.map((versionData) => (
          <Version key={versionData.id} data={versionData as any} />
        ))}
      </div>

      {!data ||
        (data?.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.no-supported-versions-available')}
            </div>
          </div>
        ))}
    </div>
  );
}

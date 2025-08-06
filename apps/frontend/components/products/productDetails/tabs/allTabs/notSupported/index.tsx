import React from 'react';
import Version from '../../../version';
import { useTranslation } from 'react-i18next';
import type { OscratProductVersionSummary } from '@oscrat/model';

type NotSupportedTabProps = {
  data: OscratProductVersionSummary[];
};

export default function NotSupportedTab({ data }: NotSupportedTabProps) {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {data?.map((versionData) => (
          <Version
            key={versionData.id}
            data={versionData as any}
            variant="notSupported"
          />
        ))}
      </div>

      {!data?.length && (
        <div className="py-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.no-unsupported-versions-available')}
          </div>
        </div>
      )}
    </div>
  );
}

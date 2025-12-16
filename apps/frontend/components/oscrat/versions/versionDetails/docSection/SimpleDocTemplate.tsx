import { useTranslation } from 'next-i18next';
import type { SimpleDocData } from '@/lib/doc/types';

interface SimpleDocTemplateProps {
  data: SimpleDocData;
}

export default function SimpleDocTemplate({ data }: SimpleDocTemplateProps) {
  const { t } = useTranslation('common');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
      <h3 className="mb-4 text-center text-lg font-bold uppercase text-gray-900 dark:text-white">
        {t('oscrat.ui.doc.simple-declaration-title')}
      </h3>

      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          {t('oscrat.ui.doc.simple-declaration-text-1')}{' '}
          <span className="font-semibold">{data.manufacturerName || '[Insert Full Legal Name of the Manufacturer]'}</span>{' '}
          {t('oscrat.ui.doc.simple-declaration-text-2')}{' '}
          <span className="font-semibold">{data.productName} {data.versionName}</span>{' '}
          {t('oscrat.ui.doc.simple-declaration-text-3')}
        </p>

        <p>
          {t('oscrat.ui.doc.simple-declaration-text-4')}{' '}
          <a href="#" className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400">
            [URL]
          </a>
        </p>
      </div>
    </div>
  );
}

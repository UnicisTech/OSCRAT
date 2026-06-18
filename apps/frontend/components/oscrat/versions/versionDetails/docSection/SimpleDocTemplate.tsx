import { useTranslation } from 'next-i18next';
import type { SimpleDocData } from '@/lib/doc/types';

interface SimpleDocTemplateProps {
  data: SimpleDocData;
}

export default function SimpleDocTemplate({ data }: SimpleDocTemplateProps) {
  const { t } = useTranslation('common');

  return (
    <div className="border-line bg-surface rounded-card border p-6">
      <h3 className="text-content mb-4 text-center text-lg font-bold uppercase">
        {t('oscrat.ui.doc.simple-declaration-title')}
      </h3>

      <div className="text-content-secondary space-y-4">
        <p>
          {t('oscrat.ui.doc.simple-declaration-text-1')}{' '}
          <span className="font-semibold">
            {data.manufacturerName ||
              '[Insert Full Legal Name of the Manufacturer]'}
          </span>{' '}
          {t('oscrat.ui.doc.simple-declaration-text-2')}{' '}
          <span className="font-semibold">
            {data.productName} {data.versionName}
          </span>{' '}
          {t('oscrat.ui.doc.simple-declaration-text-3')}
        </p>

        <p>
          {t('oscrat.ui.doc.simple-declaration-text-4')}{' '}
          <a
            href="https://europa.eu/youreurope/business/product-requirements/compliance/signing-declaration-conformity/index_en.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark underline"
          >
            https://europa.eu/youreurope/business/product-requirements/compliance/signing-declaration-conformity/index_en.htm
          </a>
        </p>
      </div>
    </div>
  );
}

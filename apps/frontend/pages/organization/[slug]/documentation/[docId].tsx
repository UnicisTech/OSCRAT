import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useGetDocumentation } from '@/lib/api/hooks';
import { Breadcrumb } from '@/components/shared';
import { DocumentationEditor } from '@/components/documentation';

const DocumentationDetailPage = () => {
  const router = useRouter();
  const { slug, docId } = router.query as { slug: string; docId: string };
  const { teamContext } = useTeamContext();
  const { team, isLoading: teamLoading, isError: teamError } = teamContext;
  const { t, ready } = useTranslation('common');

  const {
    data: documentation,
    isLoading: docLoading,
    isError: docError,
  } = useGetDocumentation(slug, docId);

  if (teamLoading || !ready) {
    return <div>{t('loading')}</div>;
  }

  if (teamError || !team) {
    return <div>{t('team-not-found')}</div>;
  }

  if (docLoading) {
    return <div>{t('loading')}</div>;
  }

  if (docError || !documentation) {
    return (
      <div className="text-content-muted p-4 text-center">
        {t('oscrat.ui.documentation.not-found')}
      </div>
    );
  }

  const breadcrumbItems =
    documentation?.productId && documentation?.versionId
      ? [
          {
            label: t('oscrat.ui.products'),
            href: `/organization/${slug}/products`,
          },
          {
            label: documentation.productName || '...',
            href: `/organization/${slug}/products/${documentation.productId}`,
          },
          {
            label: documentation.versionName || '...',
            href: `/organization/${slug}/products/${documentation.productId}/versions/${documentation.versionId}`,
          },
          {
            label: documentation.title || '...',
            current: true,
          },
        ]
      : [
          {
            label: t('oscrat.ui.documentation.title'),
            href: `/organization/${slug}/documentation`,
          },
          {
            label: documentation?.title || '...',
            current: true,
          },
        ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="border-line bg-surface rounded-card border p-6">
        {docId && <DocumentationEditor docId={docId} />}
      </div>
    </div>
  );
};

DocumentationDetailPage.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default DocumentationDetailPage;

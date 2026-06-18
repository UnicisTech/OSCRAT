import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import {
  documentationEndpoints,
  type PublicDocumentation,
} from '@/lib/api/endpoints/documentation';
import { PublicDocumentationLayout } from '@/components/documentation';
import app from '@/lib/app';

function PublicDocumentationPage() {
  const router = useRouter();
  const { slug, docSlug } = router.query as { slug: string; docSlug: string };

  const {
    data: doc,
    isLoading,
    isError,
  } = useQuery<PublicDocumentation>({
    queryKey: ['public-documentation', slug, docSlug],
    queryFn: () => documentationEndpoints.getPublic(slug, docSlug),
    enabled: !!slug && !!docSlug,
  });

  return (
    <PublicDocumentationLayout
      doc={doc}
      isLoading={isLoading}
      isError={isError}
      metaTitle={doc ? `${doc.title} | ${app.name}` : app.name}
      metaDescription={doc ? `${doc.title} - Technical Documentation` : ''}
    />
  );
}

PublicDocumentationPage.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export default PublicDocumentationPage;

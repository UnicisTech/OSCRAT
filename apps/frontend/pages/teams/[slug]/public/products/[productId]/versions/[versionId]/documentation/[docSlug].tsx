import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { documentationEndpoints, type PublicProductDocumentation } from '@/lib/api/endpoints/documentation';
import { PublicDocumentationLayout } from '@/components/documentation';
import app from '@/lib/app';

function PublicProductDocumentationPage() {
  const router = useRouter();
  const { slug, productId, versionId, docSlug } = router.query as {
    slug: string;
    productId: string;
    versionId: string;
    docSlug: string;
  };

  const { data: doc, isLoading, isError } = useQuery<PublicProductDocumentation>({
    queryKey: ['public-product-documentation', slug, productId, versionId, docSlug],
    queryFn: () => documentationEndpoints.getPublicProduct(slug, productId, versionId, docSlug),
    enabled: !!slug && !!productId && !!versionId && !!docSlug,
  });

  const productBadge = doc ? `${doc.productName} ${doc.versionName}` : undefined;

  return (
    <PublicDocumentationLayout
      doc={doc}
      isLoading={isLoading}
      isError={isError}
      metaTitle={
        doc ? `${doc.title} | ${doc.productName} ${doc.versionName} | ${app.name}` : app.name
      }
      metaDescription={
        doc
          ? `${doc.title} - ${doc.productName} ${doc.versionName} Technical Documentation`
          : ''
      }
      productBadge={productBadge}
    />
  );
}

PublicProductDocumentationPage.getLayout = function getLayout(page: ReactElement) {
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

export default PublicProductDocumentationPage;

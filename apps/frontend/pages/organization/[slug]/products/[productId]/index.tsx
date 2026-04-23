'use client';

import { withProductLayout } from '@/lib/layout-helpers';
import { ProductDetails } from '@/components/oscrat/products/ProductDetails';
import { Breadcrumb } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useProductContext } from '@/context/ProductContext';

export default function ProductDashboard() {
  const { t, ready } = useTranslation('common');
  const { slug, teamId, productId } = useProductContext();

  const { project } = useOscratProject(teamId, productId);

  if (!ready) {
    return null;
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${slug}/products`,
    },
    {
      label: project!.name,
      href: `/organization/${slug}/products/${productId}`,
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <ProductDetails productId={productId} />
    </>
  );
}

ProductDashboard.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

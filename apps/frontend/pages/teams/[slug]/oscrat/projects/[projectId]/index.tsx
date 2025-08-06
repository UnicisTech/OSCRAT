'use client';

import { useParams } from 'next/navigation';
import { withProductLayout } from '@/lib/layout-helpers';
import { ProductDetails } from '@/components/oscrat/products/ProductDetails';

export default function ProductDashboard() {
  const params = useParams();
  const projectId = params?.projectId as string;

  return <ProductDetails projectId={projectId} />;
}

ProductDashboard.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

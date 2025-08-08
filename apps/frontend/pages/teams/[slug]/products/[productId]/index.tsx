'use client';

import { useParams } from 'next/navigation';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import { ProductDetails } from '@/components/oscrat/products/ProductDetails';

export default function ProductDashboard() {
  const params = useParams();
  const productId = params?.productId as string;

  return <ProductDetails productId={productId} />;
}

ProductDashboard.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
'use client';

import { useRouter } from 'next/router';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import { ProductDetails } from '@/components/oscrat/products/ProductDetails';

export default function ProductDashboard() {
  const router = useRouter();
  const { productId } = router.query;

  return <ProductDetails productId={productId as string} />;
}

ProductDashboard.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

import React from 'react';
import { ProductListContent } from '@/components/products/ProductListContent';
import { withProductLayout } from '@/lib/layout-helpers';

function ProductList() {
  return <ProductListContent />;
}

ProductList.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default ProductList;

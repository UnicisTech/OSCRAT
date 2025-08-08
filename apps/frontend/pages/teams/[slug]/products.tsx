import React from 'react';
import { ProductListContent } from '@/components/oscrat/products/ProductListContent';
import { withProductListLayout } from '@/lib/layout-helpers';

const Products = () => {
  return <ProductListContent />;
};

Products.getLayout = withProductListLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default Products;

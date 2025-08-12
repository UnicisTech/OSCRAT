import React from 'react';
import { ProductListContent } from '@/components/oscrat/products/ProductListContent';
import { withTeamLayout } from '@/lib/layout-helpers';

const Products = () => {
  return <ProductListContent />;
};

Products.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default Products;

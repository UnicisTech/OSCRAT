import React from 'react';
import FormComponent from '@/components/oscrat/form';
import { withCraLayout } from '@/lib/layout-helpers';

const FormPage = () => {
  return <FormComponent />;
};

FormPage.getLayout = withCraLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default FormPage;
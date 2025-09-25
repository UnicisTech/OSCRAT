import React from 'react';
import type { NextPage } from 'next';
import FormComponent from '@/components/oscrat/form';
import { withTeamLayout } from '@/lib/layout-helpers';

const TeamFormPage: NextPage & { getLayout?: typeof withTeamLayout } = () => {
  return <FormComponent />;
};

TeamFormPage.getLayout = withTeamLayout;
export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TeamFormPage;

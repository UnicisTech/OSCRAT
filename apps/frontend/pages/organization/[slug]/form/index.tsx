import React from 'react';
import type { NextPage } from 'next';
import FormComponent from '@/components/oscrat/form';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';

const TeamFormPage: NextPage & { getLayout?: typeof withTeamLayout } = () => {
  const { slug } = useTeamContext();

  return <FormComponent teamSlug={slug} />;
};

TeamFormPage.getLayout = withTeamLayout;
export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TeamFormPage;

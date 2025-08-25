import React from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { Tasks } from '@/components/interfaces/Task';
import { useTeamContext } from '@/context/TeamContext';

const AllTasks = () => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  return <Tasks team={team} />;
};

AllTasks.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default AllTasks;

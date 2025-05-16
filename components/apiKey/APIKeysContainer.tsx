import { TeamTab } from '@/components/team';
import { useTeamContext } from '@/context/TeamContext';
import APIKeys from './APIKeys';
import { TeamFeature } from 'types';

const APIKeysContainer = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  // TeamContext already handles loading and errors,
  // so we can be confident that team exists when this component renders

  return (
    <>
      <TeamTab activeTab="api-keys" team={team} teamFeatures={teamFeatures} />
      <APIKeys team={team} />
    </>
  );
};

export default APIKeysContainer;

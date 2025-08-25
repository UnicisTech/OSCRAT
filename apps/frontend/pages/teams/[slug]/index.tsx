import { withTeamLayout } from '@/lib/layout-helpers';
import TeamMembers from './members';

TeamMembers.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TeamMembers;

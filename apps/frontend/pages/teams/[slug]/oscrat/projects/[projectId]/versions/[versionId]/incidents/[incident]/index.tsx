import Incident from '@/components/versions/versionDetails/tabs/allTabs/incidents/incident';
import Summary from '@/components/versions/versionDetails/tabs/allTabs/incidents/summary';
import { withProductLayout } from '@/lib/layout-helpers';

export default function Index() {
  return (
    <div className="flex flex-col gap-6">
      <Incident />
      <Summary />
    </div>
  );
}

Index.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

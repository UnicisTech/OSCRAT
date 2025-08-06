import TabsManager from '@/components/versions/versionDetails/tabs/TabManager';
import { withProductLayout } from '@/lib/layout-helpers';
import TABS_CONFIG from '@/components/versions/versionDetails/tabs/tabs';
import Version from '@/components/versions/versionDetails/version';
import ConformityRow from '@/components/versions/versionDetails/conformityRow';
import { useParams } from 'next/navigation';

export default function Index() {
  const params = useParams();
  const version = params?.versionId as string;

  if (!version) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Version versionId={version} />
      <ConformityRow />
      <TabsManager tabs={TABS_CONFIG} />
    </>
  );
}

Index.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

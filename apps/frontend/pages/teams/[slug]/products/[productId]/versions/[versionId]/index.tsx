import TabsManager from '@/components/oscrat/versions/versionDetails/tabs/TabManager';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import TABS_CONFIG from '@/components/oscrat/versions/versionDetails/tabs/tabs';
import Version from '@/components/oscrat/versions/versionDetails/version';
import ConformityRow from '@/components/oscrat/versions/versionDetails/conformityRow';
import { useParams } from 'next/navigation';

export default function Index() {
  const params = useParams();
  const version = params?.versionId as string;

  if (!version) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Version />
      <ConformityRow />
      <TabsManager tabs={TABS_CONFIG} />
    </>
  );
}

Index.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
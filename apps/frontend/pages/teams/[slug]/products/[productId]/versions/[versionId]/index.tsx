import TabsManager from '@/components/oscrat/versions/versionDetails/tabs/TabManager';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import TABS_CONFIG from '@/components/oscrat/versions/versionDetails/tabs/tabs';
import Version from '@/components/oscrat/versions/versionDetails/version';
import DocSection from '@/components/oscrat/versions/versionDetails/docSection';
import { Breadcrumb } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';

export default function Index() {
  const { t, ready } = useTranslation('common');
  const { teamId, productId, versionId } = useVersionContext();

  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(
    teamId,
    productId,
    versionId
  );

  if (!ready || !project || !versionData) {
    return null;
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/teams/${teamId}/products`,
    },
    {
      label: project.name,
      href: `/teams/${teamId}/products/${productId}`,
    },
    {
      label: versionData.version,
      href: `/teams/${teamId}/products/${productId}/versions/${versionId}`,
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Version />
      <DocSection />
      <TabsManager tabs={TABS_CONFIG} />
    </>
  );
}

Index.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

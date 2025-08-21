import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { extractErrorMessage } from '@/lib/utils';
import ProductComponent from '@/components/oscrat/products/productDetails/product';
import TabsManager from '@/components/shared/TabsManager';
import { useTranslation } from 'next-i18next';
import createTabsConfig from '@/components/oscrat/products/productDetails/tabs/tabs';
import type { OscratProductDetail, OscratProductUpdate } from '@oscrat/model';
import { useProductContext } from '@/context/ProductContext';
import { useOscratVersions } from '@/hooks/oscrat/useOscratVersion';

interface ProductDetailsProps {
  productId: string;
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const { slug } = useTeamContext();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tabs, setTabs] = useState<any>(null);
  const { t } = useTranslation('common');

  const { project, deleteProject, updateProject } =
    useOscratProject(slug, productId, { enabled: !isRedirecting });

  const { teamId } = useProductContext();

  const { versions } = useOscratVersions(teamId, productId);

  useEffect(() => {
    if (versions) {
      const tabsConfig = createTabsConfig(versions as any);
      setTabs(tabsConfig);
    }
  }, [versions]);

  const handleDelete = async () => {
    if (!project) {
      return;
    }

    setIsRedirecting(true);

    try {
      await deleteProject.mutateAsync(undefined);
      toast.success('Project deleted successfully');
      const redirectPath = `/teams/${slug}/products`;
      router.replace(redirectPath);
    } catch (error) {
      setIsRedirecting(false);
      toast.error(extractErrorMessage(error, 'Failed to delete project'));
    }
  };

  const handleWithdraw = () => {
    //TODO: Implement withdraw functionality
  };

  const handleEdit = async (updatedData: OscratProductUpdate) => {
    try {
      await updateProject(updatedData);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update project'));
    }
  };

  return (
    <>
      <ProductComponent
        key={project?.id}
        project={project as OscratProductDetail}
        onDelete={handleDelete}
        onWithdraw={handleWithdraw}
        onEdit={handleEdit}
      />
      {tabs && tabs.length > 0 && (
        <TabsManager buttonText={t('oscrat.ui.new-assesment')} tabs={tabs} />
      )}
    </>
  );
}

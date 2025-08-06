import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { extractErrorMessage } from '@/lib/utils';
import ProductComponent from '@/components/products/productDetails/product';
import TabsManager from '@/components/shared/TabsManager';
import { useTranslation } from 'next-i18next';
import createTabsConfig from '@/components/products/productDetails/tabs/tabs';
import { LoadingState, ErrorState } from '@/components/shared/StateComponents';
import type { OscratProductUpdate } from '@oscrat/model';
import { useProductContext } from '@/context/ProductContext';
import { useOscratVersions } from '@/hooks/oscrat/useOscratVersion';

interface ProductDetailsProps {
  projectId: string;
}

export function ProductDetails({ projectId }: ProductDetailsProps) {
  const router = useRouter();
  const { slug } = useTeamContext();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tabs, setTabs] = useState<any>(null);
  const { t } = useTranslation('common');

  const { project, isLoading, isError, error, deleteProject, updateProject } =
    useOscratProject(slug, projectId, { enabled: !isRedirecting });

  const { teamId } = useProductContext();

  const { versions } = useOscratVersions(teamId, projectId);

  useEffect(() => {
    if (versions) {
      console.log('mataching versions', versions);
      const tabsConfig = createTabsConfig(versions as any);
      setTabs(tabsConfig);
    }
  }, [versions]);

  const isDeleting = deleteProject.isPending;

  // Handle redirection based on loading states
  useEffect(() => {
    if (isLoading || isDeleting || isRedirecting) {
      return;
    }

    if (isError) {
      //router.push('/404');
      return;
    }
  }, [isError, isLoading, isDeleting, isRedirecting]);

  const handleDelete = async () => {
    if (!project) {
      return;
    }

    setIsRedirecting(true);

    try {
      await deleteProject.mutateAsync(undefined);
      toast.success('Project deleted successfully');
      const redirectPath = `/teams/${slug}/oscrat/projects`;
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

  if (isLoading || isDeleting || isRedirecting || !project) {
    return (
      <LoadingState
        message={
          isDeleting || isRedirecting
            ? 'Deleting project...'
            : 'Loading product details...'
        }
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={`Error loading product details: ${error?.message}`}
      />
    );
  }

  return (
    <>
      <ProductComponent
        key={project.id}
        project={project}
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

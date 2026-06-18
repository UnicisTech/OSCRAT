import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { extractErrorMessage } from '@/lib/utils';
import ProductComponent from '@/components/oscrat/products/productDetails/product';
import TabsManager from '@/components/shared/TabsManager';
import { useTranslation } from 'next-i18next';
import { createTabsConfig } from '@/components/oscrat/products/productDetails/tabs/tabs';
import ApplicabilitySurveySection from '@/components/oscrat/products/productDetails/applicabilitySurvey';
import type { OscratProductDetail, OscratProductUpdate } from '@oscrat/model';

interface ProductDetailsProps {
  productId: string;
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const { slug } = useTeamContext();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { t } = useTranslation('common');

  const { project, deleteProject, updateProject } = useOscratProject(
    slug,
    productId,
    { enabled: !isRedirecting }
  );

  const tabs = useMemo(() => {
    if (!project?.versions?.length) return null;
    return createTabsConfig(
      project.versions as OscratProductDetail['versions'],
      t
    );
  }, [project?.versions, t]);

  const handleDelete = async () => {
    if (!project) {
      return;
    }

    setIsRedirecting(true);

    try {
      await deleteProject.mutateAsync(undefined);
      toast.success(t('oscrat.ui.product-deleted-successfully'));
      const redirectPath = `/organization/${slug}/products`;
      router.replace(redirectPath);
    } catch (error) {
      setIsRedirecting(false);
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-delete-product'))
      );
    }
  };

  const handleEdit = async (updatedData: OscratProductUpdate) => {
    try {
      await updateProject(updatedData);
      toast.success(t('oscrat.ui.product-updated-successfully'));
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-update-product'))
      );
    }
  };

  const handleAddVersion = () => {
    router.push(`/organization/${slug}/products/${productId}/versions/new`);
  };

  return (
    <>
      <ProductComponent
        key={project?.id}
        project={project as OscratProductDetail}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      {project && (
        <ApplicabilitySurveySection product={project as OscratProductDetail} />
      )}
      {tabs && tabs.length > 0 ? (
        <TabsManager
          buttonText={t('oscrat.ui.add-version')}
          tabs={tabs}
          onButtonClick={handleAddVersion}
        />
      ) : null}
    </>
  );
}

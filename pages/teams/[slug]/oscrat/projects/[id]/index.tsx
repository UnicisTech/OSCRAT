'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { extractErrorMessage } from '@/lib/utils';
import ProductComponent from '@/components/productDetails/product';
import TabsManager from '@/components/productDetails/tabsManager';
import AccountLayout from '@/components/layouts/AccountLayout';
import TeamLayout from '@/components/layouts/TeamLayout';

export default function ProductDashboard() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { slug } = useTeamContext();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { project, isLoading, isError, error, deleteProject } =
    useOscratProject(slug, projectId, { enabled: !isRedirecting });

  const isDeleting = deleteProject.isPending;

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
    // Withdraw functionality removed as requested
  };

  const handleEdit = () => {
    // Edit functionality removed as requested
  };

  if (isLoading || isDeleting || isRedirecting || !project) {
    return (
      <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900 dark:text-gray-200">
        <p>
          {isDeleting || isRedirecting
            ? 'Deleting project...'
            : 'Loading product details...'}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900 dark:text-gray-200">
        <p>Error loading product details: {error?.message}</p>
      </div>
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
      <TabsManager />
    </>
  );
}

ProductDashboard.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

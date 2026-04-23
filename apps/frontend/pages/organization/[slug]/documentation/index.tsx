import React, { useState } from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useTranslation } from 'next-i18next';
import Header from '@/components/oscrat/shared/header';
import { DocumentationList, CreateDocumentationModal } from '@/components/documentation';

const DocumentationPage = () => {
  const { teamContext } = useTeamContext();
  const { team, isLoading, isError } = teamContext;
  const { t, ready } = useTranslation('common');
  const [createVisible, setCreateVisible] = useState(false);

  if (isLoading || !ready) {
    return <div>{t('loading')}</div>;
  }

  if (isError || !team) {
    return <div>{t('team-not-found')}</div>;
  }

  return (
    <>
      <Header
        title={t('oscrat.ui.documentation.title')}
        subtitle={t('oscrat.ui.documentation.description')}
        buttonText={t('oscrat.ui.documentation.add')}
        onButtonClick={() => setCreateVisible(true)}
      />
      
      <div className="mt-6">
        <DocumentationList />
      </div>

      <CreateDocumentationModal
        visible={createVisible}
        setVisible={setCreateVisible}
      />
    </>
  );
};

DocumentationPage.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default DocumentationPage;

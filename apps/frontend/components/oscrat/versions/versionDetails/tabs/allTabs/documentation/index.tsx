import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  TabHeader,
  TableWrapper,
  TableHeader,
  TableRow,
  TabActionButton,
  TabLoading,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { StatusBadge } from '@/components/shared';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { useListDocumentation } from '@/lib/api/hooks';
import { CreateDocumentationModal } from '@/components/documentation';


export default function Documentation() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { versionId, productId } = useVersionContext();
  const { teamContext } = useTeamContext();
  const { team } = teamContext;
  const slug = team?.slug || '';

  const [createVisible, setCreateVisible] = useState(false);

  const { data: documentation, isLoading } = useListDocumentation(slug, {
    productId,
    versionId,
  });

  const tableHeaders = [
    t('title'),
    t('status'),
    t('visibility'),
    t('updated'),
  ];

  if (isLoading || !team) {
    return <TabLoading />;
  }

  return (
    <div className="w-full">
      <TabHeader title={t('oscrat.ui.documentation.title')}>
        <TabActionButton onClick={() => setCreateVisible(true)}>
          {t('oscrat.ui.documentation.add')}
        </TabActionButton>
      </TabHeader>

      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader columns={tableHeaders.map((h) => ({ label: h }))} />
          <tbody className={tableStyles.tbody}>
            {documentation && documentation.length > 0 ? (
              documentation.map((doc) => (
                <TableRow
                  key={doc.id}
                  onClick={() => router.push(`/teams/${slug}/documentation/${doc.id}`)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className={tableStyles.td}>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-xs text-gray-500">v{doc.version}</div>
                  </td>
                  <td className={tableStyles.td}>
                    <StatusBadge
                      value={doc.status}
                      label={t(`oscrat.ui.documentation.status.${doc.status.toLowerCase()}`)}
                    />
                  </td>
                  <td className={tableStyles.td}>
                    <span
                      className={`text-sm ${
                        doc.visibility === 'PUBLIC' ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {doc.visibility === 'PUBLIC'
                        ? t('oscrat.ui.documentation.visibility.public')
                        : t('oscrat.ui.documentation.visibility.private')}
                    </span>
                  </td>
                  <td className={tableStyles.td}>
                    <span className="text-sm text-gray-500">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {t('oscrat.ui.documentation.no-documents')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrapper>

      <CreateDocumentationModal
        visible={createVisible}
        setVisible={setCreateVisible}
        defaultProductId={productId}
        defaultVersionId={versionId}
      />
    </div>
  );
}

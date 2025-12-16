import React from 'react';
import { FaDownload, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTeamDataItem } from '@/hooks/useTeamData';
import { AccessControl } from '@/components/shared/AccessControl';
import { downloadJson } from '@/lib/utils/download';
import type { ExistingTranslation } from './constants';

interface TranslationRowProps {
  translation: ExistingTranslation;
  teamSlug: string;
  t: (key: string) => string;
}

const TranslationRow: React.FC<TranslationRowProps> = ({ translation, teamSlug, t }) => {
  const { data, deleteData, isDeleting } = useTeamDataItem(teamSlug, translation.dataKey);

  const handleDownload = () => {
    if (!data?.payload) return;
    try {
      downloadJson(data.payload, `${translation.namespace}-${translation.language}.json`);
    } catch {
      toast.error(t('oscrat.ui.compliance-translation.download-error'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData();
      toast.success(t('oscrat.ui.compliance-translation.delete-success'));
    } catch {
      toast.error(t('oscrat.ui.compliance-translation.delete-error'));
    }
  };

  return (
    <tr>
      <td>{translation.namespaceLabel}</td>
      <td>{translation.languageLabel}</td>
      <td>{new Date(translation.updatedAt).toLocaleDateString()}</td>
      <td>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleDownload}>
            <FaDownload />
          </button>
          <AccessControl resource="team" actions={['update']}>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <FaTrash />
            </button>
          </AccessControl>
        </div>
      </td>
    </tr>
  );
};

export default TranslationRow;

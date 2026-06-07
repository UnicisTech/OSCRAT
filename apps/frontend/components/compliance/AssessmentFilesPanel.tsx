import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { FaUpload, FaDownload, FaTrash, FaFile } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAssessmentAttachments } from '@/hooks/oscrat/useAssessmentAttachments';
import { extractErrorMessage } from '@/lib/utils';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const FILE_ACCEPT =
  '.pdf,.doc,.docx,.txt,.csv,.json,.xml,.yml,.yaml,.zip,.tar,.gz,.tgz,.png,.jpg,.jpeg,.gif';

interface AssessmentFilesPanelProps {
  teamSlug: string;
  assessmentId: string | null | undefined;
}

const AssessmentFilesPanel: React.FC<AssessmentFilesPanelProps> = ({
  teamSlug,
  assessmentId,
}) => {
  const { t } = useTranslation('common');
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );

  const {
    attachments,
    isLoading,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
  } = useAssessmentAttachments(teamSlug, assessmentId || '', {
    enabled: !!assessmentId,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !assessmentId) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(t('oscrat.ui.file-upload-max-size'));
      return;
    }

    try {
      await uploadAttachment(file);
      toast.success(t('oscrat.ui.assessment-file-uploaded'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.assessment-file-upload-failed'))
      );
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    setDownloadingFiles((prev) => new Set(prev).add(id));
    try {
      await downloadAttachment(id, filename);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.assessment-file-download-failed'))
      );
    } finally {
      setDownloadingFiles((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttachment(id);
      toast.success(t('oscrat.ui.assessment-file-deleted'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.assessment-file-delete-failed'))
      );
    }
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {t('oscrat.ui.assessment-files')}
        </h3>
        {assessmentId && (
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FaUpload className="mr-2" />
            {t('oscrat.ui.add-file')}
            <input
              type="file"
              onChange={handleFileChange}
              className="sr-only"
              accept={FILE_ACCEPT}
            />
          </label>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {t('oscrat.ui.assessment-files-description')}
      </p>

      {!assessmentId ? (
        <p className="text-sm text-gray-500 italic">
          {t('oscrat.ui.assessment-files-not-started')}
        </p>
      ) : isLoading && attachments.length === 0 ? (
        <p className="text-sm text-gray-500">{t('oscrat.ui.loading')}</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          {t('oscrat.ui.no-files-added')}
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center min-w-0">
                <FaFile className="text-gray-400 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(attachment.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(attachment.id, attachment.name)}
                  disabled={downloadingFiles.has(attachment.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                  title={t('oscrat.ui.download')}
                >
                  <FaDownload size={12} />
                  {t('oscrat.ui.download')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(attachment.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  title={t('delete')}
                >
                  <FaTrash size={12} />
                  {t('delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssessmentFilesPanel;

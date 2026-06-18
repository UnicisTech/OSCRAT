import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { FaUpload, FaDownload, FaTrash, FaFile } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAssessmentAttachments } from '@/hooks/oscrat/useAssessmentAttachments';
import { extractErrorMessage } from '@/lib/utils';
import { Button } from '@/components/shared';
import { formatDateShort } from '@/utils/dateFormat';

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
        extractErrorMessage(
          error,
          t('oscrat.ui.assessment-file-download-failed')
        )
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
    <div className="border-line rounded-card bg-surface mt-8 border p-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-content text-lg font-semibold">
          {t('oscrat.ui.assessment-files')}
        </h3>
        {assessmentId && (
          <label className="border-line text-content-secondary bg-surface hover:bg-surface-muted rounded-input inline-flex cursor-pointer items-center border px-4 py-2 text-sm font-medium">
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
      <p className="text-content-muted mb-4 text-sm">
        {t('oscrat.ui.assessment-files-description')}
      </p>

      {!assessmentId ? (
        <p className="text-content-muted text-sm italic">
          {t('oscrat.ui.assessment-files-not-started')}
        </p>
      ) : isLoading && attachments.length === 0 ? (
        <p className="text-content-muted text-sm">{t('oscrat.ui.loading')}</p>
      ) : attachments.length === 0 ? (
        <p className="text-content-muted text-sm italic">
          {t('oscrat.ui.no-files-added')}
        </p>
      ) : (
        <ul className="divide-line-subtle border-line rounded-input divide-y border">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex min-w-0 items-center">
                <FaFile className="text-content-placeholder mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-content truncate text-sm font-medium">
                    {attachment.name}
                  </p>
                  <p className="text-content-muted text-xs">
                    {formatDateShort(attachment.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  variant="tertiary"
                  size="s"
                  onClick={() => handleDownload(attachment.id, attachment.name)}
                  disabled={downloadingFiles.has(attachment.id)}
                  title={t('oscrat.ui.download')}
                  startIcon={<FaDownload size={12} />}
                >
                  {t('oscrat.ui.download')}
                </Button>
                <Button
                  variant="tertiary"
                  tone="danger"
                  size="s"
                  onClick={() => handleDelete(attachment.id)}
                  title={t('delete')}
                  startIcon={<FaTrash size={12} />}
                >
                  {t('delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssessmentFilesPanel;

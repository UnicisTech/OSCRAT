import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  FaUpload,
  FaDownload,
  FaTrash,
  FaLink,
  FaUnlink,
} from 'react-icons/fa';
import type { Task, Team } from '@oscrat/model';
import {
  useGetTaskLinkedDocumentation,
  useGetTaskAttachments,
  useUploadTaskAttachment,
  useDeleteTaskAttachment,
} from '@/lib/api/hooks/tasks';
import { useListDocumentation } from '@/lib/api/hooks/documentation';
import { useDownloadAttachment } from '@/lib/api/hooks/attachments';
import { documentationEndpoints } from '@/lib/api/endpoints/documentation';
import { queryClient } from '@/lib/api/hooks';
import { queryKeys } from '@/lib/api/queryKeys';
import { StatusBadge, Loading } from '@/components/shared';
import Button from '@/components/button';
import useCanAccess from '@/hooks/useCanAccess';
import { useComments } from '@/hooks/useComments';
import { extractErrorMessage } from '@/lib/utils';
import { checkExtensionAndMIMEType, isEmptyFile } from '@/utils/fileValidation';
import { formatDateShort, formatDateTime } from '@/utils/dateFormat';
import type { Attachment } from '@/types';

interface TaskDetailsTabsProps {
  task: Task;
  team: Team;
}

type TabKey = 'documentation' | 'comments' | 'attachments';

interface Tab {
  id: TabKey;
  label: string;
}

const TaskDetailsTabs: React.FC<TaskDetailsTabsProps> = ({ task, team }) => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const taskNumberStr = task.taskNumber.toString();

  const [activeTab, setActiveTab] = useState<TabKey>('documentation');
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const { canAccess } = useCanAccess(team.slug);
  const canUpdateTask = canAccess('task', ['update']);

  // Documentation
  const { data: linkedDocs, isLoading: isLoadingDocs } =
    useGetTaskLinkedDocumentation(team.slug, taskNumberStr);
  const { data: allDocs } = useListDocumentation(team.slug);
  const [showLinkDocPicker, setShowLinkDocPicker] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isLinkingDoc, setIsLinkingDoc] = useState(false);

  // Comments
  const {
    comments,
    isLoading: isLoadingComments,
    createComment,
  } = useComments(team.slug, taskNumberStr);

  // Attachments
  const { data: attachments, isLoading: isLoadingAttachments } =
    useGetTaskAttachments(team.slug, taskNumberStr);
  const uploadMutation = useUploadTaskAttachment(team.slug, taskNumberStr);
  const deleteMutation = useDeleteTaskAttachment(team.slug, taskNumberStr);
  const downloadMutation = useDownloadAttachment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const tabs: Tab[] = [
    { id: 'documentation', label: t('oscrat.ui.documentation.title') },
    { id: 'comments', label: t('comments') },
    { id: 'attachments', label: t('oscrat.ui.attachments') },
  ];

  const handleDocClick = (docId: string) => {
    router.push(`/organization/${team.slug}/documentation/${docId}`);
  };

  // --- Documentation linking (direct endpoint call, no hook-level docId needed) ---
  const linkedDocIds = new Set(linkedDocs?.map((d) => d.id) || []);
  const availableDocsToLink = (allDocs || []).filter(
    (d) => !linkedDocIds.has(d.id) && d.status !== 'ARCHIVED'
  );

  const handleLinkDoc = useCallback(async () => {
    if (!selectedDocId) return;
    setIsLinkingDoc(true);
    try {
      await documentationEndpoints.linkTask(team.slug, selectedDocId, task.id);
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.documentation(team.slug, taskNumberStr),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.detail(
          team.slug,
          selectedDocId
        ),
      });
      toast.success(t('oscrat.ui.documentation.linked'));
      setShowLinkDocPicker(false);
      setSelectedDocId('');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to link documentation'));
    } finally {
      setIsLinkingDoc(false);
    }
  }, [selectedDocId, team.slug, task.id, taskNumberStr, t]);

  const handleUnlinkDoc = useCallback(
    async (docId: string) => {
      try {
        await documentationEndpoints.unlinkTask(team.slug, docId, task.id);
        queryClient.invalidateQueries({
          queryKey: queryKeys.teams.tasks.documentation(
            team.slug,
            taskNumberStr
          ),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.teams.documentation.detail(team.slug, docId),
        });
        toast.success(t('oscrat.ui.documentation.unlinked'));
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, 'Failed to unlink documentation')
        );
      }
    },
    [team.slug, task.id, taskNumberStr, t]
  );

  // --- Comments ---
  const handleAddComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    try {
      await createComment({ text: trimmedComment });
      setNewComment('');
      setCommentError(null);
    } catch {
      setCommentError(t('error.comment-create-failed'));
    }
  };

  // --- Attachments (explicit button-triggered, no useEffect) ---
  const handleUploadFile = useCallback(
    async (file: File) => {
      if (isEmptyFile(file)) {
        toast.error(t('oscrat.ui.validation.file-empty'));
        return;
      }
      if (!checkExtensionAndMIMEType(file)) {
        toast.error(t('oscrat.ui.file-upload-allowed-types'));
        return;
      }
      try {
        await uploadMutation.mutateAsync({
          file,
          taskId: task.id,
          slug: team.slug,
          versionId: task.versionId ?? undefined,
        });
        toast.success(t('oscrat.ui.file-uploaded-successfully'));
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, t('oscrat.ui.failed-to-upload-file'))
        );
      }
    },
    [uploadMutation, task.id, team.slug, t]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteMutation.mutateAsync(attachmentId);
      toast.success(t('attachment-deleted'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('attachment-delete-error')));
    }
  };

  const handleDownloadAttachment = async (
    attachmentId: string,
    filename: string
  ) => {
    try {
      await downloadMutation.mutateAsync({ attachmentId, filename });
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-download'))
      );
    }
  };

  // --- Tab content renderers ---
  const renderDocumentationTab = () => {
    if (isLoadingDocs) {
      return (
        <div className="p-6">
          <Loading />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {canUpdateTask && (
          <div className="flex justify-end">
            {showLinkDocPicker ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="border-line focus:border-primary focus:ring-primary rounded-input border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">
                    {t('oscrat.ui.select-documentation')}
                  </option>
                  {availableDocsToLink.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="m"
                  onClick={handleLinkDoc}
                  disabled={!selectedDocId || isLinkingDoc}
                  text={t('oscrat.ui.link')}
                />
                <Button
                  variant="secondary"
                  size="m"
                  onClick={() => {
                    setShowLinkDocPicker(false);
                    setSelectedDocId('');
                  }}
                  text={t('cancel')}
                />
              </div>
            ) : (
              <Button
                variant="secondary"
                size="m"
                onClick={() => setShowLinkDocPicker(true)}
                startIcon={<FaLink size={12} />}
                text={t('oscrat.ui.link-documentation')}
              />
            )}
          </div>
        )}

        {linkedDocs && linkedDocs.length > 0 ? (
          <div className="bg-surface border-line rounded-card overflow-x-auto border">
            <table className="text-content-secondary divide-line-subtle min-w-full divide-y text-left text-sm">
              <thead className="bg-surface-muted text-content border-line-header border-b">
                <tr>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('title')}
                  </th>
                  <th className="text-content text-b2 hidden whitespace-nowrap p-4 font-medium md:table-cell">
                    {t('oscrat.ui.documentation.level.label')}
                  </th>
                  <th className="text-content text-b2 whitespace-nowrap p-4 font-medium">
                    {t('status')}
                  </th>
                  <th className="text-content text-b2 hidden whitespace-nowrap p-4 font-medium sm:table-cell">
                    {t('visibility')}
                  </th>
                  <th className="text-content text-b2 hidden whitespace-nowrap p-4 font-medium lg:table-cell">
                    {t('updated')}
                  </th>
                  {canUpdateTask && (
                    <th className="text-content text-b2 whitespace-nowrap p-4 text-right font-medium">
                      {t('actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-surface divide-line-subtle divide-y">
                {linkedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-surface-muted cursor-pointer"
                    onClick={() => handleDocClick(doc.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-content font-medium">
                          {doc.title}
                        </span>
                        {doc.productName && (
                          <span className="text-content-muted text-xs">
                            {doc.productName}
                            {doc.versionName && ` ${doc.versionName}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-content-secondary text-sm">
                        {doc.productName
                          ? t('oscrat.ui.documentation.level.product')
                          : t('oscrat.ui.documentation.level.organization')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        value={doc.status}
                        label={t(
                          `oscrat.ui.documentation.status.${doc.status.toLowerCase()}`
                        )}
                      />
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={`text-sm ${doc.visibility === 'PUBLIC' ? 'text-success' : 'text-content-muted'}`}
                      >
                        {doc.visibility === 'PUBLIC'
                          ? t('oscrat.ui.documentation.visibility.public')
                          : t('oscrat.ui.documentation.visibility.private')}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-content-muted text-sm">
                        {formatDateShort(doc.updatedAt)}
                      </span>
                    </td>
                    {canUpdateTask && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="tertiary"
                          tone="danger"
                          size="s"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkDoc(doc.id);
                          }}
                          title={t('oscrat.ui.unlink-documentation')}
                          startIcon={<FaUnlink size={12} />}
                          text={t('oscrat.ui.unlink')}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-content-muted p-6 text-center">
            <p className="italic">
              {t('oscrat.ui.tasks.no-linked-documentation')}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderCommentsTab = () => (
    <div className="bg-surface border-line rounded-card space-y-6 border p-6">
      {canUpdateTask && (
        <form onSubmit={handleAddComment} className="space-y-2">
          <label className="text-content-secondary block text-sm font-medium">
            {t('oscrat.ui.new-comment')}
          </label>
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder={t('oscrat.ui.new-comment')}
            rows={4}
            className="border-line text-content-secondary focus:ring-primary rounded-input w-full border px-3 py-2 focus:outline-none focus:ring-2"
          />
          {commentError && (
            <p className="text-danger text-sm">{commentError}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={!newComment.trim()}
            text={t('oscrat.ui.add-comment')}
          />
        </form>
      )}

      {isLoadingComments ? (
        <Loading />
      ) : comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-line-subtle rounded-card border p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-content text-sm font-medium">
                  {comment.createdBy?.name || '\u2014'}
                </p>
                <p className="text-content-muted text-xs">
                  {formatDateTime(comment.createdAt)}
                </p>
              </div>
              <p className="text-content-secondary whitespace-pre-wrap text-sm">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-content-muted text-sm italic">
          {t('oscrat.ui.no-comments-yet')}
        </p>
      )}
    </div>
  );

  const renderAttachmentsTab = () => {
    const attachmentsList: Attachment[] = attachments || [];

    return (
      <div className="bg-surface border-line rounded-card space-y-6 border p-6">
        {canUpdateTask && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-card flex cursor-pointer items-center justify-center border-2 border-dashed px-4 py-6 text-center transition-colors ${
                isDragOver
                  ? 'border-info bg-info-subtle'
                  : 'border-line hover:border-line'
              }`}
            >
              <div className="space-y-1">
                <FaUpload className="text-content-placeholder mx-auto h-6 w-6" />
                <p className="text-content-secondary text-sm">
                  <span className="text-primary font-medium">
                    {t('click-to-upload')}
                  </span>{' '}
                  <span className="text-content-muted">
                    {t('oscrat.ui.or-drag-and-drop')}
                  </span>
                </p>
              </div>
            </div>
            {uploadMutation.isPending && (
              <p className="text-primary mt-2 text-sm">
                {t('oscrat.ui.uploading')}
              </p>
            )}
          </div>
        )}

        {isLoadingAttachments ? (
          <Loading />
        ) : attachmentsList.length > 0 ? (
          <div className="space-y-2">
            {attachmentsList.map((attachment) => (
              <div
                key={attachment.id}
                className="border-line-subtle rounded-card flex items-center justify-between border p-3"
              >
                <div className="flex min-w-0 flex-col">
                  <p className="text-content truncate text-sm font-medium">
                    {attachment.name}
                  </p>
                  <p className="text-content-muted text-xs">
                    {(attachment.fileSize / 1024).toFixed(1)} KB
                    {attachment.mimeType && ` \u2022 ${attachment.mimeType}`}
                    {attachment.createdByUser &&
                      ` \u2022 ${attachment.createdByUser.name}`}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <Button
                    variant="tertiary"
                    size="s"
                    onClick={() =>
                      handleDownloadAttachment(attachment.id, attachment.name)
                    }
                    disabled={downloadMutation.isPending}
                    title={t('oscrat.ui.download')}
                    startIcon={<FaDownload size={12} />}
                    text={t('oscrat.ui.download')}
                  />
                  {canUpdateTask && (
                    <Button
                      variant="tertiary"
                      tone="danger"
                      size="s"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      disabled={deleteMutation.isPending}
                      title={t('delete')}
                      startIcon={<FaTrash size={12} />}
                      text={t('delete')}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-content-muted text-sm italic">
            {t('oscrat.ui.no-attachments')}
          </p>
        )}
      </div>
    );
  };

  const renderTabContent = (tabId: TabKey) => {
    switch (tabId) {
      case 'documentation':
        return renderDocumentationTab();
      case 'comments':
        return renderCommentsTab();
      case 'attachments':
        return renderAttachmentsTab();
      default:
        return null;
    }
  };

  if (!ready) return null;

  return (
    <div className="mt-6">
      <div
        className="flex justify-start"
        role="tablist"
        aria-label="Task information sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-button-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'active-tab-button border-info text-info border-b-2 font-medium'
                : 'inactive-tab-button'
            } mr-1 cursor-pointer px-4 py-2`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-button-${tab.id}`}
          className={`tab-content-panel mt-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
        >
          {activeTab === tab.id && renderTabContent(tab.id)}
        </div>
      ))}
    </div>
  );
};

export default TaskDetailsTabs;

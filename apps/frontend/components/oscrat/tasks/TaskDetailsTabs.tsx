import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { FaUpload, FaDownload, FaTrash, FaLink, FaUnlink } from 'react-icons/fa';
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
import useCanAccess from '@/hooks/useCanAccess';
import { useComments } from '@/hooks/useComments';
import { extractErrorMessage } from '@/lib/utils';
import { checkExtensionAndMIMEType } from '@/utils/fileValidation';
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
  const { data: linkedDocs, isLoading: isLoadingDocs } = useGetTaskLinkedDocumentation(
    team.slug,
    taskNumberStr
  );
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
  const { data: attachments, isLoading: isLoadingAttachments } = useGetTaskAttachments(
    team.slug,
    taskNumberStr
  );
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
      await documentationEndpoints.linkTask(team.slug, selectedDocId, task.taskNumber);
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.documentation(team.slug, taskNumberStr),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.detail(team.slug, selectedDocId),
      });
      toast.success(t('oscrat.ui.documentation.linked'));
      setShowLinkDocPicker(false);
      setSelectedDocId('');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to link documentation'));
    } finally {
      setIsLinkingDoc(false);
    }
  }, [selectedDocId, team.slug, task.taskNumber, taskNumberStr, t]);

  const handleUnlinkDoc = useCallback(async (docId: string) => {
    try {
      await documentationEndpoints.unlinkTask(team.slug, docId, task.taskNumber);
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.documentation(team.slug, taskNumberStr),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.detail(team.slug, docId),
      });
      toast.success(t('oscrat.ui.documentation.unlinked'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to unlink documentation'));
    }
  }, [team.slug, task.taskNumber, taskNumberStr, t]);

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
  const handleUploadFile = useCallback(async (file: File) => {
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
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-upload-file')));
    }
  }, [uploadMutation, task.id, team.slug, t]);

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

  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    try {
      await downloadMutation.mutateAsync({ attachmentId, filename });
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-download')));
    }
  };

  // --- Tab content renderers ---
  const renderDocumentationTab = () => {
    if (isLoadingDocs) {
      return <div className="p-6"><Loading /></div>;
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
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('oscrat.ui.select-documentation')}</option>
                  {availableDocsToLink.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleLinkDoc}
                  disabled={!selectedDocId || isLinkingDoc}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {t('oscrat.ui.link')}
                </button>
                <button
                  onClick={() => { setShowLinkDocPicker(false); setSelectedDocId(''); }}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLinkDocPicker(true)}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FaLink size={12} />
                {t('oscrat.ui.link-documentation')}
              </button>
            )}
          </div>
        )}

        {linkedDocs && linkedDocs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">{t('title')}</th>
                  <th className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">{t('oscrat.ui.documentation.level.label')}</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">{t('status')}</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">{t('visibility')}</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">{t('updated')}</th>
                  {canUpdateTask && (
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap text-right">{t('actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {linkedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleDocClick(doc.id)}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{doc.title}</span>
                        {doc.productName && (
                          <span className="text-xs text-gray-500">
                            {doc.productName}
                            {doc.versionName && ` ${doc.versionName}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {doc.productName ? t('oscrat.ui.documentation.level.product') : t('oscrat.ui.documentation.level.organization')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={doc.status} label={t(`oscrat.ui.documentation.status.${doc.status.toLowerCase()}`)} />
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className={`text-sm ${doc.visibility === 'PUBLIC' ? 'text-green-600' : 'text-gray-500'}`}>
                        {doc.visibility === 'PUBLIC' ? t('oscrat.ui.documentation.visibility.public') : t('oscrat.ui.documentation.visibility.private')}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="text-sm text-gray-500">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </td>
                    {canUpdateTask && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnlinkDoc(doc.id); }}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          title={t('oscrat.ui.unlink-documentation')}
                        >
                          <FaUnlink size={12} />
                          {t('oscrat.ui.unlink')}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p className="italic">{t('oscrat.ui.tasks.no-linked-documentation')}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCommentsTab = () => (
    <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
      {canUpdateTask && (
        <form onSubmit={handleAddComment} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('oscrat.ui.new-comment')}</label>
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder={t('oscrat.ui.new-comment')}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {commentError && <p className="text-sm text-red-600">{commentError}</p>}
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {t('oscrat.ui.add-comment')}
          </button>
        </form>
      )}

      {isLoadingComments ? (
        <Loading />
      ) : comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-gray-200 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{comment.createdBy?.name || '\u2014'}</p>
                <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-gray-500">{t('oscrat.ui.no-comments-yet')}</p>
      )}
    </div>
  );

  const renderAttachmentsTab = () => {
    const attachmentsList: Attachment[] = attachments || [];

    return (
      <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
        {canUpdateTask && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors ${
                isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="space-y-1">
                <FaUpload className="mx-auto h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{t('click-to-upload')}</span>{' '}
                  <span className="text-gray-500">{t('oscrat.ui.or-drag-and-drop')}</span>
                </p>
              </div>
            </div>
            {uploadMutation.isPending && (
              <p className="mt-2 text-sm text-blue-600">{t('oscrat.ui.uploading')}</p>
            )}
          </div>
        )}

        {isLoadingAttachments ? (
          <Loading />
        ) : attachmentsList.length > 0 ? (
          <div className="space-y-2">
            {attachmentsList.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div className="flex flex-col min-w-0">
                  <p className="truncate font-medium text-gray-900 text-sm">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {(attachment.fileSize / 1024).toFixed(1)} KB
                    {attachment.mimeType && ` \u2022 ${attachment.mimeType}`}
                    {attachment.createdByUser && ` \u2022 ${attachment.createdByUser.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleDownloadAttachment(attachment.id, attachment.name)}
                    disabled={downloadMutation.isPending}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                    title={t('oscrat.ui.download')}
                  >
                    <FaDownload size={12} />
                    {t('oscrat.ui.download')}
                  </button>
                  {canUpdateTask && (
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      title={t('delete')}
                    >
                      <FaTrash size={12} />
                      {t('delete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">{t('oscrat.ui.no-attachments')}</p>
        )}
      </div>
    );
  };

  const renderTabContent = (tabId: TabKey) => {
    switch (tabId) {
      case 'documentation': return renderDocumentationTab();
      case 'comments': return renderCommentsTab();
      case 'attachments': return renderAttachmentsTab();
      default: return null;
    }
  };

  if (!ready) return null;

  return (
    <div className="mt-6">
      <div className="flex justify-start" role="tablist" aria-label="Task information sections">
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
                ? 'active-tab-button border-b-2 border-blue-500 font-medium text-blue-500'
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

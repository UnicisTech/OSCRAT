import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import * as Yup from 'yup';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDocumentationDetail } from '@/hooks/useDocumentation';
import useCanAccess from '@/hooks/useCanAccess';
import useTasks from '@/hooks/useTasks';
import { useTeamContext } from '@/context/TeamContext';
import { Loading } from '@/components/shared';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import PublicUrlDisplay from './PublicUrlDisplay';
import LinkedTasksSection from './LinkedTasksSection';
import DeleteDocumentationModal from './DeleteDocumentationModal';
import { DocumentationStatus, DocumentationVisibility } from '@oscrat/model';
import { asyncWithToast } from '@/lib/utils';
import { titleSchema } from '@/lib/validation/inputs';

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Props {
  docId: string;
}

const DocumentationEditor: React.FC<Props> = ({ docId }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { canAccess } = useCanAccess(slug);
  const { teamContext } = useTeamContext();
  const { team } = teamContext;

  const {
    documentation,
    isLoading,
    isUpdating,
    updateDocumentation,
    deleteDocumentation,
    linkToTask,
    unlinkFromTask,
    isLinkingTask,
    isUnlinkingTask,
  } = useDocumentationDetail(slug, docId);

  const { tasks } = useTasks(slug);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<DocumentationVisibility>(
    DocumentationVisibility.PRIVATE
  );
  const [status, setStatus] = useState<DocumentationStatus>(DocumentationStatus.DRAFT);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (documentation) {
      setTitle(documentation.title);
      setContent(documentation.content);
      setVisibility(documentation.visibility);
      setStatus(documentation.status);
      setHasChanges(false);
    }
  }, [documentation]);

  const handleContentChange = useCallback((value?: string) => {
    setContent(value || '');
    setHasChanges(true);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as DocumentationStatus);
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    try {
      await titleSchema.validate(title.trim());
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        toast.error(t(validationError.message));
      }
      return;
    }

    const result = await asyncWithToast(
      () => updateDocumentation({ title: title.trim(), content, visibility, status }),
      t('oscrat.ui.documentation.saved'),
      t('error')
    );
    if (result) setHasChanges(false);
  };

  const handleDelete = async () => {
    const result = await asyncWithToast(
      () => deleteDocumentation(),
      t('oscrat.ui.documentation.deleted'),
      t('error')
    );
    if (result !== null) router.push(`/teams/${slug}/documentation`);
  };

  const handleArchive = async () => {
    const result = await asyncWithToast(
      () => updateDocumentation({ status: DocumentationStatus.ARCHIVED }),
      t('oscrat.ui.documentation.archived'),
      t('error')
    );
    if (result) setStatus(DocumentationStatus.ARCHIVED);
  };


  if (isLoading) {
    return <Loading />;
  }

  if (!documentation) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('oscrat.ui.documentation.not-found')}
      </div>
    );
  }

  const isArchived = status === DocumentationStatus.ARCHIVED;
  const canEdit = canAccess('documentation', ['update']) && !isArchived;

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      <DeleteDocumentationModal
        visible={showDeleteModal}
        setVisible={setShowDeleteModal}
        documentation={documentation}
        onConfirm={handleDelete}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{documentation.title}</h1>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
            {documentation.productName && (
              <span>
                {t('product')}: {documentation.productName}
              </span>
            )}
            {documentation.versionName && (
              <span>
                {t('version')}: {documentation.versionName}
              </span>
            )}
            <span>{t('oscrat.ui.documentation.doc-version')}: {documentation.version}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && hasChanges && (
            <Button
              color="primary"
              size="sm"
              onClick={handleSave}
              loading={isUpdating}
            >
              {t('save-changes')}
            </Button>
          )}
          {canEdit && !isArchived && (
            <Button
              color="warning"
              size="sm"
              variant="outline"
              onClick={handleArchive}
            >
              {t('oscrat.ui.documentation.archive.action')}
            </Button>
          )}
          {canAccess('documentation', ['delete']) && (
            <Button
              color="error"
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
            >
              {t('delete')}
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InputWithLabel
          name="title"
          label={t('title')}
          value={title}
          onChange={handleTitleChange}
          disabled={!canEdit}
          required
        />

        <SelectWithLabel
          name="status"
          label={t('status')}
          value={status}
          onChange={handleStatusChange}
          disabled={!canEdit || isArchived}
          options={[
            { value: DocumentationStatus.DRAFT, label: t('oscrat.ui.documentation.status.draft') },
            { value: DocumentationStatus.PUBLISHED, label: t('oscrat.ui.documentation.status.published') },
            ...(isArchived ? [{ value: DocumentationStatus.ARCHIVED, label: t('oscrat.ui.documentation.status.archived') }] : []),
          ]}
        />

        {status === DocumentationStatus.PUBLISHED && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('visibility')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={visibility === DocumentationVisibility.PUBLIC}
                onChange={(e) => {
                  setVisibility(
                    e.target.checked
                      ? DocumentationVisibility.PUBLIC
                      : DocumentationVisibility.PRIVATE
                  );
                  setHasChanges(true);
                }}
                disabled={!canEdit}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="public" className="text-sm">
                {t('oscrat.ui.documentation.visibility.public-checkbox')}
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {visibility === DocumentationVisibility.PUBLIC
                ? t('oscrat.ui.documentation.visibility.public-hint')
                : t('oscrat.ui.documentation.visibility.private-hint')}
            </p>
          </div>
        )}
      </div>

      {/* Public URL Display */}
      {visibility === DocumentationVisibility.PUBLIC &&
        status === DocumentationStatus.PUBLISHED && (
          <PublicUrlDisplay
            slug={slug}
            docSlug={documentation.slug}
            productId={documentation.productId}
            versionId={documentation.versionId}
          />
        )}

      {/* Editor */}
      <div data-color-mode="light">
        <label className="mb-2 block text-sm font-medium">{t('content')}</label>
        {isArchived ? (
          <div className="prose max-w-none rounded-md border p-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <MDEditor
            value={content}
            onChange={handleContentChange}
            height={500}
            preview={canEdit ? 'live' : 'preview'}
          />
        )}
      </div>

      {/* Linked Tasks Section */}
      <LinkedTasksSection
        slug={slug}
        linkedTasks={documentation.linkedTasks}
        availableTasks={tasks}
        canEdit={canEdit}
        isPublic={
          visibility === DocumentationVisibility.PUBLIC &&
          status === DocumentationStatus.PUBLISHED
        }
        team={team}
        defaultProductId={documentation.productId || undefined}
        defaultVersionId={documentation.versionId || undefined}
        onLinkTask={linkToTask}
        onUnlinkTask={unlinkFromTask}
        isLinking={isLinkingTask}
        isUnlinking={isUnlinkingTask}
      />
    </div>
  );
};

export default DocumentationEditor;

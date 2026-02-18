import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useDocumentationDetail } from '@/hooks/useDocumentation';
import useCanAccess from '@/hooks/useCanAccess';
import useTasks from '@/hooks/useTasks';
import { useTeamContext } from '@/context/TeamContext';
import { Loading } from '@/components/shared';
import { DocumentationStatus, DocumentationVisibility } from '@oscrat/model';
import { asyncWithToast } from '@/lib/utils';
import { titleSchema } from '@/lib/validation/inputs';
import DocumentationEditorView from './DocumentationEditorView';

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (documentation) {
      setTitle(documentation.title);
      setContent(documentation.content);
      setVisibility(documentation.visibility);
      setStatus(documentation.status);
      setHasChanges(false);
      setIsInitialized(true);
    }
  }, [documentation]);

  const handleContentChange = useCallback((value?: string) => {
    setContent(value || '');
    setHasChanges(true);
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setHasChanges(true);
    },
    []
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatus(e.target.value as DocumentationStatus);
      setHasChanges(true);
    },
    []
  );

  const handleVisibilityChange = useCallback(
    (newVisibility: DocumentationVisibility) => {
      setVisibility(newVisibility);
      setHasChanges(true);
    },
    []
  );

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

  if (isLoading || !isInitialized) {
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
  const isPublished = status === DocumentationStatus.PUBLISHED;
  const canManage = canAccess('documentation', ['update']) && !isArchived;
  const canEdit = canManage && !isPublished;

  return (
    <DocumentationEditorView
      documentation={documentation}
      slug={slug}
      title={title}
      content={content}
      status={status}
      visibility={visibility}
      hasChanges={hasChanges}
      canEdit={canEdit}
      canManage={canManage}
      canDelete={canAccess('documentation', ['delete'])}
      isArchived={isArchived}
      isUpdating={isUpdating}
      showDeleteModal={showDeleteModal}
      tasks={tasks}
      team={team}
      isLinkingTask={isLinkingTask}
      isUnlinkingTask={isUnlinkingTask}
      onTitleChange={handleTitleChange}
      onContentChange={handleContentChange}
      onStatusChange={handleStatusChange}
      onVisibilityChange={handleVisibilityChange}
      onSave={handleSave}
      onDelete={handleDelete}
      onArchive={handleArchive}
      onShowDeleteModal={setShowDeleteModal}
      onLinkTask={linkToTask}
      onUnlinkTask={unlinkFromTask}
    />
  );
};

export default DocumentationEditor;

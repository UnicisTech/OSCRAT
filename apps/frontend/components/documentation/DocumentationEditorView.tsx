import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shared';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import MarkdownEditor from '@/components/shared/MarkdownEditorDynamic';
import PublicUrlDisplay from './PublicUrlDisplay';
import LinkedTasksSection from './LinkedTasksSection';
import DeleteDocumentationModal from './DeleteDocumentationModal';
import { DocumentationStatus, DocumentationVisibility } from '@oscrat/model';
import type { TeamDetail } from '@oscrat/model';

interface DocumentationEditorViewProps {
  documentation: {
    title: string;
    productName?: string | null;
    versionName?: string | null;
    version: number;
    slug: string;
    productId?: string | null;
    versionId?: string | null;
    linkedTasks?: any[];
  };
  slug: string;
  title: string;
  content: string;
  editorKey: number;
  status: DocumentationStatus;
  visibility: DocumentationVisibility;
  hasChanges: boolean;
  canEdit: boolean;
  canManage: boolean;
  canDelete: boolean;
  isArchived: boolean;
  isUpdating: boolean;
  showDeleteModal: boolean;
  tasks: any[] | undefined;
  team: TeamDetail | undefined;
  isLinkingTask: boolean;
  isUnlinkingTask: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (value?: string) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onVisibilityChange: (visibility: DocumentationVisibility) => void;
  onSave: () => void;
  onUndo: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onShowDeleteModal: (show: boolean) => void;
  onLinkTask: (taskId: number) => Promise<unknown>;
  onUnlinkTask: (taskId: number) => Promise<unknown>;
}

const DocumentationEditorView: React.FC<DocumentationEditorViewProps> = ({
  documentation,
  slug,
  title,
  content,
  editorKey,
  status,
  visibility,
  hasChanges,
  canEdit,
  canManage,
  canDelete,
  isArchived,
  isUpdating,
  showDeleteModal,
  tasks,
  team,
  isLinkingTask,
  isUnlinkingTask,
  onTitleChange,
  onContentChange,
  onStatusChange,
  onVisibilityChange,
  onSave,
  onUndo,
  onDelete,
  onArchive,
  onShowDeleteModal,
  onLinkTask,
  onUnlinkTask,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      <DeleteDocumentationModal
        visible={showDeleteModal}
        setVisible={onShowDeleteModal}
        documentation={documentation as any}
        onConfirm={onDelete}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{documentation.title}</h1>
          <div className="text-content-muted mt-1 flex items-center gap-4 text-sm">
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
            <span>
              {t('oscrat.ui.documentation.doc-version')}:{' '}
              {documentation.version}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {canManage && hasChanges && (
            <>
              <Button
                variant="tertiary"
                size="m"
                onClick={onUndo}
                disabled={isUpdating}
              >
                {t('undo')}
              </Button>
              <Button
                variant="primary"
                size="m"
                onClick={onSave}
                loading={isUpdating}
              >
                {t('save-changes')}
              </Button>
            </>
          )}
          {canManage && !isArchived && (
            <Button variant="secondary" size="m" onClick={onArchive}>
              {t('oscrat.ui.documentation.archive.action')}
            </Button>
          )}
          {canDelete && (
            <Button
              tone="danger"
              variant="secondary"
              size="m"
              onClick={() => onShowDeleteModal(true)}
            >
              {t('delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InputWithLabel
          name="title"
          label={t('title')}
          value={title}
          onChange={onTitleChange}
          disabled={!canEdit}
          required
        />

        <SelectWithLabel
          name="status"
          label={t('status')}
          value={status}
          onChange={onStatusChange}
          disabled={!canManage || isArchived}
          options={[
            {
              value: DocumentationStatus.DRAFT,
              label: t('oscrat.ui.documentation.status.draft'),
            },
            {
              value: DocumentationStatus.PUBLISHED,
              label: t('oscrat.ui.documentation.status.published'),
            },
            ...(isArchived
              ? [
                  {
                    value: DocumentationStatus.ARCHIVED,
                    label: t('oscrat.ui.documentation.status.archived'),
                  },
                ]
              : []),
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
                  onVisibilityChange(
                    e.target.checked
                      ? DocumentationVisibility.PUBLIC
                      : DocumentationVisibility.PRIVATE
                  );
                }}
                disabled={!canManage}
                className="border-line h-4 w-4 rounded"
              />
              <label htmlFor="public" className="text-sm">
                {t('oscrat.ui.documentation.visibility.public-checkbox')}
              </label>
            </div>
            <p className="text-content-muted mt-1 text-xs">
              {visibility === DocumentationVisibility.PUBLIC
                ? t('oscrat.ui.documentation.visibility.public-hint')
                : t('oscrat.ui.documentation.visibility.private-hint')}
            </p>
          </div>
        )}
      </div>

      {visibility === DocumentationVisibility.PUBLIC &&
        status === DocumentationStatus.PUBLISHED && (
          <PublicUrlDisplay
            slug={slug}
            docSlug={documentation.slug}
            productId={documentation.productId}
            versionId={documentation.versionId}
          />
        )}

      <div>
        <label className="mb-2 block text-sm font-medium">{t('content')}</label>
        {canEdit ? (
          <div className="border-line-subtle rounded-card max-h-[600px] overflow-y-auto border">
            <MarkdownEditor
              key={editorKey}
              markdown={content}
              onChange={(value) => onContentChange(value)}
              minHeight={500}
            />
          </div>
        ) : (
          <div className="border-line-subtle bg-surface-muted rounded-card max-h-[600px] overflow-y-auto border opacity-75">
            <MarkdownEditor
              key={editorKey}
              markdown={content}
              readOnly
              minHeight={400}
            />
          </div>
        )}
      </div>

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
        onLinkTask={onLinkTask}
        onUnlinkTask={onUnlinkTask}
        isLinking={isLinkingTask}
        isUnlinking={isUnlinkingTask}
      />
    </div>
  );
};

export default DocumentationEditorView;

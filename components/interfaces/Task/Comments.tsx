import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import type { TaskExtended } from 'types';
import { IssuePanelContainer } from 'sharedStyles';
import Comment from './comments/Comment';
import CreateCommentForm from './comments/CreateCommentForm';
import { AccessControl } from '@/components/shared/AccessControl';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useComments } from '@/hooks/useComments';
import { extractErrorMessage } from '@/lib/utils';

interface FormData {
  text: string;
}

export default function Comments({ task }: { task: TaskExtended }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug, taskNumber } = router.query;
  const [commentToEdit, setCommentToEdit] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { createComment, updateComment, deleteComment } = useComments(
    slug as string,
    taskNumber as string
  );

  const onDeleteClick = useCallback((id: number) => {
    setCommentToDelete(id);
    setConfirmationDialogVisible(true);
  }, []);

  const handleCreateComment = useCallback(
    async (
      text: string,
      reset: (initialValues?: Partial<FormData> | undefined) => void
    ) => {
      try {
        await createComment({ text });
        reset({ text: '' });
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, t('error.comment-create-failed'))
        );
      }
    },
    [createComment, t]
  );

  const handleUpdateComment = useCallback(
    async (text: string, id: number) => {
      try {
        await updateComment({ id: id.toString(), text });
        setCommentToEdit(null);
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, t('error.comment-update-failed'))
        );
      }
    },
    [updateComment, t]
  );

  const handleDeleteComment = useCallback(
    async (id: number | null) => {
      if (!id) return;

      try {
        await deleteComment(id.toString());
        setConfirmationDialogVisible(false);
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, t('error.comment-delete-failed'))
        );
      }
    },
    [deleteComment, t]
  );

  return (
    <IssuePanelContainer>
      <div style={{ marginTop: '30px' }}>
        {task.comments
          .sort(
            (a, b) =>
              Date.parse(a.createdAt as any) - Date.parse(b.createdAt as any)
          )
          .map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              commentToEdit={commentToEdit}
              setCommentToEdit={setCommentToEdit}
              updateComment={handleUpdateComment}
              deleteComment={onDeleteClick}
            />
          ))}
      </div>
      <AccessControl resource="task" actions={['update']}>
        <CreateCommentForm handleCreate={handleCreateComment} />
      </AccessControl>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => handleDeleteComment(commentToDelete)}
        title={t('confirm-delete-comment')}
      >
        {t('delete-comment-warning')}
      </ConfirmationDialog>
    </IssuePanelContainer>
  );
}

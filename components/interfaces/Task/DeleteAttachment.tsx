import React, { useCallback, MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import type { Attachment } from 'types';
import { useAttachments } from '@/hooks/useAttachments';
import { extractErrorMessage } from '@/lib/utils';

const DeleteAttachment = ({
  visible,
  setVisible,
  taskNumber,
  teamSlug,
  attachment,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  taskNumber: string;
  teamSlug: string;
  attachment: Attachment;
}) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const { deleteAttachment } = useAttachments(teamSlug, taskNumber);

  const deleteHandler = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      setIsLoading(true);

      try {
        await deleteAttachment(attachment.id);
        toast.success(t('attachment-deleted'));
        setIsLoading(false);
        setVisible(false);
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('attachment-delete-error')));
        setIsLoading(false);
      }
    },
    [deleteAttachment, attachment.id, setVisible, t]
  );

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">
        {t('attachment-delete')}
      </Modal.Header>
      <Modal.Body>
        <div className="mt-2 flex flex-col space-y-4">
          <p>Attachment will be deleted.</p>
        </div>
      </Modal.Body>
      <Modal.Actions>
        <Button color="error" onClick={deleteHandler} loading={isLoading}>
          {t('delete')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t('close')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default DeleteAttachment;

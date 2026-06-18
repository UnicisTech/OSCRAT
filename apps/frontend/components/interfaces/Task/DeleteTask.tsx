import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import { useTask } from 'hooks/useTask';
import { Button } from '@/components/shared';
import Modal from '@/components/shared/Modal';

const DeleteTask = ({
  taskNumber,
  visible,
  setVisible,
  teamSlug,
}: {
  taskNumber: null | number;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  teamSlug: string;
}) => {
  const { t } = useTranslation('common');
  const { deleteTask } = useTask(teamSlug, taskNumber?.toString() || '');

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: async () => {
      try {
        await deleteTask();
        toast.success(t('task-deleted'));
        formik.resetForm();
        setVisible(false);
      } catch (err: any) {
        toast.error(err.message || t('error-deleting-task'));
      }
    },
  });

  return (
    <Modal open={visible} close={() => setVisible(false)} size="sm">
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>{`Delete task`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('delete-task-warning')}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            tone="danger"
            variant="primary"
            loading={formik.isSubmitting}
          >
            {t('delete')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default DeleteTask;

import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import { useTask } from 'hooks/useTask';

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
      name: "",
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
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">{`Delete task`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t("delete-task-warning")}</p>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="error"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            {t("delete")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t("close")}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default DeleteTask;

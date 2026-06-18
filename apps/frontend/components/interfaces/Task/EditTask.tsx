import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import Button from '@/components/button';
import { useTranslation } from 'next-i18next';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import type { Task, Team } from '@oscrat/model';
import { TaskStatus } from '@oscrat/model';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import { useTask } from 'hooks/useTask';
import { useFormik } from 'formik';
import {
  createTaskUpdateSchema,
  type TaskUpdateData,
} from '@/lib/validation/task';
import { resolveTaskTitle } from '@/lib/tasks';
import type { ApiError } from '@/types';

const EditTask = ({
  visible,
  setVisible,
  task,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task;
  team: Team;
}) => {
  const { t, ready } = useTranslation('common');
  const { updateTask } = useTask(team.slug, task.taskNumber.toString());
  const validationSchema = useMemo(() => createTaskUpdateSchema(), []);

  const initialValues: TaskUpdateData = useMemo(
    () => ({
      title: resolveTaskTitle(task, t),
      status: task?.status || '',
      duedate: task?.duedate ? new Date(task.duedate) : undefined,
      description: task?.description || '',
    }),
    [task, t]
  );

  const formik = useFormik<TaskUpdateData>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const updateData: TaskUpdateData = {
          title: values.title?.trim(),
          status: values.status,
          duedate: values.duedate,
          description: values.description?.trim() || '',
        };

        await updateTask(updateData);
        toast.success(t('task-updated'));
        setVisible(false);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : undefined;
    formik.setFieldValue('duedate', dateValue);
  };

  const handleClose = () => {
    formik.resetForm();
    setVisible(false);
  };

  if (!ready) return null;

  return (
    <Modal open={visible} close={handleClose}>
      <Modal.Header>
        {t('edit-task')}
        <span className="text-content-muted ml-2">#{task.taskNumber}</span>
      </Modal.Header>

      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Body>
          <div className="space-y-4">
            <InputWithLabel
              name="title"
              label={t('title')}
              value={formik.values.title || ''}
              onChange={formik.handleChange}
              error={formik.errors.title ? t(formik.errors.title) : undefined}
              required
              placeholder={t('task-title-placeholder')}
            />

            <SelectWithLabel
              name="status"
              label={t('status')}
              value={formik.values.status || ''}
              onChange={formik.handleChange}
              options={Object.values(TaskStatus).map((status) => ({
                value: status,
                label: t(getTaskStatusTranslationKey(status)),
              }))}
              error={formik.errors.status ? t(formik.errors.status) : undefined}
              required
            />

            <InputWithLabel
              type="date"
              name="duedate"
              label={t('due-date')}
              value={
                formik.values.duedate instanceof Date
                  ? formik.values.duedate.toISOString().split('T')[0]
                  : ''
              }
              onChange={handleDateChange}
              error={
                formik.errors.duedate ? t(formik.errors.duedate) : undefined
              }
              required
            />

            <div className="w-full">
              <label
                htmlFor="description"
                className="text-content-secondary mb-2 block text-sm font-medium"
              >
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description || ''}
                onChange={formik.handleChange}
                rows={4}
                className="border-line text-content-secondary placeholder-content-placeholder shadow-2 focus:border-primary focus:ring-primary rounded-input w-full border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2"
                placeholder={t('task-description-placeholder')}
              />
              {formik.errors.description && (
                <p className="text-danger mt-1 text-sm">
                  {t(formik.errors.description)}
                </p>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={formik.isSubmitting}
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {t('save-changes')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditTask;

import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import type { Task, Team } from '@oscrat/model';
import statuses from '@/components/defaultLanding/data/statuses.json';
import { useTask } from 'hooks/useTask';
import { useFormik } from 'formik';
import { taskUpdateSchema, type TaskUpdateData } from '@/lib/validation/task';
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
  
  const initialValues: TaskUpdateData = useMemo(() => ({
    title: task?.title || '',
    status: task?.status || '',
    duedate: task?.duedate ? new Date(task.duedate) : undefined,
    description: task?.description || '',
  }), [task]);
  
  const formik = useFormik<TaskUpdateData>({
    initialValues,
    validationSchema: taskUpdateSchema,
    enableReinitialize: true,
    validateOnBlur: false,
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
      <Modal.Header>{t('edit-task')}</Modal.Header>
      
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
              options={statuses.map(status => ({
                value: status.value,
                label: status.label,
              }))}
              error={formik.errors.status ? t(formik.errors.status) : undefined}
              required
            />
            
            <InputWithLabel
              type="date"
              name="duedate"
              label={t('due-date')}
              value={formik.values.duedate instanceof Date ? formik.values.duedate.toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              error={formik.errors.duedate ? t(formik.errors.duedate) : undefined}
              required
            />
            
            <div className="w-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description || ''}
                onChange={formik.handleChange}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('task-description-placeholder')}
              />
              {formik.errors.description && (
                <p className="mt-1 text-sm text-red-600">{t(formik.errors.description)}</p>
              )}
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={formik.isSubmitting}
            className="text-gray-800 border-gray-300 hover:bg-gray-50"
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 border-0"
          >
            {t('save-changes')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditTask;

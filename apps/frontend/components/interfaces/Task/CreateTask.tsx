import React, { useMemo } from 'react';
import { Team, TaskStatus } from '@oscrat/model';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import { DEFAULT_TASK_STATUS, getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import { getCurrentStringDate } from '@/utils/dateFormat';
import useTasks from '@/hooks/useTasks';
import { useFormik } from 'formik';
import { createTaskCreateSchema, type TaskCreateData } from '@/lib/validation/task';
import type { ApiError } from '@/types';
import { useSearchProducts } from '@/lib/api/hooks/oscrat/projects';

interface CreateTaskProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
  defaultProductId?: string;
  defaultVersionId?: string;
  onSuccess?: (taskId: number) => void;
}

const CreateTask = ({
  visible,
  setVisible,
  team,
  defaultProductId,
  defaultVersionId,
  onSuccess,
}: CreateTaskProps) => {
  const { t, ready } = useTranslation('common');
  const { createTask, tasks: existingTasks } = useTasks(team.slug);
  const { data: products } = useSearchProducts(team.slug, { includeVersions: true });

  const validationSchema = useMemo(
    () => createTaskCreateSchema(existingTasks),
    [existingTasks]
  );
  
  const initialValues: TaskCreateData = {
    title: '',
    status: DEFAULT_TASK_STATUS,
    duedate: new Date(getCurrentStringDate()),
    description: '',
    productId: defaultProductId || '',
    versionId: defaultVersionId || '',
  };
  
  const formik = useFormik<TaskCreateData>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const result = await createTask({
          title: values.title.trim(),
          status: values.status as TaskStatus,
          duedate: values.duedate,
          description: values.description?.trim() || '',
          productId: values.productId || undefined,
          versionId: values.versionId || undefined,
        });
        
        toast.success(t('task-created'));
        formik.resetForm();
        setVisible(false);
        
        // Call onSuccess callback if provided (e.g., to link task to documentation)
        if (onSuccess && result?.id) {
          onSuccess(result.id);
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const availableVersions = useMemo(() => {
    if (!formik.values.productId || !products) return [];
    const selectedProduct = products.find(p => p.id === formik.values.productId);
    return selectedProduct?.versions || [];
  }, [formik.values.productId, products]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue('productId', e.target.value);
    formik.setFieldValue('versionId', '');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : new Date();
    formik.setFieldValue('duedate', dateValue);
  };

  const handleClose = () => {
    formik.resetForm();
    setVisible(false);
  };

  if (!ready) return null;

  return (
    <Modal open={visible} close={handleClose}>
      <Modal.Header>{t('create-task')}</Modal.Header>
      
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Body>
          <div className="space-y-4">
            <InputWithLabel
              name="title"
              label={t('title')}
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.errors.title ? t(formik.errors.title) : undefined}
              required
              placeholder={t('task-title-placeholder')}
            />
            
            <SelectWithLabel
              name="status"
              label={t('status')}
              value={formik.values.status}
              onChange={formik.handleChange}
              options={Object.values(TaskStatus).map(status => ({
                value: status,
                label: t(getTaskStatusTranslationKey(status)),
              }))}
              error={formik.errors.status ? t(formik.errors.status) : undefined}
              required
            />
            
            <SelectWithLabel
              name="productId"
              label={t('product')}
              value={formik.values.productId || ''}
              onChange={handleProductChange}
              disabled={!!defaultProductId}
              options={[
                { value: '', label: t('oscrat.ui.no-product') },
                ...(products?.map(product => ({
                  value: product.id,
                  label: product.name,
                })) || [])
              ]}
            />
            
            {formik.values.productId && (
              <SelectWithLabel
                name="versionId"
                label={t('version')}
                value={formik.values.versionId || ''}
                onChange={formik.handleChange}
                disabled={!!defaultVersionId}
                options={[
                  { value: '', label: t('oscrat.ui.no-version') },
                  ...availableVersions.map(version => ({
                    value: version.id,
                    label: version.version,
                  }))
                ]}
              />
            )}
            
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
            {t('create')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateTask;

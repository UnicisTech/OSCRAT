import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { CogIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import type { Task, Team } from '@oscrat/model';
import { TaskStatus } from '@oscrat/model';
import { useTask } from '@/hooks/useTask';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import { useFormik } from 'formik';
import { createTaskUpdateSchema } from '@/lib/validation/task';
import type { UpdateTaskData } from '@/lib/api/endpoints/tasks';
import type { ApiError } from '@/types';

interface TaskDetailsFormProps {
  task: Task;
  team: Team;
}

const TaskDetailsForm: React.FC<TaskDetailsFormProps> = ({ task, team }) => {
  const { t } = useTranslation('common');
  const { updateTask } = useTask(team.slug, task.taskNumber.toString());
  
  const { members } = useTeamMembers(team.slug);
  const { project: product } = useOscratProject(
    team.slug,
    task.productId || '',
    { enabled: !!task.productId }
  );
  
  const { version } = useOscratVersion(
    team.slug,
    task.productId || '',
    task.versionId || '',
    { enabled: !!task.productId && !!task.versionId }
  );

  const validationSchema = useMemo(() => createTaskUpdateSchema(), []);

  const initialValues: UpdateTaskData = useMemo(() => ({
    title: task?.title || '',
    status: task?.status,
    duedate: task?.duedate ? new Date(task.duedate) : undefined,
    description: task?.description || '',
    assigneeId: task?.assigneeId || null,
  }), [task]);
  
  const formik = useFormik<UpdateTaskData>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await updateTask({
          title: values.title,
          status: values.status,
          duedate: values.duedate,
          description: values.description,
          assigneeId: values.assigneeId,
        });
        toast.success(t('task-updated-successfully'));
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const handleInputChange = (field: keyof UpdateTaskData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    
    if (field === 'duedate') {
      const dateValue = newValue ? new Date(newValue) : undefined;
      formik.setFieldValue(field, dateValue);

      if (dateValue && dateValue < new Date()) {
        formik.setFieldError(field, 'oscrat.ui.validation.task-due-date-past');
        toast.error(t('oscrat.ui.validation.task-due-date-past'));
        formik.setFieldValue(field, new Date());
        return;
      }
    } else if (field === 'assigneeId') {
      const assigneeValue = newValue || null;
      formik.setFieldValue(field, assigneeValue);
    } else {
      formik.setFieldValue(field, newValue);
    }
  };

  const renderField = (
    field: keyof UpdateTaskData,
    label: string,
    type: 'input' | 'select' | 'textarea' = 'input',
    options: Array<{ value: string; label: string }> = [],
    disabled = false
  ) => {
    const fieldValue = formik.values[field];
    const fieldError = formik.errors[field];
    
    const displayValue = field === 'duedate' && fieldValue instanceof Date 
      ? fieldValue.toISOString().split('T')[0] 
      : fieldValue || '';
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        
        {type === 'input' && (
          <>
            <input
              name={field}
              value={displayValue as string}
              onChange={handleInputChange(field)}
              type={field === 'duedate' ? 'date' : 'text'}
              disabled={disabled || formik.isSubmitting}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
                fieldError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{t(fieldError)}</p>
            )}
          </>
        )}
        
        {type === 'select' && (
          <>
            <select
              name={field}
              value={displayValue as string}
              onChange={handleInputChange(field)}
              disabled={disabled || formik.isSubmitting}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
                fieldError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{t(fieldError)}</p>
            )}
          </>
        )}
        
        {type === 'textarea' && (
          <>
            <textarea
              name={field}
              value={displayValue as string}
              onChange={handleInputChange(field)}
              rows={3}
              disabled={disabled || formik.isSubmitting}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 resize-none ${
                fieldError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder={`${t('enter')} ${label.toLowerCase()}...`}
            />
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{t(fieldError)}</p>
            )}
          </>
        )}
      </div>
    );
  };

  const isAutomatic = task.originType === 'AUTOMATIC';
  const OriginIcon = isAutomatic ? CogIcon : HandRaisedIcon;
  const originLabel = isAutomatic ? t('oscrat.ui.task-origin-automatic') : t('oscrat.ui.task-origin-manual');
  const originBadgeClass = isAutomatic 
    ? 'bg-blue-100 text-blue-700 border-blue-200' 
    : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('task-details')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('title', t('task-name'))}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('origin')}</label>
            <div className={`w-full rounded-md border px-3 py-2 flex items-center gap-2 ${originBadgeClass}`}>
              <OriginIcon className="h-4 w-4" />
              <span className="font-medium">{originLabel}</span>
            </div>
          </div>
          
          {!task.productId && !task.versionId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('team')}</label>
              <input
                type="text"
                value={team.name}
                readOnly
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 cursor-not-allowed"
              />
            </div>
          )}
          
          {task.productId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('product')}</label>
              <input
                type="text"
                value={product?.name || '—'}
                readOnly
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 cursor-not-allowed"
              />
            </div>
          )}
          
          {task.versionId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('version')}</label>
              <input
                type="text"
                value={version?.version || '—'}
                readOnly
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 cursor-not-allowed"
              />
            </div>
          )}
          {renderField('duedate', t('due-date'))}
          {renderField('status', t('status'), 'select', Object.values(TaskStatus).map(s => ({ 
            value: s, 
            label: t(getTaskStatusTranslationKey(s))
           })))}
          
          {renderField('assigneeId', t('assignee'), 'select', [
            { value: '', label: t('unassigned') },
            ...(members?.map(member => ({
              value: member.userId,
              label: member.user.name
            })) || [])
          ])}
          
          <div className="lg:col-span-3">
            {renderField('description', t('description'), 'textarea')}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
          <button
            type="submit"
            disabled={formik.isSubmitting || !formik.dirty}
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {formik.isSubmitting ? t('oscrat.ui.saving') : t('oscrat.ui.save-changes')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskDetailsForm;

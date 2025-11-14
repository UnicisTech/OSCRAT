import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { taskUpdateSchema } from '@/lib/validation/task';
import type { UpdateTaskData } from '@/lib/api/endpoints/tasks';
import type { ApiError } from '@/types';

interface TaskDetailsFormProps {
  task: Task;
  team: Team;
}

const TaskDetailsForm: React.FC<TaskDetailsFormProps> = ({ task, team }) => {
  const { t } = useTranslation('common');
  const { updateTask } = useTask(team.slug, task.taskNumber.toString());
  
  // Fetch team members for assignee dropdown
  const { members } = useTeamMembers(team.slug);
  
  // Fetch product and version data if available
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
  
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});
  const debounceTimers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  
  const initialValues: UpdateTaskData = useMemo(() => ({
    title: task?.title || '',
    status: task?.status,
    duedate: task?.duedate ? new Date(task.duedate) : undefined,
    description: task?.description || '',
    assigneeId: task?.assigneeId || null,
  }), [task]);
  
  const [lastSavedValues, setLastSavedValues] = useState<UpdateTaskData>(initialValues);
  
  const formik = useFormik<UpdateTaskData>({
    initialValues,
    validationSchema: taskUpdateSchema,
    enableReinitialize: true,
    validateOnBlur: false,
    onSubmit: async () => {
      // Not used since we use debounced auto-save
    },
  });

  // Initialize lastSavedValues when task changes
  useEffect(() => {
    setLastSavedValues(initialValues);
  }, [initialValues]);


  // Debounced save function with Formik integration
  const debouncedSave = useCallback(async (field: keyof UpdateTaskData, value: UpdateTaskData[keyof UpdateTaskData]) => {
    // Clear any existing timer for this field
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }

    // Set new timer, don't set saving state until we actually start saving
    debounceTimers.current[field] = setTimeout(async () => {
      // Set saving state only when we actually start saving
      setIsSaving(prev => ({ ...prev, [field]: true }));
      
      try {
        const updateData: UpdateTaskData = {
          [field]: value
        };

        await updateTask(updateData);
        // Update the last saved value
        setLastSavedValues(prev => ({ ...prev, [field]: value }));
        toast.success(t('field-updated-successfully'));
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
        formik.setFieldValue(field, lastSavedValues[field]);
      } finally {
        setIsSaving(prev => ({ ...prev, [field]: false }));
      }
    }, 1000);
  }, [updateTask, formik, lastSavedValues, t]);

  const handleInputChange = (field: keyof UpdateTaskData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    
    // Handle date field specially
    if (field === 'duedate') {
      const dateValue = newValue ? new Date(newValue) : undefined;
      formik.setFieldValue(field, dateValue);

       // Don't allow to set date in the past and set error
       if (dateValue && dateValue < new Date()) {
         formik.setFieldError(field, 'oscrat.ui.validation.task-due-date-past');
         toast.error(t('oscrat.ui.validation.task-due-date-past'));
         formik.setFieldValue(field, new Date());
         return;
       }
      
      // Only trigger save if value has actually changed from last saved value
      if (dateValue !== lastSavedValues[field]) {
        debouncedSave(field, dateValue);
      }
    } else if (field === 'assigneeId') {
      // Handle assigneeId - convert empty string to null
      const assigneeValue = newValue || null;
      formik.setFieldValue(field, assigneeValue);
      
      // Only trigger save if value has actually changed from last saved value
      if (assigneeValue !== lastSavedValues[field]) {
        debouncedSave(field, assigneeValue);
      }
    } else {
      formik.setFieldValue(field, newValue);
      
      // Only trigger save if value has actually changed from last saved value
      if (newValue !== lastSavedValues[field]) {
        debouncedSave(field, newValue);
      }
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const renderField = (
    field: keyof UpdateTaskData,
    label: string,
    type: 'input' | 'select' | 'textarea' = 'input',
    options: Array<{ value: string; label: string }> = [],
    disabled = false
  ) => {
    const isFieldSaving = isSaving[field];
    const fieldValue = formik.values[field];
    const fieldError = formik.errors[field];
    
    const displayValue = field === 'duedate' && fieldValue instanceof Date 
      ? fieldValue.toISOString().split('T')[0] 
      : fieldValue || '';
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {isFieldSaving && (
            <div className="flex items-center text-xs text-gray-500">
              <div className="animate-spin mr-1 h-3 w-3 border border-gray-300 border-t-blue-500 rounded-full"></div>
              {t('oscrat.ui.messages.saving')}
            </div>
          )}
        </div>
        
        {type === 'input' && (
          <>
            <input
              name={field}
              value={displayValue as string}
              onChange={handleInputChange(field)}
              type={field === 'duedate' ? 'date' : 'text'}
              disabled={disabled || isFieldSaving}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
                isFieldSaving ? 'bg-blue-50 border-blue-300' : ''
              } ${
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
              disabled={disabled || isFieldSaving}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
                isFieldSaving ? 'bg-blue-50 border-blue-300' : ''
              } ${
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
              disabled={disabled || isFieldSaving}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 resize-none ${
                isFieldSaving ? 'bg-blue-50 border-blue-300' : ''
              } ${
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('task-details')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First Row */}
        {renderField('title', t('task-name'))}
        
        {/* Origin Type - Read Only */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('origin')}</label>
          <div className={`w-full rounded-md border px-3 py-2 flex items-center gap-2 ${originBadgeClass}`}>
            <OriginIcon className="h-4 w-4" />
            <span className="font-medium">{originLabel}</span>
          </div>
        </div>
        
        {/* Show team only if no product/version */}
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
        
        {/* Show product if available */}
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
        
        {/* Show version if available */}
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
        
        {/* Assignee field */}
        {renderField('assigneeId', t('assignee'), 'select', [
          { value: '', label: t('unassigned') },
          ...(members?.map(member => ({
            value: member.userId,
            label: member.user.name
          })) || [])
        ])}
        
        {/* Third Row - Description spans full width */}
        <div className="lg:col-span-3">
          {renderField('description', t('description'), 'textarea')}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsForm;

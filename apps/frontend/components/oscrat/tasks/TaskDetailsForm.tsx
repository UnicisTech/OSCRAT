import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import type { Task, Team } from '@oscrat/model';
import { useTask } from '@/hooks/useTask';
import statuses from '@/components/defaultLanding/data/statuses.json';
import { useFormik } from 'formik';
import { taskUpdateSchema, type TaskUpdateData } from '@/lib/validation/task';
import type { ApiError } from '@/types';

interface TaskDetailsFormProps {
  task: Task;
  team: Team;
}

// TODO: Update this once the DB is updated
interface ExtendedFormData extends TaskUpdateData {
  product?: string;
  version?: string;
  section?: string;
  assignee?: string;
}

// Mock options - replace with actual data when available
const mockProducts = [
  { value: 'product-1', label: 'Product Alpha' },
  { value: 'product-2', label: 'Product Beta' },
  { value: 'product-3', label: 'Product Gamma' },
];

const mockVersions = [
  { value: 'v1.0.0', label: 'v1.0.0' },
  { value: 'v1.1.0', label: 'v1.1.0' },
  { value: 'v1.2.0', label: 'v1.2.0' },
];

const mockSections = [
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'deployment', label: 'Deployment' },
];

const mockAssignees = [
  { value: '', label: 'Unassigned' },
  { value: 'user-1', label: 'John Doe' },
  { value: 'user-2', label: 'Jane Smith' },
  { value: 'user-3', label: 'Mike Johnson' },
];

const TaskDetailsForm: React.FC<TaskDetailsFormProps> = ({ task, team }) => {
  const { t } = useTranslation('common');
  const { updateTask } = useTask(team.slug, task.taskNumber.toString());
  
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});
  const debounceTimers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  
  const initialValues: ExtendedFormData = useMemo(() => ({
    title: task?.title || '',
    status: task?.status || '',
    duedate: task?.duedate ? new Date(task.duedate) : undefined,
    description: task?.description || '',
    // Mock data for fields not yet in API
    product: 'product-1',
    version: 'v1.2.0',
    section: 'development',
    assignee: '',
  }), [task]);
  
  const [lastSavedValues, setLastSavedValues] = useState<ExtendedFormData>(initialValues);
  
  const formik = useFormik<ExtendedFormData>({
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
  const debouncedSave = useCallback(async (field: keyof ExtendedFormData, value: string | Date | undefined) => {
    // Clear any existing timer for this field
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }

    // Set new timer, don't set saving state until we actually start saving
    debounceTimers.current[field] = setTimeout(async () => {
      // Set saving state only when we actually start saving
      setIsSaving(prev => ({ ...prev, [field]: true }));
      
      try {
        // Only update fields that exist in the API, remove after DB is updated
        const apiFields = ['title', 'status', 'duedate', 'description'];
        
        if (!apiFields.includes(field as string)) {
          // For mock fields, just show success without API call
          setIsSaving(prev => ({ ...prev, [field]: false }));
          return;
        }

        const updateData: TaskUpdateData = {
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

  const handleInputChange = (field: keyof ExtendedFormData) => (
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
    field: keyof ExtendedFormData,
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
            {disabled && ['product', 'version', 'section', 'assignee'].includes(field as string) && (
              <span className="ml-1 text-xs text-gray-400">({t('oscrat.ui.messages.coming-soon')})</span>
            )}
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('task-details')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First Row */}
        {renderField('title', t('task-name'))}
        {renderField('product', t('product'), 'select', mockProducts, true)}
        {renderField('version', t('version'), 'select', mockVersions, true)}
        
        {/* Second Row */}
        {renderField('section', t('section'), 'select', mockSections, true)}
        {renderField('assignee', t('assignee'), 'select', mockAssignees, true)}
        {renderField('duedate', t('due-date'))}
        
        {/* Third Row - Status spans one column, Description spans remaining */}
        <div className="lg:col-span-1">
          {renderField('status', t('status'), 'select', statuses.map(s => ({ value: s.value, label: s.label })))}
        </div>
        
        <div className="lg:col-span-2">
          {renderField('description', t('description'), 'textarea')}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsForm;

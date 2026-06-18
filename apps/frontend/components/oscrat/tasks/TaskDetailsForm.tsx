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
import { resolveTaskTitle, resolveTaskDescription } from '@/lib/tasks';
import { useFormik } from 'formik';
import { createTaskUpdateSchema } from '@/lib/validation/task';
import type { UpdateTaskData } from '@/lib/api/endpoints/tasks';
import type { ApiError } from '@/types';
import Button from '@/components/button';

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

  const hasLocalizedTitle = !!task.titleLocId;
  const hasLocalizedDescription = !!task.descriptionLocId;

  const resolvedTitle = resolveTaskTitle(task, t);
  const resolvedDescription = resolveTaskDescription(task, t);

  const initialValues: UpdateTaskData = useMemo(
    () => ({
      title: task?.title || '',
      status: task?.status,
      duedate: task?.duedate ? new Date(task.duedate) : undefined,
      description: task?.description || '',
      assigneeId: task?.assigneeId || null,
    }),
    [task]
  );

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

  const existingProps = (task.properties || {}) as Record<string, unknown>;
  const [enableRiskAssessment, setEnableRiskAssessment] = React.useState(
    !!existingProps?.enableRiskAssessment
  );

  const handleRiskAssessmentToggle = async (checked: boolean) => {
    setEnableRiskAssessment(checked);
    try {
      await updateTask({
        properties: { ...existingProps, enableRiskAssessment: checked },
      } as any);
      toast.success(t('task-updated-successfully'));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message);
      setEnableRiskAssessment(!checked);
    }
  };

  const handleInputChange =
    (field: keyof UpdateTaskData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const newValue = e.target.value;

      if (field === 'duedate') {
        const dateValue = newValue ? new Date(newValue) : undefined;
        formik.setFieldValue(field, dateValue);

        if (dateValue && dateValue < new Date()) {
          formik.setFieldError(
            field,
            'oscrat.ui.validation.task-due-date-past'
          );
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

    const displayValue =
      field === 'duedate' && fieldValue instanceof Date
        ? fieldValue.toISOString().split('T')[0]
        : fieldValue || '';

    return (
      <div className="space-y-2">
        <label className="text-content-secondary block text-sm font-medium">
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
              className={`border-line text-content-secondary shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted disabled:text-content-muted rounded-input w-full border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${
                fieldError
                  ? 'border-danger-border focus:border-danger focus:ring-danger'
                  : ''
              }`}
            />
            {fieldError && (
              <p className="text-danger mt-1 text-sm">{t(fieldError)}</p>
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
              className={`border-line text-content-secondary shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted disabled:text-content-muted rounded-input w-full border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${
                fieldError
                  ? 'border-danger-border focus:border-danger focus:ring-danger'
                  : ''
              }`}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="text-danger mt-1 text-sm">{t(fieldError)}</p>
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
              className={`border-line text-content-secondary shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted disabled:text-content-muted rounded-input w-full resize-none border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${
                fieldError
                  ? 'border-danger-border focus:border-danger focus:ring-danger'
                  : ''
              }`}
              placeholder={`${t('enter')} ${label.toLowerCase()}...`}
            />
            {fieldError && (
              <p className="text-danger mt-1 text-sm">{t(fieldError)}</p>
            )}
          </>
        )}
      </div>
    );
  };

  const isAutomatic = task.originType === 'AUTOMATIC';
  const OriginIcon = isAutomatic ? CogIcon : HandRaisedIcon;
  const originLabel = isAutomatic
    ? t('oscrat.ui.task-origin-automatic')
    : t('oscrat.ui.task-origin-manual');
  const originBadgeClass = isAutomatic
    ? 'bg-info-subtle text-info-emphasis border-info'
    : 'bg-warning-subtle text-warning border-warning-border';

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="border-line bg-surface rounded-card border p-6">
        <h2 className="text-content mb-6 text-lg font-semibold">
          {t('task-details')}
          <span className="text-content-muted ml-2">#{task.taskNumber}</span>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasLocalizedTitle && !task.title ? (
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('task-name')}
              </label>
              <input
                value={resolvedTitle}
                readOnly
                disabled
                className="border-line-subtle bg-surface-muted text-content-secondary rounded-input w-full cursor-not-allowed border px-3 py-2"
              />
            </div>
          ) : (
            renderField('title', t('task-name'))
          )}

          <div className="space-y-2">
            <label className="text-content-secondary block text-sm font-medium">
              {t('origin')}
            </label>
            <div
              className={`rounded-input flex w-full items-center gap-2 border px-3 py-2 ${originBadgeClass}`}
            >
              <OriginIcon className="h-4 w-4" />
              <span className="font-medium">{originLabel}</span>
            </div>
          </div>

          {!task.productId && !task.versionId && (
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('team')}
              </label>
              <input
                type="text"
                value={team.name}
                readOnly
                disabled
                className="border-line-subtle bg-surface-muted text-content-secondary rounded-input w-full cursor-not-allowed border px-3 py-2"
              />
            </div>
          )}

          {task.productId && (
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('product')}
              </label>
              <input
                type="text"
                value={product?.name || '—'}
                readOnly
                disabled
                className="border-line-subtle bg-surface-muted text-content-secondary rounded-input w-full cursor-not-allowed border px-3 py-2"
              />
            </div>
          )}

          {task.versionId && (
            <div className="space-y-2">
              <label className="text-content-secondary block text-sm font-medium">
                {t('version')}
              </label>
              <input
                type="text"
                value={version?.version || '—'}
                readOnly
                disabled
                className="border-line-subtle bg-surface-muted text-content-secondary rounded-input w-full cursor-not-allowed border px-3 py-2"
              />
            </div>
          )}
          {renderField('duedate', t('due-date'))}
          {renderField(
            'status',
            t('status'),
            'select',
            Object.values(TaskStatus).map((s) => ({
              value: s,
              label: t(getTaskStatusTranslationKey(s)),
            }))
          )}

          {renderField('assigneeId', t('assignee'), 'select', [
            { value: '', label: t('unassigned') },
            ...(members?.map((member) => ({
              value: member.userId,
              label: member.user.name,
            })) || []),
          ])}

          <div className="lg:col-span-3">
            {hasLocalizedDescription && !task.description ? (
              <div className="space-y-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('description')}
                </label>
                <div className="border-line-subtle bg-surface-muted text-content-secondary rounded-input w-full whitespace-pre-line border px-3 py-3 text-sm">
                  {resolvedDescription
                    .split(/(https?:\/\/[^\s]+)/g)
                    .map((segment, i) =>
                      /^https?:\/\//.test(segment) ? (
                        <a
                          key={i}
                          href={segment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary break-all underline hover:opacity-80"
                        >
                          {segment}
                        </a>
                      ) : (
                        <React.Fragment key={i}>{segment}</React.Fragment>
                      )
                    )}
                </div>
              </div>
            ) : (
              renderField('description', t('description'), 'textarea')
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="enableRiskAssessment"
              checked={enableRiskAssessment}
              onChange={(e) => handleRiskAssessmentToggle(e.target.checked)}
              disabled={formik.isSubmitting}
              className="border-line text-primary focus:ring-primary h-4 w-4 rounded disabled:cursor-not-allowed"
            />
            <label
              htmlFor="enableRiskAssessment"
              className="text-content-secondary text-sm font-medium"
            >
              {t('oscrat.ui.enable-risk-assessment')}
            </label>
          </div>
        </div>

        <div className="border-line-subtle mt-6 flex justify-end border-t pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={formik.isSubmitting || !formik.dirty}
          >
            {formik.isSubmitting
              ? t('oscrat.ui.saving')
              : t('oscrat.ui.save-changes')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskDetailsForm;

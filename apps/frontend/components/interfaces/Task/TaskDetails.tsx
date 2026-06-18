import React, { Fragment, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import Button from '@/components/button';
import type { Task, Team } from '@oscrat/model';
import { TaskStatus } from '@oscrat/model';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import { resolveTaskTitle } from '@/lib/tasks';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing, IssuePanelContainer } from 'sharedStyles';
import { useTask } from 'hooks/useTask';
import useCanAccess from '@/hooks/useCanAccess';
import type { UpdateTaskData } from '@/lib/api/endpoints/tasks';

import TextArea from '@atlaskit/textarea';

interface FormData {
  title: string;
  status: ValueType<StatusOption>;
  team: ValueType<Option>;
  duedate: string;
  description: string;
  [key: string]: string | ValueType<Option> | ValueType<StatusOption>;
}

interface Option {
  label: string;
  value: string;
}

interface StatusOption {
  label: string;
  value: TaskStatus;
}

const TaskDetails = ({ task, team }: { task: Task; team: Team }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const { updateTask } = useTask(team.slug, task.taskNumber.toString());
  const [isFormChanged, setIsFormChanged] = useState(false);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);

  const handleSubmit = async (data: FormData) => {
    if (!isFormChanged) {
      return;
    }
    const { title, status, duedate, description } = data;

    try {
      const updateData: UpdateTaskData = {
        title,
        status: status?.value as TaskStatus,
        description: description || '',
        duedate: duedate ? new Date(duedate) : undefined,
      };

      await updateTask(updateData);

      toast.success(t('task-updated'));
      setIsFormChanged(false);
    } catch (err: any) {
      toast.error(err.message || t('error-updating-task'));
    }
  };

  return (
    <IssuePanelContainer>
      <Form<FormData> onSubmit={handleSubmit}>
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                margin: '0 auto',
                flexDirection: 'column',
              }}
            >
              <Field
                aria-required={true}
                name="title"
                label={`Title (#${task.taskNumber})`}
                isRequired
                defaultValue={resolveTaskTitle(task, t)}
              >
                {({ fieldProps }) => (
                  <Fragment>
                    <TextField
                      autoComplete="off"
                      {...fieldProps}
                      onInput={checkFormChanges}
                    />
                  </Fragment>
                )}
              </Field>
              <Field<ValueType<StatusOption>>
                name="status"
                label="Status"
                aria-required={true}
                isRequired
                defaultValue={{
                  label: t(getTaskStatusTranslationKey(task.status)),
                  value: task.status,
                }}
                validate={async (value) => {
                  if (value) {
                    return undefined;
                  }

                  return new Promise((resolve) =>
                    setTimeout(resolve, 300)
                  ).then(() => 'Please select a status');
                }}
              >
                {({ fieldProps: { id, ...rest }, error }) => (
                  <Fragment>
                    <WithoutRing>
                      <Select<StatusOption>
                        inputId={id}
                        {...rest}
                        options={Object.values(TaskStatus).map((status) => ({
                          label: t(getTaskStatusTranslationKey(status)),
                          value: status,
                        }))}
                        validationState={error ? 'error' : 'default'}
                        onInputChange={checkFormChanges}
                      />
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </WithoutRing>
                  </Fragment>
                )}
              </Field>
              <Field
                name="duedate"
                label="Due date"
                defaultValue={task.duedate}
                isRequired
                aria-required={true}
                validate={async (value) => {
                  if (value) {
                    return undefined;
                  }

                  return new Promise((resolve) =>
                    setTimeout(resolve, 300)
                  ).then(() => 'Please select a due date');
                }}
              >
                {({ fieldProps: { id, ...rest }, error }) => (
                  <Fragment>
                    <WithoutRing>
                      <DatePicker
                        selectProps={{ inputId: id }}
                        {...rest}
                        onFocus={checkFormChanges}
                      />
                    </WithoutRing>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </Fragment>
                )}
              </Field>
              <Field
                label="Description"
                name="description"
                defaultValue={task.description || ''}
              >
                {({ fieldProps }: any) => (
                  <Fragment>
                    <TextArea
                      {...fieldProps}
                      minimumRows={4}
                      onChange={(e) => {
                        checkFormChanges();
                        fieldProps.onChange(e);
                      }}
                    />
                  </Fragment>
                )}
              </Field>
              <FormFooter>
                {canAccess('task', ['update']) && (
                  <Button
                    variant="secondary"
                    size="m"
                    type="submit"
                    loading={submitting}
                  >
                    {t('save-changes')}
                  </Button>
                )}
              </FormFooter>
            </div>
          </form>
        )}
      </Form>
    </IssuePanelContainer>
  );
};

export default TaskDetails;

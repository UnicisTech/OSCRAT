import React, { Fragment } from 'react';
import Select, { ValueType } from '@atlaskit/select';
import { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { useTranslation } from 'next-i18next';
import type { Task } from '@oscrat/model';
import { WithoutRing } from 'sharedStyles';
import { formatTaskLabel } from '@/lib/tasks';

interface FormBodyProps {
  tasks: Task[];
}

interface TaskOption {
  label: string;
  value: Task;
}

const TaskPickerFormBody = ({ tasks }: FormBodyProps) => {
  const { t } = useTranslation('common');
  return (
    <>
      <div
        style={{
          display: 'flex',
          width: '100%',
          margin: '0 auto',
          flexDirection: 'column',
        }}
      >
        <Field<ValueType<TaskOption>>
          name="task"
          label="Tasks"
          aria-required={true}
          isRequired
          validate={async (value) => {
            if (value) {
              return undefined;
            }

            return new Promise((resolve) => setTimeout(resolve, 300)).then(
              () => 'Please select a task'
            );
          }}
        >
          {({ fieldProps: { id, ...rest }, error }) => (
            <Fragment>
              <WithoutRing>
                <Select
                  inputId={id}
                  {...rest}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  options={tasks?.map((task) => ({
                    value: task,
                    label: formatTaskLabel(task, t),
                  }))}
                  validationState={error ? 'error' : 'default'}
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </WithoutRing>
            </Fragment>
          )}
        </Field>
        <FormFooter></FormFooter>
      </div>
    </>
  );
};

export default TaskPickerFormBody;

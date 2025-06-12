import React, { Fragment, useRef } from 'react';
import { Team } from '@prisma/client';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import Button, { LoadingButton } from '@atlaskit/button';
import statusesData from '@/components/defaultLanding/data/statuses.json';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import { useCreateTeamTask } from '@/lib/api/hooks';
import { getCurrentStringDate } from '@/components/services/taskService';
import type { CreateTaskData } from '@/lib/api/endpoints/tasks';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Status {
  label: string;
  value: string;
}

interface FormData {
  title: string;
  status: ValueType<Option>;
  team: ValueType<Option>;
  duedate: string;
  description: string;
  [key: string]: string | ValueType<Option>;
}

interface Option {
  label: string;
  value: string;
}

const statuses: Status[] = statusesData;
const DEFAULT_STATUS_VALUE = 'todo';

const CreateTask = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const { t } = useTranslation('common');
  const createTaskMutation = useCreateTeamTask(team.slug);

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">Create Task</Modal.Header>
      <Form<FormData>
        onSubmit={async (data, { reset }) => {
          const { title, status, duedate, description } = data;

          try {
            const createData: CreateTaskData = {
              title,
              status: status?.value,
              duedate: duedate ? new Date(duedate) : undefined,
              description: description || '',
            };

            await createTaskMutation.mutateAsync(createData);

            reset({
              title: '',
              status: null,
              team: null,
              duedate: '',
              description: '',
            });
            toast.success(t('task-created'));
            setVisible(false);
          } catch (err: any) {
            toast.error(err.message || t('error-creating-task'));
          }
        }}
      >
        {({ formProps, submitting }) => (
          <form
            {...formProps}
            ref={formRef}
            className="flex flex-col justify-between"
            style={{ height: '92%' }}
          >
            <Modal.Body>
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
                  label="Title"
                  isRequired
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                <Field<ValueType<Option>>
                  name="status"
                  label="Status"
                  defaultValue={statuses.find(
                    ({ value }) => value === DEFAULT_STATUS_VALUE
                  )}
                  aria-required={true}
                  isRequired
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
                        <Select
                          inputId={id}
                          {...rest}
                          options={statuses}
                          defaultValue={statuses.find(
                            ({ value }) => value === DEFAULT_STATUS_VALUE
                          )}
                          validationState={error ? 'error' : 'default'}
                        />
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                      </WithoutRing>
                    </Fragment>
                  )}
                </Field>
                <Field
                  name="duedate"
                  label="Due date"
                  defaultValue={getCurrentStringDate()}
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
                          locale="en-GB"
                        />
                      </WithoutRing>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  )}
                </Field>
                <Field label="Description" name="description">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill theme="snow" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                <FormFooter></FormFooter>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <Button
                appearance="default"
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                {t('close')}
              </Button>
              <LoadingButton
                type="submit"
                appearance="primary"
                ref={submitButtonRef}
                isLoading={submitting}
              >
                {t('create')}
              </LoadingButton>
            </Modal.Actions>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default CreateTask;

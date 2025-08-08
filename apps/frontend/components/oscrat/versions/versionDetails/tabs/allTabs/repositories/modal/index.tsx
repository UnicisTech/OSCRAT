import React, { Fragment } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { IoClose } from 'react-icons/io5';
import type {
  OscratRepositoryDetail,
  OscratRepositoryUpdate,
} from '@oscrat/model';
import {
  useOscratRepositoryDetail,
  useOscratRepository,
} from '@/hooks/oscrat/useOscratRepository';
import { extractErrorMessage } from '@/lib/utils';
import { WithoutRing } from 'sharedStyles';

// --- TYPE DEFINITIONS ---
interface RepositoryData {
  id: string;
  name: string;
  provider: string;
  link: string;
}

type CredentialType = 'account' | 'token';

// --- FILE: AddRepositoryModal.tsx ---
// A modal for adding a new repository.

interface AddRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newRepo: Omit<RepositoryData, 'id'>) => void;
}

interface Option {
  label: string;
  value: string;
}

interface FormData {
  name: string;
  provider: ValueType<Option>;
  user: string;
  authType: ValueType<Option>;
  targetBranch?: string;
  targetTag?: string;
  targetCommit?: string;
  accessToken?: string;
}

const PROVIDER_OPTIONS: Option[] = [
  { label: 'GitHub', value: 'GITHUB' },
  { label: 'GitLab', value: 'GITLAB' },
  { label: 'Bitbucket', value: 'BITBUCKET' },
];

const AUTH_TYPE_OPTIONS: Option[] = [
  { label: 'Personal Access Token', value: 'PERSONAL_ACCESS_TOKEN' },
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  repository?: OscratRepositoryDetail;
  teamId: string;
  projectId: string;
  versionId: string;
  isCreateMode?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  repository,
  teamId,
  projectId,
  versionId,
  isCreateMode = false,
}) => {
  const { t } = useTranslation('common');
  const { updateRepository } = useOscratRepositoryDetail(
    teamId,
    projectId,
    versionId,
    repository?.id || '',
    { enabled: !isCreateMode }
  );
  const { createRepository } = useOscratRepository(
    teamId,
    projectId,
    versionId
  );

  const selectedProvider = PROVIDER_OPTIONS.find(
    (option) => option.value === repository?.provider
  );

  const selectedAuthType = AUTH_TYPE_OPTIONS.find(
    (option) => option.value === repository?.authType
  );

  const defaultValues = {
    name: repository?.name || '',
    user: repository?.user || '',
    targetBranch: repository?.targetBranch || '',
    targetTag: repository?.targetTag || '',
    targetCommit: repository?.targetCommit || '',
    accessToken: repository?.accessToken || '',
  };

  const generateRepositoryUrl = (
    provider: string,
    user: string,
    name: string
  ): string => {
    switch (provider) {
      case 'GITHUB':
        return `https://github.com/${user}/${name}`;
      case 'GITLAB':
        return `https://gitlab.com/${user}/${name}`;
      case 'BITBUCKET':
        return `https://bitbucket.org/${user}/${name}`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="animate-fade-in-up flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-2xl">
        <Form<FormData>
          onSubmit={async (data) => {
            const {
              name,
              provider,
              user,
              authType,
              targetBranch,
              targetTag,
              targetCommit,
              accessToken,
            } = data;

            try {
              const repositoryUrl = generateRepositoryUrl(
                provider?.value as string,
                user,
                name
              );

              const repositoryData = {
                name,
                provider: provider?.value as any,
                repositoryUrl,
                user,
                authType: authType?.value as any,
                targetBranch: targetBranch || undefined,
                targetTag: targetTag || undefined,
                targetCommit: targetCommit || undefined,
                accessToken: accessToken || undefined,
              };

              if (isCreateMode) {
                await createRepository(repositoryData);
                toast.success(
                  t('repository-created') || 'Repository created successfully'
                );
              } else {
                await updateRepository(repositoryData);
                toast.success(
                  t('repository-updated') || 'Repository updated successfully'
                );
              }
              onClose();
            } catch (err: any) {
              const action = isCreateMode ? 'create' : 'update';
              toast.error(
                extractErrorMessage(
                  err,
                  t(`error-${action}-repository`) ||
                    `Failed to ${action} repository`
                )
              );
            }
          }}
        >
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <header className="flex items-center justify-between p-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {isCreateMode
                    ? t('oscrat.ui.add-new-repo')
                    : 'Edit Repository'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <IoClose size={24} />
                </button>
              </header>

              <main className="space-y-4 overflow-y-auto p-6">
                <Field
                  aria-required={true}
                  name="name"
                  label="Repository Name"
                  isRequired
                  defaultValue={defaultValues.name}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field<ValueType<Option>>
                  aria-required={true}
                  name="provider"
                  label="Provider"
                  isRequired
                  defaultValue={selectedProvider}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <Select
                          inputId={id}
                          {...rest}
                          options={PROVIDER_OPTIONS}
                          placeholder="Select provider"
                          isInvalid={!!error}
                        />
                      </WithoutRing>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  )}
                </Field>

                <Field
                  aria-required={true}
                  name="user"
                  label="User"
                  isRequired
                  defaultValue={defaultValues.user}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field<ValueType<Option>>
                  aria-required={true}
                  name="authType"
                  label="Authentication Type"
                  isRequired
                  defaultValue={selectedAuthType}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <Select
                          inputId={id}
                          {...rest}
                          options={AUTH_TYPE_OPTIONS}
                          placeholder="Select authentication type"
                          isInvalid={!!error}
                        />
                      </WithoutRing>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  )}
                </Field>

                <Field
                  name="targetBranch"
                  label="Target Branch"
                  defaultValue={defaultValues.targetBranch}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  name="targetTag"
                  label="Target Tag"
                  defaultValue={defaultValues.targetTag}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  name="targetCommit"
                  label="Target Commit"
                  defaultValue={defaultValues.targetCommit}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  name="accessToken"
                  label="Access Token"
                  defaultValue={defaultValues.accessToken}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField
                        autoComplete="off"
                        type="password"
                        {...fieldProps}
                      />
                    </Fragment>
                  )}
                </Field>

                <FormFooter></FormFooter>
              </main>

              <footer className="flex items-center justify-end space-x-3 rounded-b-lg bg-gray-50 p-4">
                <Button appearance="default" onClick={onClose} type="button">
                  {t('close')}
                </Button>
                <LoadingButton
                  type="submit"
                  appearance="primary"
                  isLoading={submitting}
                >
                  {isCreateMode ? 'Create Repository' : t('save-changes')}
                </LoadingButton>
              </footer>
            </form>
          )}
        </Form>
      </div>
    </div>
  );
};

export default Modal;

import React, { Fragment } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import type {
  OscratRepositoryDetail,
  OscratRepositoryUpdate,
} from '@oscrat/model';
import { Button } from '@/components/shared';
import Modal from '@/components/shared/Modal';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import {
  useOscratRepositoryDetail,
  useOscratRepository,
} from '@/hooks/oscrat/useOscratRepository';
import { extractErrorMessage } from '@/lib/utils';

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

const EditRepository = ({
  visible,
  setVisible,
  repository,
  teamId,
  productId,
  versionId,
  isCreateMode = false,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  repository?: OscratRepositoryDetail;
  teamId: string;
  productId: string;
  versionId: string;
  isCreateMode?: boolean;
}) => {
  const { t } = useTranslation('common');
  const { updateRepository } = useOscratRepositoryDetail(
    teamId,
    productId,
    versionId,
    repository?.id || '',
    { enabled: !isCreateMode }
  );
  const { createRepository } = useOscratRepository(
    teamId,
    productId,
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

  return (
    <Modal open={visible} close={() => setVisible(false)} size="lg">
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
              toast.success(t('oscrat.ui.repository-created'));
            } else {
              await updateRepository(repositoryData);
              toast.success(t('oscrat.ui.repository-updated'));
            }
            setVisible(false);
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
          <form {...formProps} className="contents">
            <Modal.Header>
              {isCreateMode ? 'Add Repository' : 'Edit Repository'}
            </Modal.Header>
            <Modal.Body>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  margin: '0 auto',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <Field
                  aria-required={true}
                  name="name"
                  label={t('oscrat.ui.repository.labels.repository-name')}
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
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                {t('close')}
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {isCreateMode ? 'Create Repository' : t('save-changes')}
              </Button>
            </Modal.Footer>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default EditRepository;

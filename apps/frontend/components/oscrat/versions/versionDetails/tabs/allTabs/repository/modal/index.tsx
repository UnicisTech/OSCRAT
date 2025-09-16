import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import { IoClose, IoEye, IoEyeOff } from 'react-icons/io5';
import { Button } from '@/components/shared';
import type {
  OscratRepositoryDetail,
  OscratRepositoryProvider,
  OscratRepositoryAuthType,
} from '@oscrat/model';
import {
  OscratRepositoryProvider as RepositoryProvider,
  OscratRepositoryAuthType as AuthType,
} from '@oscrat/model';
import {
  useOscratRepositoryDetail,
  useOscratRepository,
} from '@/hooks/oscrat/useOscratRepository';
import { extractErrorMessage } from '@/lib/utils';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import {
  createRepositoryCreateSchema,
  generateRepositoryUrl,
  type RepositoryCreateInput,
} from '@/lib/validation/repository';

interface Option {
  label: string;
  value: OscratRepositoryProvider;
}

const PROVIDER_OPTIONS: Option[] = [
  { label: 'oscrat.ui.repository.providers.GITHUB', value: RepositoryProvider.GITHUB },
  { label: 'oscrat.ui.repository.providers.GITLAB', value: RepositoryProvider.GITLAB },
  { label: 'oscrat.ui.repository.providers.BITBUCKET', value: RepositoryProvider.BITBUCKET },
];

interface AuthOption {
  label: string;
  value: OscratRepositoryAuthType;
}

const AUTH_TYPE_OPTIONS: AuthOption[] = [
  { label: 'oscrat.ui.repository.labels.auth-public', value: AuthType.PUBLIC },
  { label: 'oscrat.ui.repository.labels.auth-token', value: AuthType.PERSONAL_ACCESS_TOKEN },
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

// Form styling constants
const formStyles = {
  input: {
    base: 'w-full rounded-md border px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    normal: 'border-gray-300',
    password: 'pr-10 placeholder-gray-400',
  },
  label: 'mb-2 block text-sm font-medium text-gray-700',
  error: 'mt-1 text-sm text-red-600',
  helper: 'mt-1 text-xs text-gray-500',
  required: 'text-red-500',
  button: {
    toggle:
      'absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600',
  },
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  type = 'text',
  autoComplete = 'off',
}: any) => (
  <div>
    <label className={formStyles.label}>
      {label} {required && <span className={formStyles.required}>*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`${formStyles.input.base} ${error ? formStyles.input.error : formStyles.input.normal}`}
    />
    {error && (
      <p className={formStyles.error} role="alert">
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  children,
}: any) => (
  <div>
    <label className={formStyles.label}>
      {label} {required && <span className={formStyles.required}>*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`${formStyles.input.base} ${error ? formStyles.input.error : formStyles.input.normal}`}
    >
      {children}
    </select>
    {error && (
      <p className={formStyles.error} role="alert">
        {error}
      </p>
    )}
  </div>
);

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  helperText,
  showToken,
  onToggleToken,
}: any) => (
  <div>
    <label className={formStyles.label}>
      {label} {required && <span className={formStyles.required}>*</span>}
    </label>
    <div className="relative">
      <input
        type={showToken ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={`${formStyles.input.base} ${formStyles.input.password} ${error ? formStyles.input.error : formStyles.input.normal}`}
      />
      <button
        type="button"
        onClick={onToggleToken}
        className={formStyles.button.toggle}
      >
        {showToken ? <IoEyeOff size={16} /> : <IoEye size={16} />}
      </button>
    </div>
    {error && (
      <p className={formStyles.error} role="alert">
        {error}
      </p>
    )}
    {helperText && <p className={formStyles.helper}>{helperText}</p>}
  </div>
);

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
  const [showToken, setShowToken] = useState(false);

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

  // Get product and version data for the table
  const { project } = useOscratProject(teamId, projectId);
  const { version } = useOscratVersion(teamId, projectId, versionId);

  const formik = useFormik<RepositoryCreateInput>({
    initialValues: {
      name: repository?.name || '',
      provider: repository?.provider || RepositoryProvider.GITHUB,
      user: repository?.user || '',
      authType: repository?.authType || AuthType.PERSONAL_ACCESS_TOKEN,
      targetBranch: repository?.targetBranch || null,
      targetTag: repository?.targetTag || null,
      targetCommit: repository?.targetCommit || null,
      accessToken: repository?.accessToken || '',
    },
    validationSchema: createRepositoryCreateSchema(t),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const repositoryUrl = generateRepositoryUrl(
          values.provider,
          values.user,
          values.name
        );

        const repositoryData = {
          name: values.name,
          provider: values.provider,
          repositoryUrl,
          user: values.user,
          authType: values.authType,
          accessToken: values.authType === AuthType.PUBLIC ? undefined : values.accessToken,
          targetBranch: values.targetBranch,
          targetTag: values.targetTag,
          targetCommit: values.targetCommit,
        };

        if (isCreateMode) {
          await createRepository(repositoryData);
          toast.success(t('oscrat.ui.repository-created'));
        } else {
          await updateRepository(repositoryData);
          toast.success(t('oscrat.ui.repository-updated'));
        }
        onClose();
      } catch (err: unknown) {
        const errorKey = isCreateMode
          ? 'oscrat.ui.repository.errors.create-repository'
          : 'oscrat.ui.repository.errors.update-repository';
        toast.error(extractErrorMessage(err, t(errorKey)));
      }
    },
  });

  // Live URL preview
  const previewUrl =
    formik.values.name && formik.values.user
      ? generateRepositoryUrl(
          formik.values.provider,
          formik.values.user,
          formik.values.name
        )
      : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="animate-fade-in-up flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-2xl">
        <form onSubmit={formik.handleSubmit} className="flex flex-col">
          {/* Fixed Header */}
          <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {isCreateMode
                  ? t('oscrat.ui.add-new-repo')
                  : t('oscrat.ui.repository.labels.edit-repository')}
              </h2>
              {project?.name && version?.version && (
                <p className="mt-1 text-xs text-gray-500">
                  {project.name} • {version.version}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <IoClose size={24} />
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="overflow-y-auto">
            <main className="space-y-6 p-6">
              {/* Repository Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {t('oscrat.ui.repository.sections.information')}
                </h3>

                {/* Two-column grid for main fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SelectField
                    label={t('oscrat.ui.repository.labels.provider')}
                    name="provider"
                    value={formik.values.provider}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.provider && formik.errors.provider
                        ? t(formik.errors.provider)
                        : undefined
                    }
                    required
                  >
                    {PROVIDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </SelectField>

                  <FormField
                    label={t('oscrat.ui.repository.labels.repository-name')}
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.name && formik.errors.name
                        ? t(formik.errors.name)
                        : undefined
                    }
                    placeholder={t(
                      'oscrat.ui.repository.placeholders.repository-name'
                    )}
                    required
                  />

                  <FormField
                    label={t('oscrat.ui.repository.labels.user-organization')}
                    name="user"
                    value={formik.values.user}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.user && formik.errors.user
                        ? t(formik.errors.user)
                        : undefined
                    }
                    placeholder={
                      formik.values.provider === RepositoryProvider.GITHUB
                        ? t('oscrat.ui.repository.placeholders.github-user')
                        : t('oscrat.ui.repository.placeholders.user')
                    }
                    required
                  />

                </div>

                {/* URL Preview - Full width */}
                {previewUrl && (
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="mb-1 text-xs text-gray-600">
                      {t('oscrat.ui.repository.labels.repository-url-preview')}
                    </p>
                    <p className="break-all font-mono text-sm text-blue-600">
                      {previewUrl}
                    </p>
                  </div>
                )}
              </div>

              {/* Authentication Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {t('oscrat.ui.repository.sections.authentication')}
                </h3>

                <SelectField
                  label={t('oscrat.ui.repository.labels.auth-type')}
                  name="authType"
                  value={formik.values.authType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.authType && formik.errors.authType
                      ? t(formik.errors.authType)
                      : undefined
                  }
                  required
                >
                  {AUTH_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </SelectField>

                {formik.values.authType === AuthType.PERSONAL_ACCESS_TOKEN && (
                  <PasswordField
                    label={t(
                      'oscrat.ui.repository.labels.personal-access-token'
                    )}
                    name="accessToken"
                    value={formik.values.accessToken}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.accessToken && formik.errors.accessToken
                        ? t(formik.errors.accessToken)
                        : undefined
                    }
                    placeholder={t(
                      'oscrat.ui.repository.placeholders.access-token'
                    )}
                    helperText={t(
                      'oscrat.ui.repository.sections.token-security-notice'
                    )}
                    showToken={showToken}
                    onToggleToken={() => setShowToken(!showToken)}
                    required
                  />
                )}

                {formik.values.authType === AuthType.PUBLIC && (
                  <div className="rounded-md bg-blue-50 p-3">
                    <p className="text-sm text-blue-700">
                      {t('oscrat.ui.repository.sections.public-repo-notice')}
                    </p>
                  </div>
                )}
              </div>

              {/* Target Configuration Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    {t('oscrat.ui.repository.sections.target-configuration')}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {t(
                      'oscrat.ui.repository.sections.target-configuration-help'
                    )}
                  </p>
                </div>

                {/* Two-column grid for target fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    label={t('oscrat.ui.repository.labels.target-branch')}
                    name="targetBranch"
                    value={formik.values.targetBranch || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.targetBranch && formik.errors.targetBranch
                        ? t(formik.errors.targetBranch)
                        : undefined
                    }
                    placeholder={t('oscrat.ui.repository.placeholders.branch')}
                  />

                  <FormField
                    label={t('oscrat.ui.repository.labels.target-tag')}
                    name="targetTag"
                    value={formik.values.targetTag || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.targetTag && formik.errors.targetTag
                        ? t(formik.errors.targetTag)
                        : undefined
                    }
                    placeholder={t('oscrat.ui.repository.placeholders.tag')}
                  />

                  {/* Target Commit spans full width */}
                  <div className="md:col-span-2">
                    <FormField
                      label={t('oscrat.ui.repository.labels.target-commit')}
                      name="targetCommit"
                      value={formik.values.targetCommit || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.targetCommit &&
                        formik.errors.targetCommit
                          ? t(formik.errors.targetCommit)
                          : undefined
                      }
                      placeholder={t(
                        'oscrat.ui.repository.placeholders.commit'
                      )}
                    />
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Fixed Footer */}
          <footer className="flex flex-shrink-0 items-center justify-end space-x-3 border-t border-gray-200 p-4">
            <Button
              onClick={onClose}
              type="button"
              variant="ghost"
              className="w-auto"
              text={t('cancel')}
            />
            <Button
              type="submit"
              text={isCreateMode ? t('add') : t('save')}
              variant="primary"
              className="w-auto px-[1rem] py-[0.4rem]"
              disabled={formik.isSubmitting || !formik.isValid}
            />
          </footer>
        </form>
      </div>
    </div>
  );
};

export default Modal;

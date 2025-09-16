import * as Yup from 'yup';
import {
  OscratRepositoryProvider,
  OscratRepositoryAuthType,
} from '@oscrat/model';

const PROVIDERS = Object.values(OscratRepositoryProvider);
const AUTH_TYPES = Object.values(OscratRepositoryAuthType);

// Validation schema factory that takes translation function
export const createRepositoryCreateSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(t('oscrat.ui.repository.validation.name-required'))
      .min(1, t('oscrat.ui.repository.validation.name-required'))
      .max(100, t('oscrat.ui.repository.validation.name-too-long'))
      .matches(
        /^[a-zA-Z0-9._-]+$/,
        t('oscrat.ui.repository.validation.name-invalid-format')
      ),

    provider: Yup.mixed<OscratRepositoryProvider>()
      .oneOf(PROVIDERS, t('oscrat.ui.repository.validation.provider-invalid'))
      .required(t('oscrat.ui.repository.validation.provider-required')),

    authType: Yup.mixed<OscratRepositoryAuthType>()
      .oneOf(AUTH_TYPES, t('oscrat.ui.repository.validation.auth-type-invalid'))
      .required(t('oscrat.ui.repository.validation.auth-type-required')),

    user: Yup.string()
      .trim()
      .required(t('oscrat.ui.repository.validation.user-required'))
      .min(1, t('oscrat.ui.repository.validation.user-required'))
      .max(100, t('oscrat.ui.repository.validation.user-too-long'))
      .matches(
        /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
        t('oscrat.ui.repository.validation.user-invalid-format')
      ),

    targetBranch: Yup.string()
      .trim()
      .transform((value) => value === '' ? null : value)
      .max(100, t('oscrat.ui.repository.validation.branch-too-long'))
      .nullable(),
    targetTag: Yup.string()
      .trim()
      .transform((value) => value === '' ? null : value)
      .max(100, t('oscrat.ui.repository.validation.tag-too-long'))
      .nullable(),
    targetCommit: Yup.string()
      .trim()
      .transform((value) => value === '' ? null : value)
      .matches(
        /^[a-f0-9]{40}$/i,
        t('oscrat.ui.repository.validation.commit-invalid-format')
      )
      .nullable(),

    accessToken: Yup.string()
      .trim()
      .when('authType', {
        is: OscratRepositoryAuthType.PERSONAL_ACCESS_TOKEN,
        then: (schema) => schema
          .required(t('oscrat.ui.repository.validation.access-token-required'))
          .min(1, t('oscrat.ui.repository.validation.access-token-required'))
          .max(500, t('oscrat.ui.repository.validation.access-token-too-long')),
        otherwise: (schema) => schema.nullable()
      }),
  });

// Default schema without translations (for API usage)
export const repositoryCreateSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('oscrat.ui.repository.validation.name-required')
    .min(1, 'oscrat.ui.repository.validation.name-required')
    .max(100, 'oscrat.ui.repository.validation.name-too-long')
    .matches(
      /^[a-zA-Z0-9._-]+$/,
      'oscrat.ui.repository.validation.name-invalid-format'
    ),

  provider: Yup.mixed<OscratRepositoryProvider>()
    .oneOf(PROVIDERS, 'oscrat.ui.repository.validation.provider-invalid')
    .required('oscrat.ui.repository.validation.provider-required'),

  authType: Yup.mixed<OscratRepositoryAuthType>()
    .oneOf(AUTH_TYPES, 'oscrat.ui.repository.validation.auth-type-invalid')
    .required('oscrat.ui.repository.validation.auth-type-required'),

  user: Yup.string()
    .trim()
    .required('oscrat.ui.repository.validation.user-required')
    .min(1, 'oscrat.ui.repository.validation.user-required')
    .max(100, 'oscrat.ui.repository.validation.user-too-long')
    .matches(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      'oscrat.ui.repository.validation.user-invalid-format'
    ),

  targetBranch: Yup.string()
    .trim()
    .transform((value) => value === '' ? null : value)
    .max(100, 'oscrat.ui.repository.validation.branch-too-long')
    .nullable(),
  targetTag: Yup.string()
    .trim()
    .transform((value) => value === '' ? null : value)
    .max(100, 'oscrat.ui.repository.validation.tag-too-long')
    .nullable(),
  targetCommit: Yup.string()
    .trim()
    .transform((value) => value === '' ? null : value)
    .matches(
      /^[a-f0-9]{40}$/i,
      'oscrat.ui.repository.validation.commit-invalid-format'
    )
    .nullable(),

  accessToken: Yup.string()
    .trim()
    .when('authType', {
      is: OscratRepositoryAuthType.PERSONAL_ACCESS_TOKEN,
      then: (schema) => schema
        .required('oscrat.ui.repository.validation.access-token-required')
        .min(1, 'oscrat.ui.repository.validation.access-token-required')
        .max(500, 'oscrat.ui.repository.validation.access-token-too-long'),
      otherwise: (schema) => schema.nullable()
    }),
});

export const repositoryUpdateSchema = repositoryCreateSchema;

// Infer TypeScript types from schemas
export type RepositoryCreateInput = Yup.InferType<
  typeof repositoryCreateSchema
>;
export type RepositoryUpdateInput = Yup.InferType<
  typeof repositoryUpdateSchema
>;

// Helper to generate repository URL
export function generateRepositoryUrl(
  provider: OscratRepositoryProvider,
  user: string,
  name: string
): string {
  switch (provider) {
    case OscratRepositoryProvider.GITHUB:
      return `https://github.com/${user}/${name}`;
    case OscratRepositoryProvider.GITLAB:
      return `https://gitlab.com/${user}/${name}`;
    case OscratRepositoryProvider.BITBUCKET:
      return `https://bitbucket.org/${user}/${name}`;
    default:
      throw new Error('Invalid provider');
  }
}

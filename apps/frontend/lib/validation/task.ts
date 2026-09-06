import * as Yup from 'yup';
import {
  TaskStatus,
  TaskOriginType,
  TaskType,
  CONFIGURATION_SEVERITY,
  TASK_CONFIGURATION_PROPERTY_KEYS,
  TASK_CSC_PROPERTY_KEYS,
  TASK_RISK_PROPERTY_KEYS,
  type ConfigurationSeverity,
  type TaskCscAuditLogEntry,
  type TaskProperties,
} from '@oscrat/model';
import { descriptionSchema } from './inputs';
import {
  riskDetailsPropertiesSchema,
  riskTreatmentPropertiesSchema,
} from './risk';
import { TITLE_CHAR_REGEX } from '@/lib/text-sanitize';

const taskConfigurationPropertiesSchema = {
  [TASK_CONFIGURATION_PROPERTY_KEYS.REPORT_ID]: Yup.string()
    .trim()
    .max(100)
    .optional(),
  [TASK_CONFIGURATION_PROPERTY_KEYS.RULE_ID]: Yup.string()
    .trim()
    .max(500)
    .optional(),
  [TASK_CONFIGURATION_PROPERTY_KEYS.CCE]: Yup.string()
    .trim()
    .max(50)
    .optional(),
  [TASK_CONFIGURATION_PROPERTY_KEYS.SEVERITY]:
    Yup.mixed<ConfigurationSeverity>()
      .oneOf(Object.values(CONFIGURATION_SEVERITY))
      .optional(),
};

const taskCscPropertiesSchema = {
  [TASK_CSC_PROPERTY_KEYS.CONTROLS]: Yup.array()
    .of(Yup.string().required())
    .optional(),
  [TASK_CSC_PROPERTY_KEYS.AUDIT_LOGS]: Yup.array()
    .of(Yup.mixed<TaskCscAuditLogEntry>().required())
    .optional(),
};

const taskRiskFlagPropertiesSchema = {
  [TASK_RISK_PROPERTY_KEYS.DETAILS]: riskDetailsPropertiesSchema.optional(),
  [TASK_RISK_PROPERTY_KEYS.TREATMENT]: riskTreatmentPropertiesSchema.optional(),
};

export const taskPropertiesSchema: Yup.ObjectSchema<TaskProperties> =
  Yup.object({
    ...taskConfigurationPropertiesSchema,
    ...taskCscPropertiesSchema,
    ...taskRiskFlagPropertiesSchema,
  })
    .noUnknown()
    .strict();

const taskTitleSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.title-required')
  .max(100, 'oscrat.ui.validation.title-too-long')
  .matches(TITLE_CHAR_REGEX, 'oscrat.ui.validation.invalid-characters')
  .required('oscrat.ui.validation.task-title-required');

export const createTaskCreateSchema = () =>
  Yup.object({
    title: taskTitleSchema,
    description: descriptionSchema.optional(),
    status: Yup.mixed<TaskStatus>()
      .oneOf(
        Object.values(TaskStatus),
        'oscrat.ui.validation.task-status-invalid'
      )
      .required('oscrat.ui.validation.task-status-required'),
    duedate: Yup.date().required('oscrat.ui.validation.task-due-date-required'),
    productId: Yup.string().optional(),
    versionId: Yup.string().optional(),
    originType: Yup.mixed<TaskOriginType>()
      .oneOf(Object.values(TaskOriginType))
      .optional(),
    taskType: Yup.mixed<TaskType>()
      .oneOf(Object.values(TaskType), 'oscrat.ui.validation.task-type-invalid')
      .optional(),
    properties: taskPropertiesSchema.optional(),
  });

// Localized/automatic tasks (e.g. awareness training) store their title and
// description as i18n keys instead of literal strings, so the form field is
// read-only and the saved `title` is "". Skip the required-title validation
// when the caller signals that case so the rest of the form can still save.
export const createTaskUpdateSchema = (options?: {
  allowEmptyTitle?: boolean;
}) =>
  Yup.object({
    title: options?.allowEmptyTitle
      ? Yup.string().optional()
      : taskTitleSchema.optional(),
    description: descriptionSchema.optional(),
    status: Yup.mixed<TaskStatus>()
      .oneOf(
        Object.values(TaskStatus),
        'oscrat.ui.validation.task-status-invalid'
      )
      .optional(),
    duedate: Yup.date().optional(),
    assigneeId: Yup.string().nullable().optional(),
    taskType: Yup.mixed<TaskType>()
      .oneOf(Object.values(TaskType), 'oscrat.ui.validation.task-type-invalid')
      .optional(),
    properties: taskPropertiesSchema.optional(),
  });

export type TaskCreateData = Yup.InferType<
  ReturnType<typeof createTaskCreateSchema>
>;
export type TaskUpdateData = Yup.InferType<
  ReturnType<typeof createTaskUpdateSchema>
>;

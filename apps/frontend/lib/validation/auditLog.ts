import * as Yup from 'yup';
import { CrudType } from '@oscrat/model';

const CRUD_VALUES = Object.values(CrudType); // ['c', 'u', 'd']
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const auditLogQuerySchema = Yup.object().shape({
  page: Yup.number().positive().integer().optional(),
  pageSize: Yup.number().positive().integer().max(100).optional(),
  userId: Yup.string().uuid().optional(),
  targetType: Yup.string().optional(),
  crud: Yup.string()
    .oneOf(CRUD_VALUES as string[], 'Invalid crud value')
    .optional(),
  startDate: Yup.string()
    .matches(DATE_REGEX, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  endDate: Yup.string()
    .matches(DATE_REGEX, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  productId: Yup.string().uuid().optional(),
  versionId: Yup.string().uuid().optional(),
  action: Yup.string().optional(),
  targetId: Yup.string().optional(),
  hasProductOrVersion: Yup.boolean().optional(),
});

export type AuditLogQueryInput = Yup.InferType<typeof auditLogQuerySchema>;

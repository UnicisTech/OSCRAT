import * as Yup from 'yup';
import { TaskStatus } from '@oscrat/model';

/**
 * Task creation schema
 */
export const taskCreateSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required('oscrat.ui.validation.task-title-required')
    .min(1, 'oscrat.ui.validation.task-title-required')
    .max(50, 'oscrat.ui.validation.task-title-too-long'),
  
  description: Yup.string()
    .trim()
    .max(200, 'oscrat.ui.validation.task-description-too-long')
    .optional(),
    
  status: Yup.mixed<TaskStatus>()
    .oneOf(Object.values(TaskStatus), 'oscrat.ui.validation.task-status-invalid')
    .required('oscrat.ui.validation.task-status-required'),
    
  duedate: Yup.date()
    .required('oscrat.ui.validation.task-due-date-required'),
  
  productId: Yup.string()
    .optional(),
  
  versionId: Yup.string()
    .optional(),
});

/**
 * Task update schema (all fields optional)
 */
export const taskUpdateSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(1, 'oscrat.ui.validation.task-title-required')
    .max(50, 'oscrat.ui.validation.task-title-too-long')
    .optional(),
  
  description: Yup.string()
    .trim()
    .max(200, 'oscrat.ui.validation.task-description-too-long')
    .optional(),
    
  status: Yup.mixed<TaskStatus>()
    .oneOf(Object.values(TaskStatus), 'oscrat.ui.validation.task-status-invalid')
    .optional(),
    
  duedate: Yup.date()
    .optional(),
    
  assigneeId: Yup.string()
    .nullable()
    .optional(),
});

// Type exports
export type TaskCreateData = Yup.InferType<typeof taskCreateSchema>;
export type TaskUpdateData = Yup.InferType<typeof taskUpdateSchema>;

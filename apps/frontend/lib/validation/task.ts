import * as Yup from 'yup';
import { TaskStatus } from '@oscrat/model';
import { titleSchema, descriptionSchema } from './inputs';

export const taskCreateSchema = Yup.object({
  title: titleSchema.required('oscrat.ui.validation.task-title-required'),
  
  description: descriptionSchema.optional(),
    
  status: Yup.mixed<TaskStatus>()
    .oneOf(Object.values(TaskStatus), 'oscrat.ui.validation.task-status-invalid')
    .required('oscrat.ui.validation.task-status-required'),
    
  duedate: Yup.date()
    .required('oscrat.ui.validation.task-due-date-required'),
  
  productId: Yup.string().optional(),
  versionId: Yup.string().optional(),
});

export const taskUpdateSchema = Yup.object({
  title: titleSchema.optional(),
  
  description: descriptionSchema.optional(),
    
  status: Yup.mixed<TaskStatus>()
    .oneOf(Object.values(TaskStatus), 'oscrat.ui.validation.task-status-invalid')
    .optional(),
    
  duedate: Yup.date().optional(),
    
  assigneeId: Yup.string().nullable().optional(),
});

export type TaskCreateData = Yup.InferType<typeof taskCreateSchema>;
export type TaskUpdateData = Yup.InferType<typeof taskUpdateSchema>;

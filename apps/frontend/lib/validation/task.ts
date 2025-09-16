import * as Yup from 'yup';

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
    
  status: Yup.string()
    .required('oscrat.ui.validation.task-status-required'),
    
  duedate: Yup.date()
    .required('oscrat.ui.validation.task-due-date-required'),
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
    
  status: Yup.string()
    .optional(),
    
  duedate: Yup.date()
    .optional(),
});

// Type exports
export type TaskCreateData = Yup.InferType<typeof taskCreateSchema>;
export type TaskUpdateData = Yup.InferType<typeof taskUpdateSchema>;

import * as Yup from 'yup';
import { TaskStatus } from '@oscrat/model';
import { descriptionSchema } from './inputs';

type TaskTitleCandidate = {
  id: number;
  title: string;
};

const createTaskTitleWithUniquenessSchema = (
  existingTasks: TaskTitleCandidate[] | undefined,
  currentTaskId?: number
) =>
  Yup.string()
    .trim()
    .min(1, 'oscrat.ui.validation.title-required')
    .max(100, 'oscrat.ui.validation.title-too-long')
    // Allow brackets specifically for task names in addition to existing title characters.
    .matches(/^[a-zA-Z0-9\s\-_.,()'[\]\u00C0-\u017F]*$/, 'oscrat.ui.validation.invalid-characters')
    .required('oscrat.ui.validation.task-title-required')
    .test(
      'unique-title',
      'oscrat.ui.validation.task-title-already-exists',
      (value) => {
        if (!value || !existingTasks) return true;
        const normalizedValue = value.trim().toLowerCase();
        return !existingTasks.some(
          (task) => {
            if (currentTaskId && task.id === currentTaskId) {
              return false;
            }
            const normalizedTaskTitle = task.title.trim().toLowerCase();
            return normalizedTaskTitle === normalizedValue;
          }
        );
      }
    );

export const createTaskCreateSchema = (
  existingTasks: TaskTitleCandidate[] | undefined
) =>
  Yup.object({
    title: createTaskTitleWithUniquenessSchema(existingTasks),
    
    description: descriptionSchema.optional(),
      
    status: Yup.mixed<TaskStatus>()
      .oneOf(Object.values(TaskStatus), 'oscrat.ui.validation.task-status-invalid')
      .required('oscrat.ui.validation.task-status-required'),
      
    duedate: Yup.date()
      .required('oscrat.ui.validation.task-due-date-required'),
    
    productId: Yup.string().optional(),
    versionId: Yup.string().optional(),
  });

export const createTaskUpdateSchema = (
  existingTasks: TaskTitleCandidate[] | undefined,
  currentTaskId?: number
) =>
  Yup.object({
    title: createTaskTitleWithUniquenessSchema(existingTasks, currentTaskId),
    
    description: descriptionSchema.optional(),
      
    status: Yup.mixed<TaskStatus>()
      .oneOf(Object.values(TaskStatus), 'oscrat.ui.validation.task-status-invalid')
      .optional(),
      
    duedate: Yup.date().optional(),
      
    assigneeId: Yup.string().nullable().optional(),
  });

export type TaskCreateData = Yup.InferType<ReturnType<typeof createTaskCreateSchema>>;
export type TaskUpdateData = Yup.InferType<ReturnType<typeof createTaskUpdateSchema>>;

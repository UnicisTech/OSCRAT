import * as Yup from 'yup';
import { TaskStatus } from '@oscrat/model';
import { titleSchema, descriptionSchema } from './inputs';

type TaskTitleCandidate = {
  id: number;
  title: string;
};

const createTaskTitleWithUniquenessSchema = (
  existingTasks: TaskTitleCandidate[] | undefined,
  currentTaskId?: number
) =>
  titleSchema
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

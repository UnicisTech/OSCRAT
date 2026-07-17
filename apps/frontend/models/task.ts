import { prisma } from '@/lib/prisma';
import * as TaskOps from '@oscrat/model/operations';
import * as TeamOps from '@oscrat/model/operations';
import {
  TaskStatus,
  TaskOriginType,
  TRAINING_TASK_TYPE_VALUE,
  type AuditInfo,
  type TaskProperties,
} from '@oscrat/model';

const normalizeTaskTitle = (title: string) => title.trim();
type TaskUpdateInput = TaskOps.TaskUpdateInput;

export const createTask = async (
  param: {
    authorId: string;
    teamId: string;
    title: string;
    status: TaskStatus;
    duedate?: string;
    description: string;
    assigneeId?: string;
    productId?: string;
    versionId?: string;
    originType?: TaskOriginType;
    properties?: TaskProperties;
  },
  audit: AuditInfo
) => {
  const { teamId } = param;
  const normalizedTitle = normalizeTaskTitle(param.title);
  const team = await TeamOps.getTeamDetail(prisma, { id: teamId });
  if (!team) {
    throw new Error('Organization not found');
  }
  const taskNumber = team.taskIndex;

  const task = await TaskOps.createTask(
    prisma,
    {
      ...param,
      title: normalizedTitle,
      duedate: param.duedate || new Date().toISOString(),
      taskNumber,
    },
    audit
  );

  await TeamOps.incrementTaskIndex(prisma, teamId);

  return task;
};

export const updateTask = async (
  taskNumber: number,
  slug: string,
  data: TaskUpdateInput,
  audit: AuditInfo
) => {
  let updateData: TaskUpdateInput = data;

  if (data?.status === TaskStatus.DONE) {
    const task = await prisma.task.findFirst({
      where: { taskNumber, team: { slug } },
      select: { assigneeId: true, teamId: true, properties: true },
    });
    if (task?.assigneeId) {
      const props = task.properties as Record<string, unknown>;
      if (props?.task_type === TRAINING_TASK_TYPE_VALUE) {
        await TeamOps.updateLastAwarenessTrainingCompletion(
          prisma,
          task.teamId,
          task.assigneeId,
          new Date()
        );
      }
    }
  }

  if (typeof data?.title === 'string') {
    updateData = {
      ...updateData,
      title: normalizeTaskTitle(data.title),
    };
  }

  return await TaskOps.updateTask(prisma, taskNumber, slug, updateData, audit);
};

export const deleteTask = async (
  taskNumber: number,
  slug: string,
  audit: AuditInfo
) => {
  return await TaskOps.deleteTask(prisma, taskNumber, slug, audit);
};

export const getTasks = async (userId: string) => {
  return await TaskOps.getTasks(prisma, userId);
};

export const getTaskBySlugAndNumber = async (
  taskNumber: number,
  slug: string
) => {
  return await TaskOps.getTaskBySlugAndNumber(prisma, taskNumber, slug);
};

export const getTeamTasks = async (slug: string) => {
  return await TaskOps.getTeamTasks(prisma, slug);
};

export const ensureAwarenessTrainingTask = async (
  teamId: string,
  userId: string,
  userName: string,
  auditInfo: AuditInfo
) => {
  return TaskOps.ensureAwarenessTrainingTask(
    prisma,
    teamId,
    userId,
    userName,
    auditInfo
  );
};

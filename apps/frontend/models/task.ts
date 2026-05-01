import { prisma } from '@/lib/prisma';
import * as TaskOps from '@oscrat/model/operations';
import * as TeamOps from '@oscrat/model/operations';
import { TaskStatus, TaskOriginType, type AuditInfo, type TaskProperties } from '@oscrat/model';

const normalizeTaskTitle = (title: string) => title.trim();
type TaskUpdateInput = Record<string, unknown>;

const createConflictError = (message: string) => {
  const error = new Error(message) as Error & { status: number };
  error.status = 409;
  return error;
};

const throwIfTaskTitleExists = async ({
  teamId,
  title,
  excludeTaskId,
}: {
  teamId: string;
  title: string;
  excludeTaskId?: number;
}) => {
  const existingTask = await prisma.task.findFirst({
    where: {
      teamId,
      ...(excludeTaskId ? { id: { not: excludeTaskId } } : {}),
      title: {
        equals: title,
        mode: 'insensitive',
      },
    },
    select: { id: true },
  });

  if (existingTask) {
    throw createConflictError('A task with this title already exists');
  }
};

export const createTask = async (param: {
  authorId: string;
  teamId: string;
  title: string;
  status: TaskStatus;
  duedate?: string;
  description: string;
  productId?: string;
  versionId?: string;
  originType?: TaskOriginType;
  properties?: TaskProperties;
}, audit: AuditInfo) => {
  const { teamId } = param;
  const normalizedTitle = normalizeTaskTitle(param.title);
  const team = await TeamOps.getTeamDetail(prisma, { id: teamId });
  if (!team) {
    throw new Error('Team not found');
  }
  await throwIfTaskTitleExists({ teamId, title: normalizedTitle });
  const taskNumber = team.taskIndex;

  const task = await TaskOps.createTask(prisma, {
    ...param,
    title: normalizedTitle,
    duedate: param.duedate || new Date().toISOString(),
    taskNumber,
  }, audit);

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

  if (typeof data?.title === 'string') {
    const taskToUpdate = await prisma.task.findFirst({
      where: {
        taskNumber,
        team: {
          slug,
        },
      },
      select: {
        id: true,
        teamId: true,
      },
    });

    if (!taskToUpdate) {
      return null;
    }

    const normalizedTitle = normalizeTaskTitle(data.title);
    await throwIfTaskTitleExists({
      teamId: taskToUpdate.teamId,
      title: normalizedTitle,
      excludeTaskId: taskToUpdate.id,
    });

    updateData = {
      ...data,
      title: normalizedTitle,
    };
  }

  return await TaskOps.updateTask(prisma, taskNumber, slug, updateData, audit);
};

export const deleteTask = async (taskNumber: number, slug: string, audit: AuditInfo) => {
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

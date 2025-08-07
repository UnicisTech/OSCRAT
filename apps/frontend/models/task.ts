import { prisma } from '@/lib/prisma';
import * as TaskOps from '@oscrat/model/operations';
import * as TeamOps from '@oscrat/model/operations';

export const createTask = async (param: {
  authorId: string;
  teamId: string;
  title: string;
  status: string;
  duedate: string;
  description: string;
}) => {
  const { teamId } = param;
  const team = await TeamOps.getTeamDetail(prisma, { id: teamId });
  if (!team) {
    throw new Error('Team not found');
  }
  const taskNumber = team.taskIndex;

  const task = await TaskOps.createTask(prisma, {
    ...param,
    taskNumber,
  });

  await TeamOps.incrementTaskIndex(prisma, teamId);

  return task;
};

export const updateTask = async (
  taskNumber: number,
  slug: string,
  data: any
) => {
  return await TaskOps.updateTask(prisma, taskNumber, slug, data);
};

export const deleteTask = async (taskNumber: number, slug: string) => {
  return await TaskOps.deleteTask(prisma, taskNumber, slug);
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

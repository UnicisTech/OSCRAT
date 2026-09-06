import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as TaskOps from '@oscrat/model/operations';
import * as TeamOps from '@oscrat/model/operations';
import {
  TaskStatus,
  TaskOriginType,
  TaskType,
  type AuditInfo,
  type TaskProperties,
} from '@oscrat/model';

const normalizeTaskTitle = (title: string) => title.trim();
type TaskUpdateInput = TaskOps.TaskUpdateInput;

const assertRiskTaskCanBeDone = (
  taskType: TaskType | null | undefined,
  status: TaskStatus | undefined,
  properties: TaskProperties | null | undefined
) => {
  if (
    status === TaskStatus.DONE &&
    taskType === TaskType.RISK &&
    !(properties?.riskDetails && properties?.riskTreatment)
  ) {
    throw new ApiError(400, 'oscrat.ui.validation.risk-sections-required');
  }
};

export const createTask = async (
  param: {
    authorId: string;
    teamId: string;
    title: string;
    titleLocId?: string;
    status: TaskStatus;
    duedate?: string;
    description: string;
    descriptionLocId?: string;
    assigneeId?: string;
    productId?: string;
    versionId?: string;
    originType?: TaskOriginType;
    taskType?: TaskType;
    properties?: TaskProperties;
  },
  audit: AuditInfo
) => {
  const { teamId } = param;

  assertRiskTaskCanBeDone(param.taskType, param.status, param.properties);

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
      select: {
        assigneeId: true,
        teamId: true,
        taskType: true,
        properties: true,
      },
    });

    assertRiskTaskCanBeDone(
      data.taskType ?? task?.taskType,
      data.status,
      (data.properties ?? task?.properties) as TaskProperties | null
    );

    if (task?.assigneeId && task.taskType === TaskType.TRAINING) {
      await TeamOps.updateLastAwarenessTrainingCompletion(
        prisma,
        task.teamId,
        task.assigneeId,
        new Date()
      );
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

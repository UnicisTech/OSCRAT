import {
  PrismaClient,
  TaskStatus,
  TaskOriginType,
  TaskType,
  Prisma,
} from '@prisma/client';
import {
  createAuditContextWithTx,
  logCreate,
  logUpdate,
  logDelete,
  EntityType,
  type AuditInfo,
} from '../audit';
import { toJsonInput } from '../utils/json';
import {
  TASK_CONFIGURATION_PROPERTY_KEYS,
  buildConfigurationTaskProperties,
  type TaskByRuleSummary,
  type TaskProperties,
} from '../types/task';
import {
  AWARENESS_TRAINING_DUE_DAYS,
  AWARENESS_TRAINING_TITLE_LOC_ID,
  AWARENESS_TRAINING_DESCRIPTION_LOC_ID,
} from '../constants/awarenessTraining';
import {
  CONFIGURATION_TASK_DUE_DAYS,
  CONFIGURATION_TASK_TITLE_LOC_ID,
  CONFIGURATION_TASK_DESCRIPTION_LOC_ID,
} from '../constants/configurationTask';
import {
  CONFIGURATION_RESULT,
  type ConfigurationScanRuleResult,
} from '../types/configurationScan';
import { getTeamDetail, incrementTaskIndex, reserveTaskNumbers } from './team';
import { assertOwnership } from './ownership';

const { RULE_ID: CONFIGURATION_RULE_ID } = TASK_CONFIGURATION_PROPERTY_KEYS;

/** Create a new task */
export const createTask = async (
  prisma: PrismaClient,
  param: {
    authorId: string;
    teamId: string;
    title: string;
    titleLocId?: string;
    status: TaskStatus;
    duedate: string;
    description: string;
    descriptionLocId?: string;
    taskNumber: number;
    assigneeId?: string;
    productId?: string;
    versionId?: string;
    originType?: TaskOriginType;
    taskType?: TaskType;
    properties?: TaskProperties;
  },
  auditInfo: AuditInfo
) => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const {
      authorId,
      teamId,
      title,
      titleLocId,
      status,
      duedate,
      description,
      descriptionLocId,
      taskNumber,
      assigneeId,
      productId,
      versionId,
      originType,
      taskType,
      properties,
    } = param;

    await assertOwnership(tx, teamId, {
      product: productId,
      version: versionId,
      member: assigneeId,
    });

    const task = await tx.task.create({
      data: {
        authorId,
        taskNumber,
        teamId,
        title,
        titleLocId,
        status,
        duedate,
        description,
        descriptionLocId,
        properties: toJsonInput(properties ?? {}),
        assigneeId,
        productId,
        versionId,
        originType,
        taskType,
      },
    });

    await logCreate(EntityType.Task, audit, {
      ...task,
      id: String(task.id),
      name: task.title,
    });

    return task;
  });
};

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  duedate?: string;
  assigneeId?: string | null;
  taskType?: TaskType;
  properties?: TaskProperties;
}

/** Update a task by task number and team slug */
export const updateTask = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string,
  data: TaskUpdateInput,
  auditInfo: AuditInfo
) => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const taskToEdit = await tx.task.findFirst({
      where: {
        taskNumber,
        team: {
          slug,
        },
      },
    });

    if (!taskToEdit) {
      return null;
    }

    const { properties, ...rest } = data;

    const updatedTask = await tx.task.update({
      where: {
        id: taskToEdit.id,
      },
      data: {
        ...rest,
        ...(properties !== undefined && {
          properties: toJsonInput(properties),
        }),
      },
    });

    await logUpdate(
      EntityType.Task,
      audit,
      { ...taskToEdit, id: String(taskToEdit.id), name: taskToEdit.title },
      { ...updatedTask, id: String(updatedTask.id), name: updatedTask.title }
    );

    return updatedTask;
  });
};

/** Delete a task by task number and team slug */
export const deleteTask = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string,
  auditInfo: AuditInfo
) => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const taskToDelete = await tx.task.findFirst({
      where: {
        taskNumber,
        team: {
          slug,
        },
      },
      select: { id: true, title: true },
    });

    if (!taskToDelete) {
      return null;
    }

    await logDelete(EntityType.Task, audit, {
      id: String(taskToDelete.id),
      name: taskToDelete.title,
    });

    return await tx.task.delete({
      where: {
        id: taskToDelete.id,
      },
    });
  });
};

/** Get all tasks for a user */
export const getTasks = async (prisma: PrismaClient, userId: string) => {
  return await prisma.task.findMany({
    where: {
      team: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    },
  });
};

/** Get task by task number and team slug with full details */
export const getTaskRefBySlugAndNumber = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string
) => {
  return await prisma.task.findFirst({
    where: {
      taskNumber,
      team: { slug },
    },
    select: { id: true, versionId: true },
  });
};

export const getTaskBySlugAndNumber = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string
) => {
  const task = await prisma.task.findFirst({
    where: {
      taskNumber: taskNumber,
      team: {
        slug: slug,
      },
    },
    include: {
      comments: {
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      attachments: {
        select: {
          id: true,
          name: true,
          fileSize: true,
          mimeType: true,
          description: true,
          url: true,
          fileId: true,
          taskId: true,
          versionId: true,
          sbomReportId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return task;
};

/** Get all tasks for a team by slug */
export const getTeamTasks = async (prisma: PrismaClient, slug: string) => {
  return await prisma.task.findMany({
    where: {
      team: {
        slug,
      },
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/** Unresolved configuration-rule tasks for a product version, keyed by rule_id.
 *  Scoped to versionId (not reportId) so the same task is surfaced across every
 *  configuration scan report under the version. */
export const getConfigurationTasksByVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<Map<string, TaskByRuleSummary>> => {
  const tasks = await prisma.task.findMany({
    where: {
      teamId,
      versionId,
      status: { not: TaskStatus.DONE },
      properties: {
        path: [CONFIGURATION_RULE_ID],
        not: Prisma.AnyNull,
      },
    },
    select: {
      id: true,
      taskNumber: true,
      title: true,
      status: true,
      properties: true,
    },
  });

  const byRule = new Map<string, TaskByRuleSummary>();
  for (const t of tasks) {
    const ruleId = (t.properties as Record<string, unknown>)?.[
      CONFIGURATION_RULE_ID
    ] as string | undefined;
    if (ruleId && !byRule.has(ruleId)) {
      byRule.set(ruleId, {
        id: t.id,
        taskNumber: t.taskNumber,
        title: t.title,
        status: t.status,
      });
    }
  }
  return byRule;
};

/** Find an active (non-DONE) training task assigned to a user in a team */
export const findActiveTrainingTaskForUser = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string
) => {
  return await prisma.task.findFirst({
    where: {
      teamId,
      assigneeId: userId,
      taskType: TaskType.TRAINING,
      status: { not: TaskStatus.DONE },
    },
  });
};

/**
 * Creates an awareness training task for a user in a team if one doesn't
 * already exist (idempotent). Used by both the frontend (on team member
 * creation) and the jobrunner (daily regeneration).
 */
export const ensureAwarenessTrainingTask = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  userName: string,
  auditInfo: AuditInfo
) => {
  const existing = await findActiveTrainingTaskForUser(prisma, teamId, userId);
  if (existing) return existing;

  const team = await getTeamDetail(prisma, { id: teamId });
  if (!team) throw new Error(`Team ${teamId} not found`);

  const duedate = new Date();
  duedate.setDate(duedate.getDate() + AWARENESS_TRAINING_DUE_DAYS);

  const task = await createTask(
    prisma,
    {
      authorId: userId,
      teamId,
      title: '',
      titleLocId: AWARENESS_TRAINING_TITLE_LOC_ID,
      status: TaskStatus.TODO,
      duedate: duedate.toISOString(),
      description: '',
      descriptionLocId: AWARENESS_TRAINING_DESCRIPTION_LOC_ID,
      assigneeId: userId,
      originType: TaskOriginType.AUTOMATIC,
      taskType: TaskType.TRAINING,
      taskNumber: team.taskIndex,
      properties: {},
    },
    auditInfo
  );

  await incrementTaskIndex(prisma, teamId);
  return task;
};

export const ensureConfigurationTasksForReport = async (
  prisma: PrismaClient,
  param: {
    teamId: string;
    versionId: string;
    productId?: string;
    reportId: string;
    authorId: string;
    rules: ConfigurationScanRuleResult[];
  },
  auditInfo: AuditInfo
): Promise<{ created: number; skipped: number }> => {
  const { teamId, versionId, productId, reportId, authorId, rules } = param;

  const existing = await getConfigurationTasksByVersion(
    prisma,
    teamId,
    versionId
  );
  const failed = rules.filter(
    (rule) => rule.result === CONFIGURATION_RESULT.FAIL
  );
  const newlyFailed = failed.filter((rule) => !existing.has(rule.ruleId));
  const skipped = failed.length - newlyFailed.length;
  if (newlyFailed.length === 0) return { created: 0, skipped };

  const duedate = new Date();
  duedate.setDate(duedate.getDate() + CONFIGURATION_TASK_DUE_DAYS);

  const firstTaskNumber = await reserveTaskNumbers(
    prisma,
    teamId,
    newlyFailed.length
  );

  for (let index = 0; index < newlyFailed.length; index++) {
    const rule = newlyFailed[index];
    await createTask(
      prisma,
      {
        authorId,
        teamId,
        title: '',
        titleLocId: CONFIGURATION_TASK_TITLE_LOC_ID,
        status: TaskStatus.TODO,
        duedate: duedate.toISOString(),
        description: '',
        descriptionLocId: CONFIGURATION_TASK_DESCRIPTION_LOC_ID,
        productId,
        versionId,
        originType: TaskOriginType.AUTOMATIC,
        taskType: TaskType.CONFIGURATION_MANAGEMENT,
        taskNumber: firstTaskNumber + index,
        properties: buildConfigurationTaskProperties(reportId, rule),
      },
      auditInfo
    );
  }

  return { created: newlyFailed.length, skipped };
};

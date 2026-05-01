import { PrismaClient, TaskStatus, TaskOriginType, Prisma } from '@prisma/client';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';
import { toJsonInput } from '../utils/json';
import {
  TASK_CONFIGURATION_PROPERTY_KEYS,
  type TaskByRuleSummary,
  type TaskProperties,
} from '../types/task';

const { RULE_ID: CONFIGURATION_RULE_ID } = TASK_CONFIGURATION_PROPERTY_KEYS;

/** Create a new task */
export const createTask = async (
  prisma: PrismaClient,
  param: {
    authorId: string;
    teamId: string;
    title: string;
    status: TaskStatus;
    duedate: string;
    description: string;
    taskNumber: number;
    productId?: string;
    versionId?: string;
    originType?: TaskOriginType;
    properties?: TaskProperties;
  },
  auditInfo: AuditInfo
) => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const { authorId, teamId, title, status, duedate, description, taskNumber, productId, versionId, originType, properties } =
      param;

    const task = await tx.task.create({
      data: {
        authorId,
        taskNumber,
        teamId,
        title,
        status: status,
        duedate,
        description,
        properties: toJsonInput(properties ?? {}),
        productId,
        versionId,
        originType: originType,
      },
    });

    await logCreate(EntityType.Task, audit, { ...task, id: String(task.id), name: task.title });

    return task;
  });
};

/** Update a task by task number and team slug */
export const updateTask = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string,
  data: any,
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

    const updatedTask = await tx.task.update({
      where: {
        id: taskToEdit.id,
      },
      data: data,
    });

    await logUpdate(EntityType.Task, audit, { ...taskToEdit, id: String(taskToEdit.id), name: taskToEdit.title }, { ...updatedTask, id: String(updatedTask.id), name: updatedTask.title });

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

    await logDelete(EntityType.Task, audit, { id: String(taskToDelete.id), name: taskToDelete.title });

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
    const ruleId = (t.properties as Record<string, unknown>)?.[CONFIGURATION_RULE_ID] as
      | string
      | undefined;
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

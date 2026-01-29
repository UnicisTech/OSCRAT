import { PrismaClient, TaskStatus, TaskOriginType } from '@prisma/client';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';

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
  },
  auditInfo: AuditInfo
) => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const { authorId, teamId, title, status, duedate, description, taskNumber, productId, versionId, originType } =
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
        properties: {},
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

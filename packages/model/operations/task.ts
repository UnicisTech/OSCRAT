import { PrismaClient, TaskStatus, TaskOriginType } from '@prisma/client';

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
  }
) => {
  const { authorId, teamId, title, status, duedate, description, taskNumber, productId, versionId, originType } =
    param;

  return await prisma.task.create({
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
};

/** Update a task by task number and team slug */
export const updateTask = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string,
  data: any
) => {
  const taskToEdit = await prisma.task.findFirst({
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

  return await prisma.task.update({
    where: {
      id: taskToEdit.id,
    },
    data: data,
  });
};

/** Delete a task by task number and team slug */
export const deleteTask = async (
  prisma: PrismaClient,
  taskNumber: number,
  slug: string
) => {
  const taskToDelete = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!taskToDelete) {
    return null;
  }

  return await prisma.task.delete({
    where: {
      id: taskToDelete.id,
    },
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

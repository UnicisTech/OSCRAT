import { PrismaClient } from '@prisma/client';

/** Get all comments for a task */
export const getComments = async (
  prisma: PrismaClient,
  params: {
    taskNumber: number;
    slug: string;
  }
) => {
  const { taskNumber, slug } = params;

  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return [];
  }

  return await prisma.comment.findMany({
    where: {
      taskId: task.id,
    },
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
    orderBy: {
      createdAt: 'asc',
    },
  });
};

/** Create a new comment */
export const createComment = async (
  prisma: PrismaClient,
  params: {
    text: string;
    userId: string;
    taskNumber: number;
    slug: string;
  }
) => {
  const { text, taskNumber, slug, userId } = params;

  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  return await prisma.comment.create({
    data: {
      text,
      taskId: task.id,
      createdById: userId,
    },
  });
};

/** Update a comment */
export const updateComment = async (
  prisma: PrismaClient,
  id: number,
  text: string
) => {
  const commentToEdit = await prisma.comment.findFirst({
    where: {
      id,
    },
  });

  if (!commentToEdit) {
    return null;
  }

  return await prisma.comment.update({
    where: {
      id: commentToEdit.id,
    },
    data: {
      text,
    },
  });
};

/** Delete a comment */
export const deleteComment = async (prisma: PrismaClient, id: number) => {
  return await prisma.comment.delete({
    where: {
      id,
    },
  });
};

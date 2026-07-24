import { prisma } from '@/lib/prisma';
import * as CommentOps from '@oscrat/model/operations';

export const getComments = async (params: {
  taskNumber: number;
  slug: string;
}) => {
  return await CommentOps.getComments(prisma, params);
};

export const createComment = async (params: {
  text: string;
  userId: string;
  taskNumber: number;
  slug: string;
}) => {
  return await CommentOps.createComment(prisma, params);
};

export const updateComment = async (
  id: number,
  text: string,
  teamId: string
) => {
  return await CommentOps.updateComment(prisma, id, text, teamId);
};

export const deleteComment = async (id: number, teamId: string) => {
  return await CommentOps.deleteComment(prisma, id, teamId);
};

import { ExtendedComment } from '@/types';
import { api } from '@/lib/api/client';

export type CreateCommentData = {
  text: string;
};

export type UpdateCommentData = {
  text: string;
  id: string;
};

export const commentsEndpoints = {
  // Task comments
  getComments: (slug: string, taskNumber: number) =>
    api.get<ExtendedComment[]>(`/teams/${slug}/tasks/${taskNumber}/comments`),

  createComment: (slug: string, taskNumber: number, data: CreateCommentData) =>
    api.post<ExtendedComment>(
      `/teams/${slug}/tasks/${taskNumber}/comments`,
      data
    ),

  updateComment: (slug: string, taskNumber: number, data: UpdateCommentData) =>
    api.put<ExtendedComment>(
      `/teams/${slug}/tasks/${taskNumber}/comments`,
      data
    ),

  deleteComment: (slug: string, taskNumber: number, id: string) =>
    api.delete<void>(`/teams/${slug}/tasks/${taskNumber}/comments`, {
      data: { id },
    }),
};

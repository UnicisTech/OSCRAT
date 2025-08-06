import { useMutation, useQuery } from '@tanstack/react-query';
import {
  commentsEndpoints,
  CreateCommentData,
  UpdateCommentData,
} from '@/lib/api/endpoints/comments';
import { queryKeys } from '../queryKeys';
import { queryClient } from '.';

// Comments for a task
export function useGetComments(slug: string, taskNumber: string) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
    queryFn: () => commentsEndpoints.getComments(slug, Number(taskNumber)),
  });
}

export function useCreateComment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (data: CreateCommentData) =>
      commentsEndpoints.createComment(slug, Number(taskNumber), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
      });
    },
  });
}

export function useUpdateComment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (data: UpdateCommentData) =>
      commentsEndpoints.updateComment(slug, Number(taskNumber), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
      });
    },
  });
}

export function useDeleteComment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (id: string) =>
      commentsEndpoints.deleteComment(slug, Number(taskNumber), id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
      });
    },
  });
}

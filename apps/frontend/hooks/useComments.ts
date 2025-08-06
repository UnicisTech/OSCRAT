import {
  useGetComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/lib/api/hooks/comments';
import {
  CreateCommentData,
  UpdateCommentData,
} from '@/lib/api/endpoints/comments';

/**
 * Hook to fetch and manage comments for a task
 * @param slug Team slug
 * @param taskNumber Task number
 */
export function useComments(slug: string, taskNumber: string) {
  const {
    data: comments,
    isLoading: isFetching,
    isError,
    error,
  } = useGetComments(slug, taskNumber);

  const createMutation = useCreateComment(slug, taskNumber);
  const updateMutation = useUpdateComment(slug, taskNumber);
  const deleteMutation = useDeleteComment(slug, taskNumber);

  const createComment = async (data: CreateCommentData) => {
    return createMutation.mutateAsync(data);
  };

  const updateComment = async (data: UpdateCommentData) => {
    return updateMutation.mutateAsync(data);
  };

  const deleteComment = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    comments,
    isLoading,
    isError,
    error,
    createComment,
    updateComment,
    deleteComment,
  };
}

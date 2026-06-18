import {
  useListDocumentation,
  useGetDocumentation,
  useCreateDocumentation,
  useUpdateDocumentation,
  useDeleteDocumentation,
  useLinkDocumentationToTask,
  useUnlinkDocumentationFromTask,
} from '@/lib/api/hooks';
import type {
  CreateDocumentationData,
  UpdateDocumentationData,
  DocumentationListFilter,
} from '@/lib/api/endpoints/documentation';

export function useDocumentationList(
  slug: string,
  filter?: DocumentationListFilter
) {
  const {
    data: documentation,
    isLoading,
    isError,
    error,
  } = useListDocumentation(slug, filter);

  const createMutation = useCreateDocumentation(slug);
  const deleteMutation = useDeleteDocumentation(slug);

  const createDocumentation = async (data: CreateDocumentationData) => {
    return createMutation.mutateAsync(data);
  };

  const deleteDocumentation = async (docId: string) => {
    return deleteMutation.mutateAsync(docId);
  };

  return {
    documentation,
    isLoading:
      isLoading || createMutation.isPending || deleteMutation.isPending,
    isError,
    error,
    createDocumentation,
    deleteDocumentation,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useDocumentationDetail(slug: string, docId: string) {
  const {
    data: documentation,
    isLoading,
    isError,
    error,
  } = useGetDocumentation(slug, docId);

  const updateMutation = useUpdateDocumentation(slug, docId);
  const deleteMutation = useDeleteDocumentation(slug);
  const linkTaskMutation = useLinkDocumentationToTask(slug, docId);
  const unlinkTaskMutation = useUnlinkDocumentationFromTask(slug, docId);

  const updateDocumentation = async (data: UpdateDocumentationData) => {
    return updateMutation.mutateAsync(data);
  };

  const deleteDocumentation = async () => {
    return deleteMutation.mutateAsync(docId);
  };

  const linkToTask = async (taskId: number) => {
    return linkTaskMutation.mutateAsync(taskId);
  };

  const unlinkFromTask = async (taskId: number) => {
    return unlinkTaskMutation.mutateAsync(taskId);
  };

  return {
    documentation,
    isLoading, // Only initial data loading - don't block UI for mutations
    isError,
    error,
    updateDocumentation,
    deleteDocumentation,
    linkToTask,
    unlinkFromTask,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLinkingTask: linkTaskMutation.isPending,
    isUnlinkingTask: unlinkTaskMutation.isPending,
  };
}

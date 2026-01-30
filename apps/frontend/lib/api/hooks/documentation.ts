import { useMutation, useQuery } from '@tanstack/react-query';
import {
  documentationEndpoints,
  CreateDocumentationData,
  UpdateDocumentationData,
  DocumentationListFilter,
} from '@/lib/api/endpoints/documentation';
import { queryKeys } from '../queryKeys';
import { queryClient } from '.';

export function useListDocumentation(slug: string, filter?: DocumentationListFilter) {
  return useQuery({
    queryKey: queryKeys.teams.documentation.all(slug, filter),
    queryFn: () => documentationEndpoints.list(slug, filter),
    enabled: !!slug,
  });
}

export function useGetDocumentation(slug: string, docId: string) {
  return useQuery({
    queryKey: queryKeys.teams.documentation.detail(slug, docId),
    queryFn: () => documentationEndpoints.get(slug, docId),
    enabled: !!slug && !!docId,
  });
}

export function useCreateDocumentation(slug: string) {
  return useMutation({
    mutationFn: (data: CreateDocumentationData) =>
      documentationEndpoints.create(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.all(slug),
      });
    },
  });
}

export function useUpdateDocumentation(slug: string, docId: string) {
  return useMutation({
    mutationFn: (data: UpdateDocumentationData) =>
      documentationEndpoints.update(slug, docId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.detail(slug, docId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.all(slug),
      });
    },
  });
}

export function useDeleteDocumentation(slug: string) {
  return useMutation({
    mutationFn: (docId: string) => documentationEndpoints.delete(slug, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.all(slug),
      });
    },
  });
}

export function useLinkDocumentationToTask(slug: string, docId: string) {
  return useMutation({
    mutationFn: (taskId: number) =>
      documentationEndpoints.linkTask(slug, docId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.detail(slug, docId),
      });
    },
  });
}

export function useUnlinkDocumentationFromTask(slug: string, docId: string) {
  return useMutation({
    mutationFn: (taskId: number) =>
      documentationEndpoints.unlinkTask(slug, docId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.documentation.detail(slug, docId),
      });
    },
  });
}

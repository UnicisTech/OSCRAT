import { useQuery, useMutation } from '@tanstack/react-query';
import { docEndpoints } from '@/lib/api/endpoints/oscrat/doc';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';

// CAR Queries
export function useGetCAR(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.car(teamId, versionId),
    queryFn: () => docEndpoints.getCAR(teamId, productId, versionId),
    enabled: options?.enabled !== false,
    retry: false,
  });
}

export function useUploadCAR(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return docEndpoints.uploadCAR(teamId, productId, versionId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.car(teamId, versionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

export function useDeleteCAR(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: () => docEndpoints.deleteCAR(teamId, productId, versionId),
    onSuccess: () => {
      // Immediately clear CAR data from cache
      queryClient.setQueryData(
        queryKeys.oscrat.projects.versions.car(teamId, versionId),
        null
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// DoC Queries
export function useGetDoC(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.doc(teamId, versionId),
    queryFn: () => docEndpoints.getDoC(teamId, productId, versionId),
    enabled: options?.enabled !== false,
    retry: false,
  });
}

export function useUploadDoC(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (params: { file: File; updateStatus?: boolean }) => {
      const formData = new FormData();
      formData.append('file', params.file);
      if (params.updateStatus) {
        formData.append('updateStatus', 'true');
      }
      return docEndpoints.uploadDoC(teamId, productId, versionId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.doc(teamId, versionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

export function useDeleteDoC(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: () => docEndpoints.deleteDoC(teamId, productId, versionId),
    onSuccess: () => {
      // Immediately clear DoC data from cache
      queryClient.setQueryData(
        queryKeys.oscrat.projects.versions.doc(teamId, versionId),
        null
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

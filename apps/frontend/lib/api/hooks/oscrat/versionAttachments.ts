import { useQuery, useMutation } from '@tanstack/react-query';
import { versionAttachmentsEndpoints } from '@/lib/api/endpoints/oscrat/versionAttachments';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';

// Get version attachments
export function useGetVersionAttachments(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.attachments.all(
      teamId,
      versionId
    ),
    queryFn: () =>
      versionAttachmentsEndpoints.getVersionAttachments(
        teamId,
        productId,
        versionId
      ),
  });
}

// Upload version attachment
export function useUploadVersionAttachment(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: { file: File; description?: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.description) {
        formData.append('description', data.description);
      }

      return versionAttachmentsEndpoints.uploadVersionAttachment(
        teamId,
        productId,
        versionId,
        formData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.attachments.all(
          teamId,
          versionId
        ),
      });
    },
  });
}

// Delete version attachment
export function useDeleteVersionAttachment(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      versionAttachmentsEndpoints.deleteVersionAttachment(
        teamId,
        productId,
        versionId,
        attachmentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.attachments.all(
          teamId,
          versionId
        ),
      });
    },
  });
}

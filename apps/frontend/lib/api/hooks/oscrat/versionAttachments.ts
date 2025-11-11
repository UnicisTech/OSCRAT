import { useQuery, useMutation } from '@tanstack/react-query';
import { versionAttachmentsEndpoints } from '@/lib/api/endpoints/oscrat/versionAttachments';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { AttachmentEntityFilters } from '@oscrat/model/types/attachments';

// Get version attachments
export function useGetVersionAttachments(
  teamId: string,
  productId: string,
  versionId: string,
  filters?: AttachmentEntityFilters
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.attachments.all(
      teamId,
      versionId,
      filters
    ),
    queryFn: () =>
      versionAttachmentsEndpoints.getVersionAttachments(
        teamId,
        productId,
        versionId,
        filters
      ),
  });
}

// Upload version attachment
export function useUploadVersionAttachment(
  teamId: string,
  productId: string,
  versionId: string,
  filters?: AttachmentEntityFilters
) {
  return useMutation({
    mutationFn: (data: { file: File; description?: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.description) {
        formData.append('description', data.description);
      }
      if (filters?.vulnerabilityId) {
        formData.append('vulnerabilityId', filters.vulnerabilityId);
      }
      if (filters?.incidentId) {
        formData.append('incidentId', filters.incidentId);
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
          versionId,
          filters
        ),
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.attachments.all(
          teamId,
          versionId
        ),
        exact: false,
      });

      if (filters?.vulnerabilityId) {
          queryClient.invalidateQueries({
          queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.detail(
            teamId,
            versionId,
            filters.vulnerabilityId
          ),
          exact: false,
        });
      }

      if (filters?.incidentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.oscrat.projects.versions.incidents.detail(
            teamId,
            versionId,
            filters.incidentId
          ),
          exact: false,
        });
      }
    },
  });
}

// Delete version attachment
export function useDeleteVersionAttachment(
  teamId: string,
  productId: string,
  versionId: string,
  filters?: AttachmentEntityFilters
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
          versionId,
          filters
        ),
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.attachments.all(
          teamId,
          versionId
        ),
        exact: false,
      });

      if (filters?.vulnerabilityId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.detail(
            teamId,
            versionId,
            filters.vulnerabilityId
          ),
          exact: false,
        });
      }

      if (filters?.incidentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.oscrat.projects.versions.incidents.detail(
            teamId,
            versionId,
            filters.incidentId
          ),
          exact: false,
        });
      }
    },
  });
}

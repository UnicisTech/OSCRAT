import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratAssessmentEndpoints } from '@/lib/api/endpoints/oscrat/assessments';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { OscratAssessmentCreate } from '@oscrat/model';

// List assessments
export function useGetAssessments(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: queryKeys.oscrat.projects.versions.assessments.all(
      teamId,
      versionId
    ),
    queryFn: () => {
      return oscratAssessmentEndpoints.listAssessments(
        teamId,
        productId,
        versionId
      );
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

// Get assessment detail
export function useGetAssessmentDetail(
  teamId: string,
  productId: string,
  versionId: string,
  assessmentId: string
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.assessments.detail(
      teamId,
      versionId,
      assessmentId
    ),
    queryFn: () =>
      oscratAssessmentEndpoints.getAssessmentDetail(
        teamId,
        productId,
        versionId,
        assessmentId
      ),
  });
}

// Create assessment
export function useCreateAssessment(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: OscratAssessmentCreate) =>
      oscratAssessmentEndpoints.createAssessment(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.assessments.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it might include assessment summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
      // Invalidate product-level assessments query
      queryClient.invalidateQueries({
        queryKey: ['oscrat', 'projects', teamId, productId, 'assessments'],
      });
    },
  });
}

// Delete assessment
export function useDeleteAssessment(
  teamId: string,
  productId: string,
  versionId: string,
  assessmentId: string
) {
  return useMutation({
    mutationFn: () =>
      oscratAssessmentEndpoints.deleteAssessment(
        teamId,
        productId,
        versionId,
        assessmentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.assessments.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it might include assessment summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// List assessments for a product
export function useGetProductAssessments(
  slug: string,
  productId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: ['oscrat', 'projects', slug, productId, 'assessments'],
    queryFn: () => {
      return oscratAssessmentEndpoints.listProductAssessments(
        slug,
        productId
      );
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

// Get assessment detail for a product (by productId and assessmentId)
export function useGetProductAssessmentDetail(
  slug: string,
  productId: string,
  assessmentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['oscrat', 'projects', slug, productId, 'assessments', assessmentId],
    queryFn: () =>
      oscratAssessmentEndpoints.getProductAssessmentDetail(
        slug,
        productId,
        assessmentId
      ),
    enabled: options?.enabled !== false && !!assessmentId,
  });
}

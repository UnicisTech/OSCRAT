import {
  useGetCAR,
  useUploadCAR,
  useDeleteCAR,
  useGetDoC,
  useUploadDoC,
  useDeleteDoC,
} from '@/lib/api/hooks/oscrat/doc';
import { docEndpoints } from '@/lib/api/endpoints/oscrat/doc';

/**
 * Hook to manage Declaration of Conformity workflow for a version
 * Includes CAR (Conformity Assessment Report) and DoC management
 */
export function useDeclarationOfConformity(
  teamId: string,
  productId: string,
  versionId: string
) {
  // CAR queries and mutations
  const {
    data: carData,
    isLoading: isLoadingCAR,
    isError: isCarError,
    error: carError,
  } = useGetCAR(teamId, productId, versionId);

  const uploadCARMutation = useUploadCAR(teamId, productId, versionId);
  const deleteCARMutation = useDeleteCAR(teamId, productId, versionId);

  // DoC queries and mutations
  const {
    data: docData,
    isLoading: isLoadingDoC,
    isError: isDocError,
    error: docError,
  } = useGetDoC(teamId, productId, versionId);

  const uploadDoCMutation = useUploadDoC(teamId, productId, versionId);
  const deleteDoCMutation = useDeleteDoC(teamId, productId, versionId);

  const uploadCAR = async (file: File) => {
    return uploadCARMutation.mutateAsync(file);
  };

  const deleteCAR = async () => {
    return deleteCARMutation.mutateAsync();
  };

  const uploadDoC = async (file: File, updateStatus: boolean = false) => {
    return uploadDoCMutation.mutateAsync({ file, updateStatus });
  };

  const deleteDoC = async () => {
    return deleteDoCMutation.mutateAsync();
  };

  const carDownloadUrl = carData?.id
    ? docEndpoints.downloadAttachment(carData.id)
    : '';
  const docDownloadUrl = docData?.id
    ? docEndpoints.downloadAttachment(docData.id)
    : '';

  const isLoading =
    isLoadingCAR ||
    isLoadingDoC ||
    uploadCARMutation.isPending ||
    deleteCARMutation.isPending ||
    uploadDoCMutation.isPending ||
    deleteDoCMutation.isPending;

  return {
    // CAR state
    car: carData,
    hasCAR: !!carData,
    isLoadingCAR,
    isCarError,
    carError,
    carDownloadUrl,
    uploadCAR,
    deleteCAR,
    isUploadingCAR: uploadCARMutation.isPending,

    // DoC state
    doc: docData,
    hasDoC: !!docData,
    isLoadingDoC,
    isDocError,
    docError,
    docDownloadUrl,
    uploadDoC,
    deleteDoC,
    isUploadingDoC: uploadDoCMutation.isPending,

    // Combined state
    isLoading,
  };
}

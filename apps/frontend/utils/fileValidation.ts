import json from '@/components/defaultLanding/data/availableExtensions.json';

const availableExtensions = json['availableExtensions'] as Record<
  string,
  string
>;

export const getFileExtensionFromFileName = (
  fileName: string
): string | null => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }
  return null;
};

export const checkExtensionAndMIMEType = (file: File): boolean => {
  // Reject zero-byte uploads — they pass the extension/MIME check but cause
  // server-side hangs and a stuck client loading state.
  if (file.size <= 0) return false;

  const extension = getFileExtensionFromFileName(file.name);
  if (extension) {
    const isAllowedExtension = availableExtensions[extension];
    const isAllowedType = availableExtensions[extension] === file.type;
    if (isAllowedExtension && isAllowedType) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true when a browser File is empty (0 bytes) and therefore should
 * never be uploaded. Use this for surfaces that need a dedicated empty-file
 * error message instead of relying on a combined extension + size check.
 */
export const isEmptyFile = (file: File): boolean => file.size <= 0;

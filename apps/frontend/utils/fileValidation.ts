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

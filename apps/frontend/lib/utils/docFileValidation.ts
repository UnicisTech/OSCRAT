import formidable from 'formidable';

/**
 * File validation configuration for CAR and DoC documents.
 * CAR = Conformity Assessment Report (PDF, XLS, XLSX)
 * DoC = Declaration of Conformity (PDF only)
 */

// CAR (Conformity Assessment Report) - allows PDF and Excel
export const CAR_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const CAR_EXTENSIONS = ['.pdf', '.xls', '.xlsx'] as const;

// DoC (Declaration of Conformity) - PDF only
export const DOC_MIME_TYPES = ['application/pdf'] as const;
export const DOC_EXTENSIONS = ['.pdf'] as const;

type FileType = 'car' | 'doc';

interface FileValidationConfig {
  mimeTypes: readonly string[];
  extensions: readonly string[];
}

const FILE_CONFIGS: Record<FileType, FileValidationConfig> = {
  car: { mimeTypes: CAR_MIME_TYPES, extensions: CAR_EXTENSIONS },
  doc: { mimeTypes: DOC_MIME_TYPES, extensions: DOC_EXTENSIONS },
};

/**
 * Extract file extension from filename (including the dot)
 */
const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex).toLowerCase() : '';
};

/**
 * Validate a file against allowed types for CAR or DoC
 */
export const validateDocFile = (
  file: formidable.File,
  type: FileType
): boolean => {
  const config = FILE_CONFIGS[type];
  const ext = getFileExtension(file.originalFilename || '');
  const mimeType = file.mimetype || '';

  // Type assertion safe: ext is derived from a filename and checked against known extensions
  const extValid = (config.extensions as readonly string[]).includes(ext);
  const mimeValid = config.mimeTypes.includes(mimeType);

  return extValid || mimeValid;
};

/**
 * Client-side file validation for browser File objects
 */
export const validateBrowserFile = (file: File, type: FileType): boolean => {
  const config = FILE_CONFIGS[type];
  const ext = getFileExtension(file.name);

  const extValid = (config.extensions as readonly string[]).includes(ext);
  const mimeValid = config.mimeTypes.includes(file.type);

  return extValid || mimeValid;
};

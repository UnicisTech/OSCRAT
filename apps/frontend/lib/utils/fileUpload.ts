import formidable from 'formidable';
import { NextApiRequest } from 'next';

// Shared file upload configuration and utilities

// Common allowed file extensions and their MIME types
const ALLOWED_EXTENSIONS: Record<string, string> = {
  // Documents
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  'csv': 'text/csv',
  
  // Data formats
  'json': 'application/json',
  'xml': 'application/xml',
  'yml': 'text/yaml',
  'yaml': 'text/yaml',
  
  // Archives
  'zip': 'application/zip',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  'tgz': 'application/gzip',
  
  // Images (for future use)
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Parse multipart form data from API request
 */
export const parseFormData = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {
    maxFileSize: MAX_FILE_SIZE,
  };
  
  const form = formidable(options);
  
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

/**
 * Extract file extension from filename
 */
const getFileExtension = (filename: string): string | null => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < filename.length - 1) {
    return filename.substring(lastDotIndex + 1).toLowerCase();
  }
  return null;
};

/**
 * Validate file extension and MIME type
 */
export const validateFile = (file: formidable.File): boolean => {
  if (!file.originalFilename || !file.mimetype) {
    return false;
  }

  const extension = getFileExtension(file.originalFilename);
  if (!extension) {
    return false;
  }

  const allowedMimeType = ALLOWED_EXTENSIONS[extension];
  return allowedMimeType === file.mimetype;
};

/**
 * Get MIME type from file extension
 */
export const getMimeTypeFromExtension = (filename: string): string => {
  const extension = getFileExtension(filename);
  return extension ? ALLOWED_EXTENSIONS[extension] || 'application/octet-stream' : 'application/octet-stream';
};

/**
 * File upload interface
 */
export interface FileUploadData {
  filename: string;
  fileData: Buffer;
  fileSize: number;
  mimeType: string;
}

/**
 * Extract file data from formidable file
 */
export const extractFileData = async (file: formidable.File): Promise<FileUploadData> => {
  const fs = await import('fs');
  
  if (!file.originalFilename) {
    throw new Error('No filename provided');
  }

  const fileData = await fs.promises.readFile(file.filepath);
  
  return {
    filename: file.originalFilename,
    fileData,
    fileSize: fileData.length,
    mimeType: file.mimetype || getMimeTypeFromExtension(file.originalFilename),
  };
};

/**
 * Cleanup temporary file
 */
export const cleanupTempFile = async (filepath: string): Promise<void> => {
  const fs = await import('fs');
  try {
    await fs.promises.unlink(filepath);
  } catch (error) {
    // Ignore errors - file might not exist or already cleaned up
    console.warn(`Failed to cleanup temp file ${filepath}:`, error);
  }
};
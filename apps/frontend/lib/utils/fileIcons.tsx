import { FaFileAlt, FaFilePdf, FaFileExcel } from 'react-icons/fa';

/**
 * Returns appropriate file icon component based on MIME type
 */
export const getFileIcon = (mimeType?: string, className = 'h-8 w-8') => {
  if (mimeType === 'application/pdf') {
    return <FaFilePdf className={`${className} text-red-500`} />;
  }
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
    return <FaFileExcel className={`${className} text-green-600`} />;
  }
  return <FaFileAlt className={`${className} text-gray-500`} />;
};

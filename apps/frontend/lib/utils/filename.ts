type DocumentType = 'car' | 'doc';

const DOCUMENT_PREFIXES: Record<DocumentType, string> = {
  car: 'CAR',
  doc: 'DoC',
};

const formatDateForFilename = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const sanitizeForFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Generates a standardized filename for document PDFs (CAR or DoC)
 */
export const generateDocumentFilename = (
  type: DocumentType,
  productName: string,
  date?: Date
): string => {
  const prefix = DOCUMENT_PREFIXES[type];
  const sanitized = sanitizeForFilename(productName);
  const dateStr = formatDateForFilename(date ?? new Date());
  return `${prefix}_${sanitized}_${dateStr}.pdf`;
};

/**
 * @deprecated Use generateDocumentFilename('car', productName, date) instead
 */
export const generateCARFilename = (productName: string, date?: Date): string => {
  return generateDocumentFilename('car', productName, date);
};

/**
 * @deprecated Use generateDocumentFilename('doc', productName, date) instead
 */
export const generateDoCFilename = (productName: string, date?: Date): string => {
  return generateDocumentFilename('doc', productName, date);
};

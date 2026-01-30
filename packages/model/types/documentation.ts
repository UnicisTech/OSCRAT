import type {
  DocumentationVisibility,
  DocumentationStatus,
} from '@prisma/client';

export interface DocumentationSummary {
  id: string;
  slug: string;
  title: string;
  visibility: DocumentationVisibility;
  status: DocumentationStatus;
  version: number;
  productId: string | null;
  productName?: string;
  versionId: string | null;
  versionName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName?: string;
}

export interface DocumentationDetails extends DocumentationSummary {
  content: string;
  updatedBy: string;
  updatedByName?: string;
  linkedTasks?: LinkedTaskSummary[];
  attachments?: DocumentationAttachment[];
}

export interface LinkedTaskSummary {
  taskId: number;
  taskNumber: number;
  title: string;
  status: string;
}

export interface DocumentationAttachment {
  id: string;
  name: string;
  fileSize: number;
  mimeType: string | null;
  createdAt: Date;
}

/** Common fields for documentation input */
export interface DocumentationInputBase {
  title?: string;
  content?: string;
  visibility?: DocumentationVisibility;
  status?: DocumentationStatus;
}

export interface CreateDocumentationInput extends DocumentationInputBase {
  title: string; // Required for create
  productId?: string;
  versionId?: string;
}

export interface UpdateDocumentationInput extends DocumentationInputBase {}

export interface DocumentationFilter {
  status?: DocumentationStatus;
  visibility?: DocumentationVisibility;
  productId?: string;
  versionId?: string;
}

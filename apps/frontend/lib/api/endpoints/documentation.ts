import { api } from '@/lib/api/client';
import type {
  DocumentationSummary,
  DocumentationDetails,
  DocumentationStatus,
  DocumentationVisibility,
} from '@oscrat/model';

export type CreateDocumentationData = {
  title: string;
  content?: string;
  visibility?: DocumentationVisibility;
  status?: DocumentationStatus;
  productId?: string;
  versionId?: string;
};

export type UpdateDocumentationData = {
  title?: string;
  content?: string;
  visibility?: DocumentationVisibility;
  status?: DocumentationStatus;
};

export type DocumentationListFilter = {
  status?: DocumentationStatus;
  visibility?: DocumentationVisibility;
  productId?: string;
  versionId?: string;
};

export const documentationEndpoints = {
  list: (slug: string, filter?: DocumentationListFilter) =>
    api.get<DocumentationSummary[]>(`/teams/${slug}/documentation`, { params: filter }),

  get: (slug: string, docId: string) =>
    api.get<DocumentationDetails>(`/teams/${slug}/documentation/${docId}`),

  create: (slug: string, data: CreateDocumentationData) =>
    api.post<DocumentationDetails>(`/teams/${slug}/documentation`, data),

  update: (slug: string, docId: string, data: UpdateDocumentationData) =>
    api.put<DocumentationDetails>(`/teams/${slug}/documentation/${docId}`, data),

  delete: (slug: string, docId: string) =>
    api.delete<void>(`/teams/${slug}/documentation/${docId}`),

  linkTask: (slug: string, docId: string, taskId: number) =>
    api.post<{ linked: boolean }>(`/teams/${slug}/documentation/${docId}/tasks`, { taskId }),

  unlinkTask: (slug: string, docId: string, taskId: number) =>
    api.delete<{ unlinked: boolean }>(`/teams/${slug}/documentation/${docId}/tasks`, {
      data: { taskId },
    }),

  getPublic: (teamSlug: string, docSlug: string) =>
    api.get<PublicDocumentation>(`/teams/${teamSlug}/public/documentation/${docSlug}`),

  getPublicProduct: (teamSlug: string, productId: string, versionId: string, docSlug: string) =>
    api.get<PublicProductDocumentation>(
      `/teams/${teamSlug}/public/products/${productId}/versions/${versionId}/documentation/${docSlug}`
    ),
};

export interface PublicDocumentation {
  id: string;
  slug: string;
  title: string;
  content: string;
  version: number;
  productName?: string;
  versionName?: string;
  updatedAt: Date;
}

export interface PublicProductDocumentation {
  id: string;
  slug: string;
  title: string;
  content: string;
  version: number;
  productId: string;
  productName: string;
  versionId: string;
  versionName: string;
  updatedAt: Date;
}

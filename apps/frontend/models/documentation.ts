import { prisma } from '@/lib/prisma';
import * as DocOps from '@oscrat/model/operations';
import type {
  CreateDocumentationInput,
  UpdateDocumentationInput,
  DocumentationFilter,
  AuditInfo,
} from '@oscrat/model';

export const createDocumentation = (
  teamId: string,
  userId: string,
  input: CreateDocumentationInput,
  audit: AuditInfo
) => DocOps.createDocumentation(prisma, teamId, userId, input, audit);

export const updateDocumentation = (
  teamId: string,
  documentationId: string,
  userId: string,
  input: UpdateDocumentationInput,
  audit: AuditInfo
) => DocOps.updateDocumentation(prisma, teamId, documentationId, userId, input, audit);

export const deleteDocumentation = (
  teamId: string,
  documentationId: string,
  audit: AuditInfo
) => DocOps.deleteDocumentation(prisma, teamId, documentationId, audit);

export const getDocumentation = (teamId: string, documentationId: string) =>
  DocOps.getDocumentation(prisma, teamId, { id: documentationId });

export const listDocumentation = (teamId: string, filter?: DocumentationFilter) =>
  DocOps.listDocumentation(prisma, teamId, filter);

export const linkDocumentationToTask = (
  teamId: string,
  documentationId: string,
  taskId: number,
  audit: AuditInfo
) => DocOps.linkDocumentationToTask(prisma, teamId, documentationId, taskId, audit);

export const unlinkDocumentationFromTask = (
  teamId: string,
  documentationId: string,
  taskId: number,
  audit: AuditInfo
) => DocOps.unlinkDocumentationFromTask(prisma, teamId, documentationId, taskId, audit);

export const getPublicDocumentation = (
  teamSlug: string,
  docSlug: string,
  options?: DocOps.PublicDocumentationOptions
) => DocOps.getPublicDocumentation(prisma, teamSlug, docSlug, options);

export const getDocumentationsForTask = (teamId: string, taskId: number) =>
  DocOps.getDocumentationsForTask(prisma, teamId, taskId);

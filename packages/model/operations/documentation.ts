import {
  PrismaClient,
  DocumentationVisibility,
  DocumentationStatus,
  type Prisma,
} from '@prisma/client';
import {
  createAuditContextWithTx,
  logCreate,
  logUpdate,
  logDelete,
  CrudType,
  EntityType,
  type AuditInfo,
} from '../audit';
import { slugify } from '../utils/slugify';
import { nanoid } from 'nanoid';
import type {
  DocumentationSummary,
  DocumentationDetails,
  CreateDocumentationInput,
  UpdateDocumentationInput,
  DocumentationFilter,
} from '../types/documentation';

const summaryInclude = {
  product: {
    select: { id: true, name: true },
  },
  productVersion: {
    select: { id: true, version: true },
  },
  createdByUser: {
    select: { id: true, name: true },
  },
} satisfies Prisma.DocumentationInclude;

const detailInclude = {
  ...summaryInclude,
  updatedByUser: {
    select: { id: true, name: true },
  },
  linkedTasks: {
    include: {
      task: {
        select: {
          id: true,
          taskNumber: true,
          title: true,
          status: true,
        },
      },
    },
  },
  attachments: {
    select: {
      id: true,
      name: true,
      fileSize: true,
      mimeType: true,
      createdAt: true,
    },
  },
} satisfies Prisma.DocumentationInclude;

type DocumentationSummaryResult = Prisma.DocumentationGetPayload<{
  include: typeof summaryInclude;
}>;

type DocumentationDetailResult = Prisma.DocumentationGetPayload<{
  include: typeof detailInclude;
}>;

const toSummary = (doc: DocumentationSummaryResult | DocumentationDetailResult): DocumentationSummary => ({
  id: doc.id,
  slug: doc.slug,
  title: doc.title,
  visibility: doc.visibility,
  status: doc.status,
  version: doc.version,
  productId: doc.productId,
  productName: doc.product?.name,
  versionId: doc.versionId,
  versionName: doc.productVersion?.version,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  createdBy: doc.createdBy,
  createdByName: doc.createdByUser?.name,
});

type LinkedTaskResult = {
  task: {
    id: number;
    taskNumber: number;
    title: string;
    status: string;
  };
};

type AttachmentResult = {
  id: string;
  name: string;
  fileSize: number;
  mimeType: string | null;
  createdAt: Date;
};

const toDetails = (doc: DocumentationDetailResult): DocumentationDetails => ({
  ...toSummary(doc),
  content: doc.content,
  updatedBy: doc.updatedBy,
  updatedByName: doc.updatedByUser?.name,
  linkedTasks: doc.linkedTasks?.map((lt: LinkedTaskResult) => ({
    taskId: lt.task.id,
    taskNumber: lt.task.taskNumber,
    title: lt.task.title,
    status: lt.task.status,
  })),
  attachments: doc.attachments?.map((a: AttachmentResult) => ({
    id: a.id,
    name: a.name,
    fileSize: a.fileSize,
    mimeType: a.mimeType,
    createdAt: a.createdAt,
  })),
});

const generateSlug = (title: string): string => {
  return `${slugify(title)}-${nanoid(8)}`;
};

export const createDocumentation = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  input: CreateDocumentationInput,
  auditInfo: AuditInfo
): Promise<DocumentationDetails> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existingDoc = await tx.documentation.findFirst({
      where: {
        teamId,
        title: input.title,
        productId: input.productId || null,
        versionId: input.versionId || null,
      },
    });
    if (existingDoc) {
      throw new Error('A documentation with this title already exists');
    }

    const slug = generateSlug(input.title);

    // Let FK constraints handle product/version validation - insert will fail if IDs are invalid
    const doc = await tx.documentation.create({
      data: {
        slug,
        title: input.title,
        content: input.content || '',
        visibility: input.visibility || DocumentationVisibility.PRIVATE,
        status: input.status || DocumentationStatus.DRAFT,
        teamId,
        productId: input.productId || null,
        versionId: input.versionId || null,
        createdBy: userId,
        updatedBy: userId,
      },
      include: detailInclude,
    });

    await logCreate(EntityType.Documentation, audit, { id: doc.id, name: doc.title });

    return toDetails(doc);
  });
};

export const updateDocumentation = async (
  prisma: PrismaClient,
  teamId: string,
  documentationId: string,
  userId: string,
  input: UpdateDocumentationInput,
  auditInfo: AuditInfo
): Promise<DocumentationDetails | null> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existing = await tx.documentation.findFirst({
      where: { id: documentationId, teamId },
      include: detailInclude,
    });

    if (!existing) {
      return null;
    }

    if (existing.status === DocumentationStatus.ARCHIVED) {
      throw new Error('Archived documentation cannot be modified');
    }

    // Check title uniqueness if title is being changed
    if (input.title !== undefined && input.title !== existing.title) {
      const duplicateDoc = await tx.documentation.findFirst({
        where: {
          teamId,
          title: input.title,
          productId: existing.productId,
          versionId: existing.versionId,
          id: { not: documentationId },
        },
      });
      if (duplicateDoc) {
        throw new Error('A documentation with this title already exists');
      }
    }

    // Increment version on substantive changes (content or title)
    const contentChanged = input.content !== undefined && input.content !== existing.content;
    const titleChanged = input.title !== undefined && input.title !== existing.title;
    const shouldIncrementVersion = contentChanged || titleChanged;

    const doc = await tx.documentation.update({
      where: { id: documentationId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.visibility !== undefined && { visibility: input.visibility }),
        ...(input.status !== undefined && { status: input.status }),
        ...(shouldIncrementVersion && { version: { increment: 1 } }),
        updatedBy: userId,
      },
      include: detailInclude,
    });

    await logUpdate(
      EntityType.Documentation,
      audit,
      { id: existing.id, name: existing.title },
      { id: doc.id, name: doc.title }
    );

    return toDetails(doc);
  });
};

export const deleteDocumentation = async (
  prisma: PrismaClient,
  teamId: string,
  documentationId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    // Will throw if not found - let Prisma handle it
    const deleted = await tx.documentation.delete({
      where: { id: documentationId, teamId },
      select: { id: true, title: true, productId: true, versionId: true },
    });

    await logDelete(EntityType.Documentation, audit, { ...deleted, name: deleted.title });
  });
};

export interface GetDocumentationOptions {
  id?: string;
  slug?: string;
}

/**
 * Get documentation by ID or slug (authenticated, requires teamId).
 */
export const getDocumentation = async (
  prisma: PrismaClient,
  teamId: string,
  options: GetDocumentationOptions
): Promise<DocumentationDetails | null> => {
  const where: Prisma.DocumentationWhereInput = { teamId };

  if (options.id) where.id = options.id;
  if (options.slug) where.slug = options.slug;

  const doc = await prisma.documentation.findFirst({
    where,
    include: detailInclude,
  });

  return doc ? toDetails(doc) : null;
};

export interface ListDocumentationFilter {
  status?: DocumentationStatus;
  visibility?: DocumentationVisibility;
  productId?: string;
  versionId?: string;
}

export const listDocumentation = async (
  prisma: PrismaClient,
  teamId: string,
  filter?: ListDocumentationFilter
): Promise<DocumentationSummary[]> => {
  const where: Prisma.DocumentationWhereInput = {
    teamId,
    ...(filter?.status && { status: filter.status }),
    ...(filter?.visibility && { visibility: filter.visibility }),
    ...(filter?.productId && { productId: filter.productId }),
    ...(filter?.versionId && { versionId: filter.versionId }),
  };

  const docs = await prisma.documentation.findMany({
    where,
    include: summaryInclude,
    orderBy: { createdAt: 'desc' },
  });

  return docs.map(toSummary);
};

export const linkDocumentationToTask = async (
  prisma: PrismaClient,
  teamId: string,
  documentationId: string,
  taskId: number,
  auditInfo: AuditInfo
): Promise<void> => {
  // Wrap the raw mutation and its audit log in a single transaction so the
  // link and audit row commit (or roll back) together, preventing data/audit
  // divergence if the audit write fails.
  await prisma.$transaction(async (tx) => {
    // FK constraints will fail if doc/task don't exist or don't belong to team
    // Using raw SQL to verify teamId ownership in a single query
    const affected = await tx.$executeRaw`
      INSERT INTO "DocumentationTask" ("id", "documentationId", "taskId", "createdAt")
      SELECT gen_random_uuid(), d.id, t.id, NOW()
      FROM "Documentation" d, "Task" t
      WHERE d.id = ${documentationId} AND d."teamId" = ${teamId}
        AND t.id = ${taskId} AND t."teamId" = ${teamId}
      ON CONFLICT ("documentationId", "taskId") DO NOTHING
    `;

    // Only audit when a new link was actually created (idempotent no-op otherwise)
    if (affected > 0) {
      const doc = await tx.documentation.findFirst({
        where: { id: documentationId, teamId },
        select: { id: true, title: true, productId: true, versionId: true },
      });
      if (doc) {
        const audit = createAuditContextWithTx(tx, auditInfo);
        await audit.log({
          action: 'documentation.link',
          crud: CrudType.Update,
          user: audit.user,
          team: audit.team,
          target: { id: doc.id, name: doc.title, type: EntityType.Documentation },
          productId: doc.productId ?? audit.productId,
          versionId: doc.versionId ?? audit.versionId,
          metadata: { taskId: String(taskId) },
        });
      }
    }
  });
};

export const unlinkDocumentationFromTask = async (
  prisma: PrismaClient,
  teamId: string,
  documentationId: string,
  taskId: number,
  auditInfo: AuditInfo
): Promise<void> => {
  // Wrap the raw mutation and its audit log in a single transaction so the
  // unlink and audit row commit (or roll back) together, preventing data/audit
  // divergence if the audit write fails.
  await prisma.$transaction(async (tx) => {
    // Capture name before unlink for a readable audit entry
    const doc = await tx.documentation.findFirst({
      where: { id: documentationId, teamId },
      select: { id: true, title: true, productId: true, versionId: true },
    });

    // Delete only if both doc and task belong to team
    const affected = await tx.$executeRaw`
      DELETE FROM "DocumentationTask" dt
      USING "Documentation" d, "Task" t
      WHERE dt."documentationId" = d.id AND dt."taskId" = t.id
        AND d.id = ${documentationId} AND d."teamId" = ${teamId}
        AND t.id = ${taskId} AND t."teamId" = ${teamId}
    `;

    if (affected > 0 && doc) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await audit.log({
        action: 'documentation.unlink',
        crud: CrudType.Update,
        user: audit.user,
        team: audit.team,
        target: { id: doc.id, name: doc.title, type: EntityType.Documentation },
        productId: doc.productId ?? audit.productId,
        versionId: doc.versionId ?? audit.versionId,
        metadata: { taskId: String(taskId) },
      });
    }
  });
};

export interface PublicDocumentationOptions {
  productId?: string;
  versionId?: string;
  /** If true, includes content field (for rendering). Default: false */
  includeContent?: boolean;
}

/**
 * Get public documentation by team slug and doc slug.
 * Only returns PUBLISHED + PUBLIC documentation.
 */
export const getPublicDocumentation = async (
  prisma: PrismaClient,
  teamSlug: string,
  docSlug: string,
  options?: PublicDocumentationOptions
): Promise<DocumentationDetails | DocumentationSummary | null> => {
  const where: Prisma.DocumentationWhereInput = {
    slug: docSlug,
    team: { slug: teamSlug },
    visibility: DocumentationVisibility.PUBLIC,
    status: DocumentationStatus.PUBLISHED,
    ...(options?.productId && { productId: options.productId }),
    ...(options?.versionId && { versionId: options.versionId }),
  };

  const includeContent = options?.includeContent ?? false;
  const doc = await prisma.documentation.findFirst({
    where,
    include: includeContent ? detailInclude : summaryInclude,
  });

  if (!doc) return null;
  return includeContent ? toDetails(doc as DocumentationDetailResult) : toSummary(doc);
};

export interface LinkedDocumentationSummary {
  id: string;
  slug: string;
  title: string;
  status: DocumentationStatus;
  visibility: DocumentationVisibility;
  productName?: string;
  versionName?: string;
  updatedAt: Date;
}

export const getDocumentationsForTask = async (
  prisma: PrismaClient,
  teamId: string,
  taskId: number
): Promise<LinkedDocumentationSummary[]> => {
  const links = await prisma.documentationTask.findMany({
    where: {
      taskId,
      documentation: {
        teamId,
      },
    },
    include: {
      documentation: {
        include: {
          product: {
            select: { name: true },
          },
          productVersion: {
            select: { version: true },
          },
        },
      },
    },
  });

  return links.map((link) => ({
    id: link.documentation.id,
    slug: link.documentation.slug,
    title: link.documentation.title,
    status: link.documentation.status,
    visibility: link.documentation.visibility,
    productName: link.documentation.product?.name,
    versionName: link.documentation.productVersion?.version,
    updatedAt: link.documentation.updatedAt,
  }));
};

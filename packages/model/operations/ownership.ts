import { Prisma } from '@prisma/client';

export const assertVersionInTeam = async (
  tx: Prisma.TransactionClient,
  versionId: string | null | undefined,
  teamId: string,
  productId?: string
): Promise<void> => {
  if (!versionId) return;
  const version = await tx.oscratProductVersion.findFirst({
    where: { id: versionId, teamId, ...(productId ? { productId } : {}) },
    select: { id: true },
  });
  if (!version) {
    throw new Error('Version not found or does not belong to team');
  }
};

export const assertProductInTeam = async (
  tx: Prisma.TransactionClient,
  productId: string | null | undefined,
  teamId: string
): Promise<void> => {
  if (!productId) return;
  const product = await tx.oscratProduct.findFirst({
    where: { id: productId, teamId },
    select: { id: true },
  });
  if (!product) {
    throw new Error('Product not found or does not belong to team');
  }
};

export const assertTeamMember = async (
  tx: Prisma.TransactionClient,
  teamId: string,
  userId: string | null | undefined
): Promise<void> => {
  if (!userId) return;
  const member = await tx.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { id: true },
  });
  if (!member) {
    throw new Error('Assignee is not a member of the team');
  }
};

export interface OwnershipRefs {
  product?: string | null;
  version?: string | null;
  member?: string | null;
}

export const assertOwnership = async (
  tx: Prisma.TransactionClient,
  teamId: string,
  refs: OwnershipRefs
): Promise<void> => {
  await assertProductInTeam(tx, refs.product, teamId);
  await assertVersionInTeam(tx, refs.version, teamId);
  await assertTeamMember(tx, teamId, refs.member);
};

export const assertVulnerabilityInVersion = async (
  tx: Prisma.TransactionClient,
  vulnerabilityId: string | null | undefined,
  versionId: string
): Promise<void> => {
  if (!vulnerabilityId) return;
  const vulnerability = await tx.oscratProductVulnerability.findFirst({
    where: { id: vulnerabilityId, versionId },
    select: { id: true },
  });
  if (!vulnerability) {
    throw new Error('Vulnerability does not belong to the version');
  }
};

export const assertIncidentInVersion = async (
  tx: Prisma.TransactionClient,
  incidentId: string | null | undefined,
  versionId: string
): Promise<void> => {
  if (!incidentId) return;
  const incident = await tx.oscratProductIncident.findFirst({
    where: { id: incidentId, versionId },
    select: { id: true },
  });
  if (!incident) {
    throw new Error('Incident does not belong to the version');
  }
};

export const assertSbomReportInVersion = async (
  tx: Prisma.TransactionClient,
  sbomReportId: string | null | undefined,
  versionId: string
): Promise<void> => {
  if (!sbomReportId) return;
  const sbomReport = await tx.sbomReport.findFirst({
    where: { id: sbomReportId, versionId },
    select: { id: true },
  });
  if (!sbomReport) {
    throw new Error(
      'Source SBOM report not found or does not belong to the version'
    );
  }
};

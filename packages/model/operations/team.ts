import {
  PrismaClient,
  Team as PrismaTeam,
  type Prisma,
  Role,
  OscratOrganizationType,
  OscratOrganizationSize,
  OscratOrganizationRole,
  OscratProductIncidentStatus,
  OscratProductVulnerabilityStatus,
} from '@prisma/client';
import type {
  Team,
  TeamSummary,
  TeamDetail,
  TeamCreateData,
  TeamUpdate,
  TeamWithProducts,
  TeamMemberSummary,
  TeamMemberDetail,
} from '../types/team';
import type {
  OscratProductSummary,
  OscratProductDetail,
} from '../types/product';

/** Include for team summary queries */
const TEAM_SUMMARY_INCLUDE = {
  _count: {
    select: { members: true },
  },
};

/** Include for team detail queries */
const TEAM_DETAIL_INCLUDE = {};

/** Include for team with product summaries (lightweight with counts) */
const TEAM_WITH_PRODUCTS_SUMMARY_INCLUDE = {
  products: {
    include: {
      reportingOrganizations: true,
      _count: {
        select: {
          versions: true,
        },
      },
      versions: {
        select: {
          id: true,
          status: true,
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
          vulnerabilities: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  },
};

/** Include for team member queries */
const TEAM_MEMBER_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
  team: {
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      taskIndex: true,
      defaultRole: true,
      properties: true,
      type: true,
      size: true,
      orgRoles: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { members: true },
      },
    },
  },
};

/** Transform Prisma product to ProductSummary (lightweight with counts) */
const transformToProductSummary = (product: any): OscratProductSummary => {
  const versions = product.versions || [];
  const activeVersionsCount = versions.filter(
    (v: any) => v.status === 'ACTIVE'
  ).length;
  const totalOpenIncidents = versions.reduce((sum: number, v: any) => {
    const openIncidents = (v.incidents || []).filter(
      (i: any) => i.status === 'NOT_REPORTED'
    ).length;
    return sum + openIncidents;
  }, 0);
  const totalOpenVulnerabilities = versions.reduce((sum: number, v: any) => {
    const openVulns = (v.vulnerabilities || []).filter(
      (vuln: any) =>
        vuln.status === 'OPEN' || vuln.status === 'ACTIVELY_EXPLOITED'
    ).length;
    return sum + openVulns;
  }, 0);

  return {
    id: product.id,
    name: product.name,
    type: product.type,
    productCategory: product.productCategory,
    complianceStatus: product.complianceStatus,
    reportingOrganizations:
      product.reportingOrganizations?.map((org: any) => org.acronym) || [],
    versionsCount: product._count?.versions || 0,
    activeVersionsCount,
    totalOpenIncidents,
    totalOpenVulnerabilities,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    createdBy: product.createdBy,
    updatedBy: product.updatedBy,
  };
};

/** Transform Prisma product to ProductDetail (full data with relations) */
const transformToProductDetail = (product: any): OscratProductDetail => ({
  id: product.id,
  name: product.name,
  type: product.type,
  productCategory: product.productCategory,
  complianceStatus: product.complianceStatus,
  reportingOrganizations: product.reportingOrganizations || [],
  versions:
    product.versions?.map((version: any) => ({
      id: version.id,
      version: version.version,
      status: version.status,
      productId: version.productId,
      openIncidents: (version.incidents || []).filter(
        (i: any) => i.status === 'NOT_REPORTED'
      ).length,
      openVulnerabilities: (version.vulnerabilities || []).filter(
        (vuln: any) =>
          vuln.status === 'OPEN' || vuln.status === 'ACTIVELY_EXPLOITED'
      ).length,
      hasRepository: !!version.repository,
      sbomReportsCount: version._count?.sbomReports || 0,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      createdBy: version.createdBy,
      updatedBy: version.updatedBy,
    })) || [],
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  createdBy: product.createdBy,
  updatedBy: product.updatedBy,
});

/** Transform Prisma team to basic Team */
const transformToTeam = (team: PrismaTeam): Team => ({
  id: team.id,
  name: team.name,
  slug: team.slug,
  domain: team.domain,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

/** Transform Prisma team to TeamSummary */
const transformToTeamSummary = (
  team: Prisma.TeamGetPayload<{
    include: typeof TEAM_SUMMARY_INCLUDE;
  }>
): TeamSummary => ({
  id: team.id,
  name: team.name,
  slug: team.slug,
  domain: team.domain,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
  membersCount: team._count?.members || 0,
});

/** Transform Prisma team to TeamDetail */
const transformToTeamDetail = (team: PrismaTeam): TeamDetail => ({
  id: team.id,
  name: team.name,
  slug: team.slug,
  domain: team.domain,
  taskIndex: team.taskIndex,
  defaultRole: team.defaultRole,
  properties: team.properties as Record<string, any>,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
  // Organization fields
  type: team.type,
  size: team.size,
  orgRoles: team.orgRoles,
  // Additional organization contact fields
  taxId: team.taxId,
  postalAddress: team.postalAddress,
  contactEmail: team.contactEmail,
  contactPhone: team.contactPhone,
  additionalInformation: team.additionalInformation,
});

/** Transform Prisma team member to TeamMemberSummary */
const transformToTeamMemberSummary = (
  member: Prisma.TeamMemberGetPayload<{
    include: {
      user: { select: { id: true; name: true; email: true; image: true } };
    };
  }>
): TeamMemberSummary => ({
  id: member.id,
  userId: member.userId,
  teamId: member.teamId,
  role: member.role,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
  user: {
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    image: member.user.image || undefined,
  },
});

/** Transform Prisma team member to TeamMemberDetail */
const transformToTeamMemberDetail = (
  member: Prisma.TeamMemberGetPayload<{
    include: typeof TEAM_MEMBER_INCLUDE;
  }>
): TeamMemberDetail => ({
  id: member.id,
  userId: member.userId,
  teamId: member.teamId,
  role: member.role,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
  user: {
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    image: member.user.image || undefined,
  },
  team: {
    id: member.team.id,
    name: member.team.name,
    slug: member.team.slug,
    domain: member.team.domain,
    taskIndex: member.team.taskIndex,
    defaultRole: member.team.defaultRole,
    properties: member.team.properties as Record<string, any>,
    type: member.team.type,
    size: member.team.size,
    orgRoles: member.team.orgRoles,
    createdAt: member.team.createdAt,
    updatedAt: member.team.updatedAt,
  },
});

/** Create a new team with initial owner */
export const createTeam = async (
  prisma: PrismaClient,
  data: TeamCreateData
): Promise<TeamDetail> => {
  const {
    userId,
    name,
    slug,
    domain,
    type,
    size,
    orgRoles,
    taxId,
    postalAddress,
    contactEmail,
    contactPhone,
    additionalInformation,
  } = data;

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      domain,
      type: type ?? OscratOrganizationType.OTHER,
      size: size ?? OscratOrganizationSize.STARTUP,
      orgRoles: orgRoles ?? [OscratOrganizationRole.MANUFACTURER],
      taxId,
      postalAddress,
      contactEmail,
      contactPhone,
      additionalInformation,
    },
  });

  // Add creator as owner
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId,
      role: Role.OWNER,
    },
  });

  return transformToTeamDetail(team);
};

/** Get basic team by ID or slug */
export const getTeam = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string }
): Promise<Team | null> => {
  const team = await prisma.team.findUnique({
    where: key,
  });

  return team ? transformToTeam(team) : null;
};

/** Get full team details by ID or slug */
export const getTeamDetail = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string }
): Promise<TeamDetail | null> => {
  const team = await prisma.team.findUnique({
    where: key,
  });

  return team ? transformToTeamDetail(team) : null;
};

/** Update team information */
export const updateTeam = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string },
  data: TeamUpdate
): Promise<Team> => {
  const team = await prisma.team.update({
    where: key,
    data,
  });

  return transformToTeam(team);
};

/** Delete a team */
export const deleteTeam = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string }
): Promise<void> => {
  await prisma.team.delete({
    where: key,
  });
};

/** Get teams for a user */
export const getTeams = async (
  prisma: PrismaClient,
  userId: string
): Promise<TeamSummary[]> => {
  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: TEAM_SUMMARY_INCLUDE,
  });

  return teams.map(transformToTeamSummary);
};

/** Get teams owned by a user */
export const getOwnedTeams = async (
  prisma: PrismaClient,
  userId: string
): Promise<TeamSummary[]> => {
  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
          role: Role.OWNER,
        },
      },
    },
    include: TEAM_SUMMARY_INCLUDE,
  });

  return teams.map(transformToTeamSummary);
};

/** Add a member to a team */
export const addTeamMember = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  role: Role
): Promise<TeamMemberSummary> => {
  const member = await prisma.teamMember.upsert({
    create: {
      teamId,
      userId,
      role,
    },
    update: {
      role,
    },
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return transformToTeamMemberSummary(member);
};

/** Remove a member from a team */
export const removeTeamMember = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string
): Promise<void> => {
  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });
};

/** Get team members by team slug */
export const getTeamMembers = async (
  prisma: PrismaClient,
  slug: string
): Promise<TeamMemberSummary[]> => {
  const members = await prisma.teamMember.findMany({
    where: {
      team: {
        slug,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return members.map(transformToTeamMemberSummary);
};

/** Get team member by user ID and team slug */
export const getTeamMember = async (
  prisma: PrismaClient,
  userId: string,
  slug: string
): Promise<TeamMemberDetail | null> => {
  const member = await prisma.teamMember.findFirst({
    where: {
      userId,
      team: {
        slug,
      },
      role: {
        in: [Role.ADMIN, Role.MEMBER, Role.OWNER, Role.AUDITOR],
      },
    },
    include: TEAM_MEMBER_INCLUDE,
  });

  return member ? transformToTeamMemberDetail(member) : null;
};

/** Get team roles for a user */
export const getTeamRoles = async (
  prisma: PrismaClient,
  userId: string
): Promise<Array<{ teamId: string; role: Role }>> => {
  const teamRoles = await prisma.teamMember.findMany({
    where: {
      userId,
    },
    select: {
      teamId: true,
      role: true,
    },
  });

  return teamRoles;
};

/** Check if user is a team member */
export const isTeamMember = async (
  prisma: PrismaClient,
  userId: string,
  teamId: string
): Promise<boolean> => {
  const member = await prisma.teamMember.findFirst({
    where: {
      userId,
      teamId,
    },
  });

  return member
    ? member.role === Role.MEMBER ||
        member.role === Role.OWNER ||
        member.role === Role.ADMIN
    : false;
};

/** Check if user is team admin or owner */
export const isTeamAdmin = async (
  prisma: PrismaClient,
  userId: string,
  teamId: string
): Promise<boolean> => {
  const member = await prisma.teamMember.findFirst({
    where: {
      userId,
      teamId,
    },
  });

  return member
    ? member.role === Role.ADMIN || member.role === Role.OWNER
    : false;
};

/** Check if team exists with given conditions */
export const isTeamExists = async (
  prisma: PrismaClient,
  condition: Array<Record<string, any>>
): Promise<boolean> => {
  const count = await prisma.team.count({
    where: {
      OR: condition,
    },
  });

  return count > 0;
};

/** Increment task index for a team */
export const incrementTaskIndex = async (
  prisma: PrismaClient,
  teamId: string
): Promise<boolean> => {
  try {
    await prisma.team.update({
      where: { id: teamId },
      data: { taskIndex: { increment: 1 } },
    });
    return true;
  } catch (error) {
    return false;
  }
};

/** Get team with product summaries (lightweight) */
export const getTeamWithProductsSummary = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string }
): Promise<TeamWithProducts | null> => {
  const team = await prisma.team.findUnique({
    where: key,
    include: TEAM_WITH_PRODUCTS_SUMMARY_INCLUDE,
  });

  if (!team) return null;

  return {
    ...transformToTeamDetail(team),
    products: team.products.map(transformToProductSummary),
  };
};

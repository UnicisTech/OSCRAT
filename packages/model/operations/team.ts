import {
  PrismaClient,
  Team as PrismaTeam,
  type Prisma,
  Role,
  OscratOrganizationType,
  OscratOrganizationSize,
  OscratOrganizationRole,
} from '@prisma/client';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';
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
import { transformToProductSummary } from './product';
import { OPEN_INCIDENT_STATUSES } from '../types/incidents';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';

/** Include for team summary queries */
const TEAM_SUMMARY_INCLUDE = {
  _count: {
    select: { members: true },
  },
};

/** Include for team detail queries */
const TEAM_DETAIL_INCLUDE = {
  reportingOrganizations: true,
};

/** Include for team with products */
const TEAM_WITH_PRODUCTS_INCLUDE = {
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
          _count: {
            select: {
              incidents: {
                where: {
                  status: {
                    in: OPEN_INCIDENT_STATUSES,
                  },
                },
              },
              vulnerabilities: {
                where: {
                  status: {
                    in: OPEN_VULNERABILITY_STATUSES,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

/** Include for team member queries */
const TEAM_MEMBER_INCLUDE = {
  team: {
    select: {
      name: true,
      slug: true,
    },
  },
};

/** Type aliases for better maintainability */
type TeamSummaryPayload = Prisma.TeamGetPayload<{
  include: typeof TEAM_SUMMARY_INCLUDE;
}>;

type TeamDetailPayload = Prisma.TeamGetPayload<{
  include: typeof TEAM_DETAIL_INCLUDE;
}>;

type TeamMemberSummaryPayload = Prisma.TeamMemberGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true; image: true } };
  };
}>;

type TeamMemberDetailPayload = Prisma.TeamMemberGetPayload<{
  include: typeof TEAM_MEMBER_INCLUDE;
}>;

type TeamWithProductsPayload = Prisma.TeamGetPayload<{
  include: typeof TEAM_WITH_PRODUCTS_INCLUDE & typeof TEAM_DETAIL_INCLUDE;
}>;

// Transform functions
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
const transformToTeamSummary = (team: TeamSummaryPayload): TeamSummary => ({
  id: team.id,
  name: team.name,
  slug: team.slug,
  domain: team.domain,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
  membersCount: team._count?.members || 0,
});

/** Transform Prisma team to TeamDetail */
const transformToTeamDetail = (team: TeamDetailPayload): TeamDetail => ({
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
  reportingOrganizations: team.reportingOrganizations || [],
});

/** Transform Prisma team member to TeamMemberSummary */
const transformToTeamMemberSummary = (
  member: TeamMemberSummaryPayload
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
  member: TeamMemberDetailPayload
): TeamMemberDetail => ({
  id: member.id,
  userId: member.userId,
  teamId: member.teamId,
  teamSlug: member.team.slug,
  teamName: member.team.name,
  role: member.role,
});

// Team CRUD operations
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
      size: size ?? OscratOrganizationSize.SMALL_ENTERPRISE,
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

  // Fetch team with includes to populate relations
  const teamWithIncludes = await prisma.team.findUniqueOrThrow({
    where: { id: team.id },
    include: TEAM_DETAIL_INCLUDE,
  });

  return transformToTeamDetail(teamWithIncludes);
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
    include: TEAM_DETAIL_INCLUDE,
  });

  return team ? transformToTeamDetail(team) : null;
};

/** Update team information */
export const updateTeam = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string },
  data: TeamUpdate,
  auditInfo?: AuditInfo
): Promise<Team> => {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.team.findUnique({ where: key });

    if (!existing) {
      throw new Error('Team not found');
    }

    const team = await tx.team.update({
      where: key,
      data,
    });

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await logUpdate(EntityType.Team, audit, existing, team);
    }

    return transformToTeam(team);
  });
};

/** Delete a team */
export const deleteTeam = async (
  prisma: PrismaClient,
  key: { id: string } | { slug: string },
  auditInfo?: AuditInfo
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({
      where: key,
      select: { id: true, name: true },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await logDelete(EntityType.Team, audit, team);
    }

    await tx.team.delete({
      where: key,
    });
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

// Team member operations
/** Add a member to a team */
export const addTeamMember = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  role: Role,
  auditInfo: AuditInfo
): Promise<TeamMemberSummary> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const member = await tx.teamMember.upsert({
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

    await logCreate(EntityType.TeamMember, audit, {
      id: member.id,
      name: member.user.name || member.user.email || userId,
      role: member.role,
    });

    return transformToTeamMemberSummary(member);
  });
};

/** Remove a member from a team */
export const removeTeamMember = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const member = await tx.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!member) {
      throw new Error('Team member not found');
    }

    await logDelete(EntityType.TeamMember, audit, {
      id: member.id,
      name: member.user.name || member.user.email || userId,
    });

    await tx.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
  });
};

export const updateTeamMemberRole = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  role: Role,
  auditInfo: AuditInfo
): Promise<TeamMemberSummary> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existing = await tx.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!existing) {
      throw new Error('Team member not found');
    }

    const member = await tx.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: {
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    await logUpdate(EntityType.TeamMember, audit,
      { id: existing.id, name: existing.user.name || existing.user.email || userId, role: existing.role, userId },
      { id: member.id, name: member.user.name || member.user.email || userId, role: member.role, userId }
    );

    return transformToTeamMemberSummary(member);
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

// Utility functions
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
  condition: Array<Prisma.TeamWhereInput>
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
    include: {
      ...TEAM_DETAIL_INCLUDE,
      ...TEAM_WITH_PRODUCTS_INCLUDE,
    },
  });

  if (!team) return null;

  return {
    ...transformToTeamDetail(team),
    products: team.products.map(transformToProductSummary),
  };
};

/** Update the awareness training completion timestamp for a team member */
export const updateLastAwarenessTrainingCompletion = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string,
  date: Date
) => {
  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { lastAwarenessTrainingCompletion: date },
  });
};

/** Find team members who have never completed training or whose last completion is overdue */
export const getAwarenessTrainingOverdueMembers = async (
  prisma: PrismaClient,
  thresholdDate: Date
) => {
  return prisma.teamMember.findMany({
    where: {
      OR: [
        { lastAwarenessTrainingCompletion: null },
        { lastAwarenessTrainingCompletion: { lt: thresholdDate } },
      ],
    },
    include: {
      user: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, slug: true } },
    },
  });
};

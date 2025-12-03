import { PrismaClient, type Prisma } from '@prisma/client';
import type {
  TeamData,
  TeamDataSummary,
  TeamDataDetail,
  TeamDataCreate,
  TeamDataUpdate,
} from '../types/teamData';

const parseJsonPayload = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch {
    throw new Error('Invalid JSON payload');
  }
};

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
};

const TEAM_DATA_DETAIL_INCLUDE = {
  updatedByUser: { select: USER_SELECT },
};

type TeamDataDetailPayload = Prisma.TeamDataGetPayload<{
  include: typeof TEAM_DATA_DETAIL_INCLUDE;
}>;

const transformToTeamData = (
  data: Prisma.TeamDataGetPayload<{}>
): TeamData => ({
  id: data.id,
  dataKey: data.dataKey,
  payload: JSON.stringify(data.payload),
  teamId: data.teamId,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  updatedBy: data.updatedBy,
});

const transformToTeamDataSummary = (
  data: Prisma.TeamDataGetPayload<{}>
): TeamDataSummary => ({
  id: data.id,
  dataKey: data.dataKey,
  teamId: data.teamId,
  updatedAt: data.updatedAt,
});

const transformToTeamDataDetail = (
  data: TeamDataDetailPayload
): TeamDataDetail => ({
  id: data.id,
  dataKey: data.dataKey,
  payload: JSON.stringify(data.payload),
  teamId: data.teamId,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  updatedBy: data.updatedBy,
  updatedByUser: {
    id: data.updatedByUser.id,
    name: data.updatedByUser.name,
    email: data.updatedByUser.email,
  },
});

export const getTeamData = async (
  prisma: PrismaClient,
  teamId: string,
  dataKey: string
): Promise<TeamDataDetail | null> => {
  const normalizedKey = dataKey.toLowerCase();
  console.log(`[TeamData Operations] get: teamId=${teamId}, dataKey=${normalizedKey}`);

  const data = await prisma.teamData.findUnique({
    where: {
      teamId_dataKey: {
        teamId,
        dataKey: normalizedKey,
      },
    },
    include: TEAM_DATA_DETAIL_INCLUDE,
  });

  return data ? transformToTeamDataDetail(data) : null;
};

export const listTeamData = async (
  prisma: PrismaClient,
  teamId: string
): Promise<TeamDataSummary[]> => {
  console.log(`[TeamData Operations] list: teamId=${teamId}`);
  const dataList = await prisma.teamData.findMany({
    where: { teamId },
    orderBy: { dataKey: 'asc' },
  });

  return dataList.map(transformToTeamDataSummary);
};

export const upsertTeamData = async (
  prisma: PrismaClient,
  teamId: string,
  createData: TeamDataCreate
): Promise<TeamData> => {
  const { dataKey, payload, updatedBy } = createData;
  const normalizedKey = dataKey.toLowerCase();
  console.log(`[TeamData Operations] upsert: teamId=${teamId}, dataKey=${normalizedKey}`);

  const parsedPayload = parseJsonPayload(payload);

  const result = await prisma.teamData.upsert({
    where: {
      teamId_dataKey: {
        teamId,
        dataKey: normalizedKey,
      },
    },
    create: {
      teamId,
      dataKey: normalizedKey,
      payload: parsedPayload,
      updatedBy,
    },
    update: {
      payload: parsedPayload,
      updatedBy,
    },
  });

  return transformToTeamData(result);
};

export const updateTeamData = async (
  prisma: PrismaClient,
  teamId: string,
  dataKey: string,
  updateData: TeamDataUpdate
): Promise<TeamData> => {
  const normalizedKey = dataKey.toLowerCase();
  console.log(`[TeamData Operations] update: teamId=${teamId}, dataKey=${normalizedKey}`);
  const parsedPayload = parseJsonPayload(updateData.payload);

  const result = await prisma.teamData.update({
    where: {
      teamId_dataKey: {
        teamId,
        dataKey: normalizedKey,
      },
    },
    data: {
      payload: parsedPayload,
      updatedBy: updateData.updatedBy,
    },
  });

  return transformToTeamData(result);
};

export const deleteTeamData = async (
  prisma: PrismaClient,
  teamId: string,
  dataKey: string
): Promise<void> => {
  const normalizedKey = dataKey.toLowerCase();
  console.log(`[TeamData Operations] delete: teamId=${teamId}, dataKey=${normalizedKey}`);

  await prisma.teamData.delete({
    where: {
      teamId_dataKey: {
        teamId,
        dataKey: normalizedKey,
      },
    },
  });
};

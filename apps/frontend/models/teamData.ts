import { prisma } from '@/lib/prisma';
import * as TeamDataOps from '@oscrat/model/operations';
import type {
  TeamDataCreate,
  TeamDataUpdate,
} from '@oscrat/model/types/teamData';

export const getTeamData = async (teamId: string, dataKey: string) => {
  return await TeamDataOps.getTeamData(prisma, teamId, dataKey);
};

export const listTeamData = async (teamId: string) => {
  return await TeamDataOps.listTeamData(prisma, teamId);
};

export const upsertTeamData = async (teamId: string, data: TeamDataCreate) => {
  return await TeamDataOps.upsertTeamData(prisma, teamId, data);
};

export const updateTeamData = async (
  teamId: string,
  dataKey: string,
  data: TeamDataUpdate
) => {
  return await TeamDataOps.updateTeamData(prisma, teamId, dataKey, data);
};

export const deleteTeamData = async (teamId: string, dataKey: string) => {
  return await TeamDataOps.deleteTeamData(prisma, teamId, dataKey);
};

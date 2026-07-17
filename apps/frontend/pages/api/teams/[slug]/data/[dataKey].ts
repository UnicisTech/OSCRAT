import { getTeamData, updateTeamData, deleteTeamData } from 'models/teamData';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import type { TeamDataUpdate } from '@oscrat/model/types/teamData';
import { teamDataUpdateSchema } from '@/lib/validation/teamData';
import { validateRequest } from '@/lib/validation/validateRequest';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'GET, PUT, DELETE');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { dataKey } = req.query as { dataKey: string };

  const data = await getTeamData(teamMember.teamId, dataKey);

  if (!data) {
    throw new ApiError(404, 'Organization data not found');
  }

  res.json({ data });
};

const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;
  const { dataKey } = req.query as { dataKey: string };

  const validatedData = await validateRequest(teamDataUpdateSchema, req.body);

  const updateData: TeamDataUpdate = {
    payload: validatedData.payload,
    updatedBy: user.id,
  };

  const result = await updateTeamData(teamMember.teamId, dataKey, updateData);

  res.json({ data: result });
};

const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { dataKey } = req.query as { dataKey: string };

  await deleteTeamData(teamMember.teamId, dataKey);

  res.json({ data: {} });
};

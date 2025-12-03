import { listTeamData, upsertTeamData } from 'models/teamData';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import type { TeamDataCreate } from '@oscrat/model/types/teamData';
import { teamDataCreateSchema } from '@/lib/validation/teamData';
import * as Yup from 'yup';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'update'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const dataList = await listTeamData(teamMember.teamId);

  res.json({ data: dataList });
};

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  try {
    const validatedData = await teamDataCreateSchema.validate(req.body);

    const createData: TeamDataCreate = {
      dataKey: validatedData.dataKey,
      payload: validatedData.payload,
      updatedBy: user.id,
    };

    const result = await upsertTeamData(teamMember.teamId, createData);

    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
};

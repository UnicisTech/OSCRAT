import { slugify } from '@oscrat/model/utils/slugify';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeams, isTeamExists } from 'models/team';
import {
  withTeamAuth,
  withUserAuth,
  type AuthenticatedTeamRequest,
  type AuthenticatedUserRequest,
} from '@/lib/middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { TeamCreateData, TeamCreateRequest } from '@oscrat/model';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withUserAuth()(handleGET)(req, res);
    case 'POST':
      return withUserAuth()(handlePOST)(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get teams
const handleGET = async (
  req: AuthenticatedUserRequest,
  res: NextApiResponse
) => {
  const { user } = req.userContext;

  const teams = await getTeams(user.id);

  recordMetric('team.fetched');

  res.status(200).json({ data: teams });
};

// Create a team
const handlePOST = async (
  req: AuthenticatedUserRequest,
  res: NextApiResponse
) => {
  const requestData: TeamCreateRequest = req.body;
  const { user } = req.userContext;

  const slug = slugify(requestData.name);

  if (await isTeamExists([{ slug }])) {
    throw new ApiError(400, 'A team with the name already exists.');
  }

  const teamData: TeamCreateData = {
    userId: user.id,
    name: requestData.name,
    slug,
    type: requestData.type,
    size: requestData.size,
    taxId: requestData.taxId,
    postalAddress: requestData.postalAddress,
    contactEmail: requestData.contactEmail,
    contactPhone: requestData.contactPhone,
    additionalInformation: requestData.additionalInformation,
  };

  const team = await createTeam(teamData);

  console.log(
    `[Team] created, teamId: ${team.id}, name: ${requestData.name}, slug: ${slug}, ownerId: ${user.id}`
  );

  recordMetric('team.created');

  res.status(200).json({ data: team });
};

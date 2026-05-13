import { slugify } from '@oscrat/model/utils/slugify';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeams } from 'models/team';
import { ensureAwarenessTrainingTask } from 'models/task';
import {
  withUserAuth,
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

  // Check if user already belongs to a team with this slug
  const userTeams = await getTeams(user.id);
  const teamExists = userTeams.some(team => team.slug === slug);
  
  if (teamExists) {
    throw new ApiError(400, 'You already have a team with this name.');
  }

  const teamData: TeamCreateData = {
    userId: user.id,
    name: requestData.name,
    slug,
    type: requestData.type,
    size: requestData.size,
    orgRoles: [requestData.orgRole],
    taxId: requestData.taxId,
    postalAddress: requestData.postalAddress,
    contactEmail: requestData.contactEmail,
    contactPhone: requestData.contactPhone,
    additionalInformation: requestData.additionalInformation,
  };

  let team;
  try {
    team = await createTeam(teamData);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint failed on the fields: (`slug`)')) {
      throw new ApiError(400, 'This team name is already taken. Please choose a different name.');
    }
    throw error;
  }

  console.log(
    `[Team] created, teamId: ${team.id}, name: ${requestData.name}, slug: ${slug}, ownerId: ${user.id}`
  );

  ensureAwarenessTrainingTask(team.id, user.id, user.name!, {
    user: { id: user.id, name: user.name },
    team: { id: team.id, name: team.name },
  }).catch((err) =>
    console.error('[Awareness] Failed to create training task on team create:', err)
  );

  recordMetric('team.created');

  res.status(200).json({ data: team });
};

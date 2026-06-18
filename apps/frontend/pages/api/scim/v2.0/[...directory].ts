import { hashPassword } from '@/lib/auth';
import { createRandomString, extractAuthToken } from '@/lib/common';
import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { prisma } from '@/lib/prisma';
import type {
  DirectorySyncEvent,
  DirectorySyncRequest,
} from '@boxyhq/saml-jackson';
import { Role } from '@oscrat/model';
import { addTeamMember, getTeam } from 'models/team';
import { ensureAwarenessTrainingTask } from 'models/task';
import { deleteUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!env.teamFeatures.dsync) {
    res.status(404).json({ error: { message: 'Not Found' } });
  }

  const { directorySync } = await jackson();

  const { method, query, body } = req;

  const directory = query.directory as string[];
  const [directoryId, path, resourceId] = directory;

  // Handle the SCIM API requests
  const request: DirectorySyncRequest = {
    method: method as string,
    body: body ? JSON.parse(body) : undefined,
    directoryId,
    resourceId,
    resourceType: path === 'Users' ? 'users' : 'groups',
    apiSecret: extractAuthToken(req),
    query: {
      count: req.query.count ? parseInt(req.query.count as string) : undefined,
      startIndex: req.query.startIndex
        ? parseInt(req.query.startIndex as string)
        : undefined,
      filter: req.query.filter as string,
    },
  };

  const { status, data } = await directorySync.requests.handle(
    request,
    handleEvents
  );

  res.status(status).json(data);
}

// Handle the SCIM events
const handleEvents = async (event: DirectorySyncEvent) => {
  const { event: action, tenant: teamId, data } = event;

  // User has been created
  if (action === 'user.created' && 'email' in data) {
    const team = await getTeam({ id: teamId });
    if (!team) return;

    const userName = `${data.first_name} ${data.last_name}`;
    const user = await prisma.user.upsert({
      where: {
        email: data.email,
      },
      update: {
        name: userName,
        firstName: data.first_name,
        lastName: data.last_name,
      },
      create: {
        name: userName,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        password: await hashPassword(createRandomString()),
      },
    });

    const auditInfo = {
      user: { id: user.id, name: userName },
      team: { id: teamId, name: team.name },
    };
    await addTeamMember(teamId, user.id, Role.MEMBER, auditInfo);
    ensureAwarenessTrainingTask(teamId, user.id, userName, auditInfo).catch(
      (err) =>
        console.error(
          '[Awareness] Failed to create training task on SCIM create:',
          err
        )
    );
  }

  // User has been updated
  if (action === 'user.updated' && 'email' in data) {
    if (data.active === true) {
      const team = await getTeam({ id: teamId });
      if (!team) return;

      const userName = `${data.first_name} ${data.last_name}`;
      const user = await prisma.user.upsert({
        where: {
          email: data.email,
        },
        update: {
          name: userName,
          firstName: data.first_name,
          lastName: data.last_name,
        },
        create: {
          name: userName,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          password: await hashPassword(createRandomString()),
        },
      });

      const auditInfo = {
        user: { id: user.id, name: userName },
        team: { id: teamId, name: team.name },
      };
      await addTeamMember(teamId, user.id, Role.MEMBER, auditInfo);
      ensureAwarenessTrainingTask(teamId, user.id, userName, auditInfo).catch(
        (err) =>
          console.error(
            '[Awareness] Failed to create training task on SCIM update:',
            err
          )
      );

      return;
    }

    const user = await getUser({ email: data.email });

    if (!user) {
      return;
    }

    if (data.active === false) {
      await deleteUser({ id: user.id });
    }
  }

  // User has been removed
  if (action === 'user.deleted' && 'email' in data) {
    await deleteUser({ email: data.email });
  }
};

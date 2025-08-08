import { prisma } from '@/lib/prisma';
import { getCscStatusesProp, getCscControlsProp } from '@/lib/csc';
import { findOrCreateApp } from '@/lib/svix';
import { Role } from '@oscrat/model';
import * as TeamOps from '@oscrat/model/operations';
import { controls } from '@/components/defaultLanding/data/configs/csc';
import type { TeamProperties, TaskProperties, ISO } from 'types';
import type { Session } from 'next-auth';

export const createTeam = async (param: {
  userId: string;
  name: string;
  slug: string;
}) => {
  const { userId, name, slug } = param;

  console.log(
    `[Team] creating team record, name: ${name}, slug: ${slug}, userId: ${userId}`
  );
  const team = await TeamOps.createTeam(prisma, { userId, name, slug });

  try {
    await findOrCreateApp(team.name, team.id);
    console.log(`[Team] svix app created successfully, teamId: ${team.id}`);
  } catch (error: any) {
    console.log(
      `[Team] svix app creation failed, teamId: ${team.id}, error: ${error.message}`
    );
  }

  return team;
};

export const getTeam = async (key: { id: string } | { slug: string }) => {
  return await TeamOps.getTeam(prisma, key);
};

export const getTeamDetail = async (key: { id: string } | { slug: string }) => {
  return await TeamOps.getTeamDetail(prisma, key);
};

export const deleteTeam = async (key: { id: string } | { slug: string }) => {
  return await TeamOps.deleteTeam(prisma, key);
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: Role
) => {
  return await TeamOps.addTeamMember(prisma, teamId, userId, role);
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  return await TeamOps.removeTeamMember(prisma, teamId, userId);
};

export const getTeams = async (userId: string) => {
  return await TeamOps.getTeams(prisma, userId);
};

export const getOwnedTeams = async (userId: string) => {
  return await TeamOps.getOwnedTeams(prisma, userId);
};

// Check if the user is a member of the team
export async function isTeamMember(userId: string, teamId: string) {
  return await TeamOps.isTeamMember(prisma, userId, teamId);
}

export async function getTeamRoles(userId: string) {
  return await TeamOps.getTeamRoles(prisma, userId);
}

// Check if the user is an admin or owner of the team
export async function isTeamAdmin(userId: string, teamId: string) {
  return await TeamOps.isTeamAdmin(prisma, userId, teamId);
}

export const getTeamMembers = async (slug: string) => {
  return await TeamOps.getTeamMembers(prisma, slug);
};

export const updateTeam = async (slug: string, data: any) => {
  return await TeamOps.updateTeam(prisma, { slug }, data);
};

export const isTeamExists = async (condition: any) => {
  return await TeamOps.isTeamExists(prisma, condition);
};

// Get the current user's team member object
export const getTeamMember = async (userId: string, slug: string) => {
  return await TeamOps.getTeamMember(prisma, userId, slug);
};

export const incrementTaskIndex = async (teamId: string) => {
  return await TeamOps.incrementTaskIndex(prisma, teamId);
};

// Get team with product summaries (lightweight)
export const getTeamWithProducts = async (slug: string) => {
  return await TeamOps.getTeamWithProductsSummary(prisma, { slug });
};

// Get products for a team (throws if team not found)
export const getTeamProducts = async (slug: string) => {
  const teamWithProducts = await TeamOps.getTeamWithProductsSummary(prisma, { slug });
  
  if (!teamWithProducts) {
    throw new Error(`Team with slug '${slug}' not found`);
  }
  
  return teamWithProducts.products;
};


export const getCscStatusesBySlug = async (slug: string) => {
  const team = await prisma.team.findUniqueOrThrow({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};
  const iso = teamProperties.csc_iso || 'default';
  const cscStatusesProp = getCscStatusesProp(iso);

  if (teamProperties[cscStatusesProp]) {
    return teamProperties[cscStatusesProp];
  }

  const initial = {};
  controls[iso].forEach((control) => (initial[control.Control] = 'Unknown'));

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: {
        ...teamProperties,
        [cscStatusesProp]: initial,
      },
    },
  });

  return initial;
};

export const setCscStatus = async ({
  slug,
  control,
  value,
}: {
  slug: string;
  control: string;
  value: string;
}) => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};

  const iso = teamProperties.csc_iso || 'default';

  const cscStatusesProp = getCscStatusesProp(iso);

  const cscStatuses = { ...teamProperties[cscStatusesProp] };
  cscStatuses[control] = value;

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: {
        ...teamProperties,
        [cscStatusesProp]: cscStatuses,
      },
    },
  });

  return cscStatuses;
};

export const getCscIso = async ({
  slug,
}: {
  slug: string;
}): Promise<string> => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};

  if (teamProperties?.csc_iso) {
    return teamProperties?.csc_iso;
  }

  const initial = 'default';

  const updatedProperties = {
    ...teamProperties,
    csc_iso: initial,
  };

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: updatedProperties,
    },
  });

  return initial;
};

export const setCscIso = async ({
  slug,
  iso,
}: {
  slug: string;
  iso: string;
}) => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};

  const updatedProperties = {
    ...teamProperties,
    csc_iso: iso,
  };

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: updatedProperties,
    },
  });

  return iso;
};

// CSC Control Operations - Server-side only
export const addControlsToIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const cscStatusesProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  let csc_controls = taskProperties?.[cscStatusesProp];

  if (typeof csc_controls === 'undefined') {
    csc_controls = [...controls];
  } else {
    csc_controls = [...csc_controls, ...controls];
  }
  taskProperties[cscStatusesProp] = csc_controls;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  for (const control of controls) {
    await addAuditLog({
      taskId,
      user,
      event: 'added',
      prevValue: null,
      nextValue: control,
      taskProperties,
    });
  }
};

export const removeControlsFromIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const cscStatusesProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  const csc_controls = taskProperties?.[cscStatusesProp] as Array<string>;
  const new_csc_controls = csc_controls.filter(
    (item) => !controls.includes(item)
  );
  taskProperties[cscStatusesProp] = new_csc_controls;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  for (const control of controls) {
    await addAuditLog({
      taskId,
      user,
      event: 'removed',
      prevValue: null,
      nextValue: control,
      taskProperties,
    });
  }
};

export const changeControlInIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
  const [oldControl, newControl] = controls;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const cscStatusesProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  const csc_controls = taskProperties?.[cscStatusesProp] as Array<string>;

  const new_csc_controls = csc_controls.map((control) => {
    if (control === oldControl) {
      return newControl;
    } else {
      return control;
    }
  });

  taskProperties[cscStatusesProp] = new_csc_controls;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  await addAuditLog({
    taskId,
    user,
    event: 'changed',
    prevValue: oldControl,
    nextValue: newControl,
    taskProperties,
  });
};

export const addAuditLog = async (params: {
  taskId: number;
  user: Session['user'];
  event: string;
  prevValue: string | null;
  nextValue: string;
  taskProperties: TaskProperties;
}) => {
  const { taskId, user, event, prevValue, nextValue, taskProperties } = params;

  const auditLog = {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: {
      prevValue: prevValue,
      nextValue: nextValue,
    },
  };

  let csc_audit_logs = taskProperties?.csc_audit_logs;

  if (typeof csc_audit_logs === 'undefined') {
    csc_audit_logs = [auditLog];
  } else {
    csc_audit_logs = [...csc_audit_logs, auditLog];
  }

  taskProperties.csc_audit_logs = csc_audit_logs;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });
};

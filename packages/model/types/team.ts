import type { Role } from '@prisma/client';

/** Basic team information */
export interface Team {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Team summary for listings */
export interface TeamSummary extends Team {
  membersCount: number;
}

/** Full team information */
export interface TeamDetail extends Team {
  taskIndex: number;
  defaultRole: Role;
  properties: Record<string, any>;
}

/** Team member summary for listings */
export interface TeamMemberSummary {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

/** Full team member information */
export interface TeamMemberDetail extends TeamMemberSummary {
  team: TeamDetail;
}

/** Interface for creating a new team */
export interface TeamCreate {
  name: string;
  slug: string;
  domain?: string;
  userId: string; // Creator user ID
}

/** Interface for updating a team */
export interface TeamUpdate {
  name?: string;
  slug?: string;
  domain?: string;
  taskIndex?: number;
  properties?: Record<string, any>;
}

/** Interface for team member operations */
export interface TeamMemberCreate {
  teamId: string;
  userId: string;
  role: Role;
}

export interface TeamMemberUpdate {
  role: Role;
}
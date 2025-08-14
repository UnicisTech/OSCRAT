import type {
  Role,
  OscratOrganizationType,
  OscratOrganizationSize,
  OscratOrganizationRole,
} from '@prisma/client';
import type { OscratProductSummary } from './product';

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

  type: OscratOrganizationType;
  size: OscratOrganizationSize;
  orgRoles: OscratOrganizationRole[];

  taxId?: string | null;
  postalAddress?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  additionalInformation?: string | null;
}

/** Team with products for organization view */
export interface TeamWithProducts extends TeamDetail {
  products: OscratProductSummary[];
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

export interface TeamCreateRequest {
  name: string;
  type?: OscratOrganizationType;
  size?: OscratOrganizationSize;
  taxId?: string;
  postalAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  additionalInformation?: string;
}

export interface TeamCreateData {
  name: string;
  slug: string;
  domain?: string;
  userId: string;

  type?: OscratOrganizationType;
  size?: OscratOrganizationSize;
  orgRoles?: OscratOrganizationRole[];

  taxId?: string;
  postalAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  additionalInformation?: string;
}

/** Interface for updating team settings via API (user-editable fields only) */
export interface TeamSettingsUpdate {
  name?: string;
  domain?: string;
  type?: OscratOrganizationType;
  size?: OscratOrganizationSize;
  orgRoles?: OscratOrganizationRole[];

  taxId?: string;
  postalAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  additionalInformation?: string;
}

export interface TeamUpdate extends TeamSettingsUpdate {
  slug?: string;
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

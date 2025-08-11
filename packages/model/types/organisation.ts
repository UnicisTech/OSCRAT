import {
  OscratOrganizationRole,
  OscratOrganizationType,
  OscratOrganizationSize,
} from '@prisma/client';
import { OscratProductSummary, OscratProductDetail } from './product';

// API response types
export interface OscratOrganizationSummary {
  id: string;
  name: string;
  type: OscratOrganizationType;
  size: OscratOrganizationSize;
  roles: OscratOrganizationRole[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  products: OscratProductSummary[];
}

export interface OscratOrganizationDetail {
  id: string;
  name: string;
  type: OscratOrganizationType;
  size: OscratOrganizationSize;
  roles: OscratOrganizationRole[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  products: OscratProductDetail[];
  reportingOrganizations: string[];
}

// Input types - simplified using Prisma generated types
export interface OscratOrganizationCreate {
  name: string;
  type: OscratOrganizationType;
  size: OscratOrganizationSize;
  roles: OscratOrganizationRole[];
  createdBy: string;
}

export interface OscratOrganizationUpdate {
  name?: string;
  type?: OscratOrganizationType;
  size?: OscratOrganizationSize;
  roles?: OscratOrganizationRole[];
  updatedBy: string;
}

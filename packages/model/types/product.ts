import {
  OscratProductType,
  OscratProductCategory,
  OscratProductStatus,
  OscratProductComplianceStatus,
  OscratReportingOrganization,
} from '@prisma/client';
import { OscratProductVersionSummary } from './version';

export interface OscratProductSummary {
  id: string;
  name: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  complianceStatus: OscratProductComplianceStatus;
  externalReportingAcronyms: OscratReportingOrganization[];
  versionsCount: number;
  activeVersionsCount: number;
  totalOpenIncidents: number;
  totalOpenVulnerabilities: number;
  status: OscratProductStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductDetail {
  id: string;
  name: string;
  organizationId: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  complianceStatus: OscratProductComplianceStatus;
  externalReportingAcronyms: OscratReportingOrganization[];
  versions: OscratProductVersionSummary[];
  status: OscratProductStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductCreate {
  name: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  createdBy: string;
}

export interface OscratProductUpdate {
  name?: string;
  type?: OscratProductType;
  description?: string;
  productCategory?: OscratProductCategory;
  complianceStatus?: OscratProductComplianceStatus;
  status: OscratProductStatus;
  reportingOrganizations?: OscratReportingOrganization[];
  updatedBy: string;
}

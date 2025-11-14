import {
  OscratProductType,
  OscratProductCategory,
  OscratProductStatus,
  OscratProductComplianceStatus,
  OscratProductVersionStatus,
  OscratReportingOrganization,
} from '@prisma/client';
import { OscratProductVersionSummary } from './version';

export interface OscratProductSummary {
  id: string;
  name: string;
  acronym: string;
  description: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  complianceStatus: OscratProductComplianceStatus;
  reportingOrganizations: string[];
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
  acronym: string;
  description: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  complianceStatus: OscratProductComplianceStatus;
  reportingOrganizations: OscratReportingOrganization[];
  versions: OscratProductVersionSummary[];
  status: OscratProductStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductCreate {
  name: string;
  acronym: string;
  description?: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  createdBy: string;
  initialVersion?: {
    version: string;
    status: OscratProductVersionStatus;
  };
}

export interface OscratProductUpdate {
  name?: string;
  acronym?: string;
  type?: OscratProductType;
  description?: string;
  productCategory?: OscratProductCategory;
  complianceStatus?: OscratProductComplianceStatus;
  status: OscratProductStatus;
  reportingOrganizations?: OscratReportingOrganization[];
  updatedBy: string;
}

export interface OscratProductSearchRequest {
  productIds?: string[];
  includeVersions?: boolean;
  includeDetails?: boolean;
}

export interface OscratProductSearchResult {
  id: string;
  name: string;
  complianceStatus?: OscratProductComplianceStatus;
  versions: {
    id: string;
    version: string;
    status?: OscratProductVersionStatus;
    openIncidents?: number;
    openVulnerabilities?: number;
    sbomReportsCount?: number;
  }[];
}

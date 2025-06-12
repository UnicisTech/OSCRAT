import {
  OscratProductVulnerabilitySeverity,
  OscratProductVulnerabilityStatus,
} from '@prisma/client';

export interface OscratVulnerabilitySummary {
  id: string;
  name: string;
  severity: OscratProductVulnerabilitySeverity;
  status: OscratProductVulnerabilityStatus;
  cve?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratVulnerabilityCreate {
  name: string;
  description: string;
  severity: OscratProductVulnerabilitySeverity;
  status: OscratProductVulnerabilityStatus;
  cve?: string;
  createdBy: string;
}

export interface OscratVulnerabilityUpdate {
  name?: string;
  description?: string;
  severity?: OscratProductVulnerabilitySeverity;
  status?: OscratProductVulnerabilityStatus;
  cve?: string;
  updatedBy: string;
}

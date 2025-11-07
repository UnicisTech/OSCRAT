import { OscratProductVersionStatus } from '@prisma/client';
import { OscratVulnerabilitySummary } from './vulnerabilities';
import { OscratIncidentSummary } from './incidents';
import { OscratAssessmentSummary } from './assessment';

export interface OscratProductVersionSummary {
  id: string;
  version: string;
  status: OscratProductVersionStatus;
  supportEndDate?: Date;
  productId: string;
  openIncidents: number;
  openVulnerabilities: number;
  hasRepository: boolean;
  sbomReportsCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductVersionDetail {
  id: string;
  version: string;
  status: OscratProductVersionStatus;
  supportEndDate?: Date;
  productId: string;
  incidents: OscratIncidentSummary[];
  vulnerabilities: OscratVulnerabilitySummary[];
  assessments: OscratAssessmentSummary[];
  repository?: {
    id: string;
    name: string;
    provider: string;
    repositoryUrl: string;
    targetBranch?: string;
    targetTag?: string;
    targetCommit?: string;
  };
  sbomReportsCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductVersionCreate {
  version: string;
  status?: OscratProductVersionStatus;
  supportEndDate?: Date;
  productId: string;
  createdBy: string;
}

export interface OscratProductVersionUpdate {
  version?: string;
  status?: OscratProductVersionStatus;
  supportEndDate?: Date;
  updatedBy?: string;
}

import { OscratProductVersionStatus, Attachment } from '@prisma/client'
import { OscratVulnerabilitySummary } from './vulnerabilities';
import { OscratIncidentSummary } from './incidents';
import { OscratAssessmentSummary } from './assessment';

export interface OscratProductVersionSummary {
  id: string;
  version: string;
  status: OscratProductVersionStatus;
  releaseDate?: Date;
  supportEndDate?: Date;
  productId: string;
  openIncidents: number;
  openVulnerabilities: number;
  openTasks: number;
  hasRepository: boolean;
  sbomReportsCount: number;
  hasConformityAssessmentReport: boolean;
  hasDeclarationOfConformity: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductVersionDetail {
  id: string;
  version: string;
  status: OscratProductVersionStatus;
  releaseDate?: Date;
  supportEndDate?: Date;
  productId: string;
  openTasks: number;
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
  conformityAssessmentReport?: Attachment;
  declarationOfConformity?: Attachment;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductVersionCreate {
  version: string;
  status?: OscratProductVersionStatus;
  releaseDate?: Date;
  supportEndDate?: Date;
  productId: string;
  createdBy: string;
}

export interface OscratProductVersionUpdate {
  version?: string;
  status?: OscratProductVersionStatus;
  releaseDate?: Date;
  supportEndDate?: Date;
  updatedBy?: string;
}

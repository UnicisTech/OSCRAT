import {
  OscratProductVulnerabilitySeverity,
  OscratProductVulnerabilityStatus,
  Attachment,
} from '@prisma/client';

export interface OscratVulnerabilitySummary {
  id: string;
  name: string;
  description: string;
  severity: OscratProductVulnerabilitySeverity;
  status: OscratProductVulnerabilityStatus;
  cve?: string;
  affectedVendor?: string;
  references: string[];
  advisoryId?: string;
  dateOfDiscovery: Date;
  affectedMemberStates: string[];
  versionId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratVulnerabilityDetail extends OscratVulnerabilitySummary {
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
  updatedByUser: {
    id: string;
    name: string;
    email: string;
  };
  attachments: Attachment[];
}

export interface OscratVulnerabilityCreate {
  name: string;
  description: string;
  severity: OscratProductVulnerabilitySeverity;
  status: OscratProductVulnerabilityStatus;
  cve?: string;
  affectedVendor?: string;
  references?: string[];
  advisoryId?: string;
  dateOfDiscovery: Date;
  affectedMemberStates: string[];
  attachmentIds?: string[];
  createdBy: string;
}

export interface OscratVulnerabilityUpdate {
  name?: string;
  description?: string;
  severity?: OscratProductVulnerabilitySeverity;
  status?: OscratProductVulnerabilityStatus;
  cve?: string;
  affectedVendor?: string;
  references?: string[];
  advisoryId?: string;
  dateOfDiscovery?: Date;
  affectedMemberStates?: string[];
  attachmentIds?: string[];
  updatedBy: string;
}

export interface ScanVulnerability {
  cve: string;
  severity: string;
  package: string;
  version: string;
  fixedIn?: string;
  description: string;
  existingVulnerability?: OscratVulnerabilitySummary;
}

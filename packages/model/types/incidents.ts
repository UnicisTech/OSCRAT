import {
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
  Attachment,
} from '@prisma/client';

export interface OscratIncidentSummary {
  id: string;
  status: IncidentStatus;
  classification: IncidentClassification;
  attackType: IncidentAttackType;
  severity: IncidentSeverity;
  dateOfDetection: Date;
  description: string;
  scope: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratIncidentDetail {
  id: string;
  status: IncidentStatus;
  classification: IncidentClassification;
  attackType: IncidentAttackType;
  assetDetails?: string;
  severity: IncidentSeverity;
  dateOfDetection: Date;
  handlingDate?: Date;
  description: string;
  correctiveActions?: string;
  rootCause?: string;
  scope: string;
  preventiveActions?: string;
  suspectedUnlawfulAct: boolean;
  unlawfulActDescription?: string;
  crossBorderImpact: boolean;
  crossBorderImpactDetails?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratIncidentCreate {
  status: IncidentStatus;
  classification: IncidentClassification;
  attackType: IncidentAttackType;
  assetDetails?: string;
  reporterId: string;
  dateOfDetection: Date;
  severity: IncidentSeverity;
  handlingDate?: Date;
  description: string;
  correctiveActions?: string;
  rootCause?: string;
  scope: string;
  preventiveActions?: string;
  suspectedUnlawfulAct?: boolean;
  unlawfulActDescription?: string;
  crossBorderImpact?: boolean;
  crossBorderImpactDetails?: string;
  attachmentIds?: string[];
  createdBy: string;
}

export interface OscratIncidentUpdate {
  status?: IncidentStatus;
  classification?: IncidentClassification;
  attackType?: IncidentAttackType;
  assetDetails?: string;
  reporterId?: string;
  dateOfDetection?: Date;
  severity?: IncidentSeverity;
  handlingDate?: Date;
  description?: string;
  correctiveActions?: string;
  rootCause?: string;
  scope?: string;
  preventiveActions?: string;
  suspectedUnlawfulAct?: boolean;
  unlawfulActDescription?: string;
  crossBorderImpact?: boolean;
  crossBorderImpactDetails?: string;
  attachmentIds?: string[];
  updatedBy: string;
}

/** Incident statuses considered "open" that need tracking */
export const OPEN_INCIDENT_STATUSES = [
  IncidentStatus.PENDING,
  IncidentStatus.START,
  IncidentStatus.DECLARED,
  IncidentStatus.STABLE,
  IncidentStatus.ACTIVE,
] satisfies IncidentStatus[];

/** Incident statuses considered "closed" */
export const CLOSED_INCIDENT_STATUSES = [
  IncidentStatus.RESOLVED,
  IncidentStatus.COMPLETED,
] satisfies IncidentStatus[];

import { OscratAssessmentType } from '@prisma/client';

export interface OscratAssessmentSummary {
  id: string;
  type: OscratAssessmentType;
  schemaVersion: string;
  teamId: string;
  productId?: string;
  versionId?: string;
  createdAt: Date;
  createdBy: string;
}

export interface OscratAssessmentDetail {
  id: string;
  type: OscratAssessmentType;
  schemaVersion: string;
  rawData: Record<string, any>;
  teamId: string;
  productId?: string;
  versionId?: string;
  createdAt: Date;
  createdBy: string;
}

export interface OscratAssessmentCreate {
  type: OscratAssessmentType;
  schemaVersion: string;
  rawData: Record<string, any>;
  teamId: string;
  productId?: string;
  versionId?: string;
  createdBy: string;
}

export interface OscratAssessmentCreateRequest {
  type: OscratAssessmentType;
  schemaVersion: string;
  rawData: Record<string, any>;
  productId?: string;
  versionId?: string;
  createdBy: string;
}

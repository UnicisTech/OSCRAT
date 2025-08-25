import { OscratAssessmentType } from '@prisma/client';

export interface OscratAssessmentSummary {
  id: string;
  type: OscratAssessmentType;
  schemaVersion: string;
  versionId: string;
  productId: string;
  createdAt: Date;
  createdBy: string;
}

export interface OscratAssessmentDetail {
  id: string;
  type: OscratAssessmentType;
  schemaVersion: string;
  rawData: Record<string, any>;
  versionId: string;
  productId: string;
  createdAt: Date;
  createdBy: string;
}

export interface OscratAssessmentCreate {
  type: OscratAssessmentType;
  schemaVersion: string;
  rawData: Record<string, any>;
  productId: string;
  createdBy: string;
}

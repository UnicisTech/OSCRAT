import {
  OscratProductType,
  OscratProductCategory,
  OscratProductComplianceStatus,
} from '@prisma/client';
import { OscratVulnerabilitySummary } from './vulnerabilities';
import { OscratIncidentSummary } from './incidents';
import { OscratAssessmentSummary } from './assessment';

export interface OscratProductSummary {
  id: string;
  name: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  complianceStatus: OscratProductComplianceStatus;
  externalReportingAcronyms: string[];
  openIncidents: number;
  openVulnerabilities: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratProductDetail {
  id: string;
  name: string;
  type: OscratProductType;
  productCategory: OscratProductCategory;
  complianceStatus: OscratProductComplianceStatus;
  externalReportingAcronyms: string[];
  incidents: OscratIncidentSummary[];
  vulnerabilities: OscratVulnerabilitySummary[];
  assessments: OscratAssessmentSummary[];
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
  productCategory?: OscratProductCategory;
  complianceStatus?: OscratProductComplianceStatus;
  reportingOrganizations?: string[];
  updatedBy: string;
}

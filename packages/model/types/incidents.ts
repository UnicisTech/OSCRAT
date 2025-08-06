import {
  OscratProductIncidentType,
  OscratProductIncidentStatus,
} from '@prisma/client';

export interface OscratIncidentSummary {
  id: string;
  name: string;
  type: OscratProductIncidentType;
  status: OscratProductIncidentStatus;
  incidentReference?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OscratIncidentCreate {
  name: string;
  description: string;
  type: OscratProductIncidentType;
  status: OscratProductIncidentStatus;
  incidentReference?: string;
  createdBy: string;
}

export interface OscratIncidentUpdate {
  name?: string;
  description?: string;
  type?: OscratProductIncidentType;
  status?: OscratProductIncidentStatus;
  incidentReference?: string;
  updatedBy: string;
}

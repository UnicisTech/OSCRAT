export interface TeamData {
  id: string;
  dataKey: string;
  payload: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface TeamDataSummary {
  id: string;
  dataKey: string;
  teamId: string;
  updatedAt: Date;
}

export interface TeamDataDetail extends TeamData {
  updatedByUser: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TeamDataCreate {
  dataKey: string;
  payload: string;
  updatedBy: string;
}

export interface TeamDataUpdate {
  payload: string;
  updatedBy: string;
}

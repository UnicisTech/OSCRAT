export interface TeamDashboardSummary {
  vulnerabilities: {
    open: number;
  };
  incidents: {
    open: number;
  };
  sbomReports: {
    total: number;
  };
  techDocumentation: {
    total: number;
  };
  products: {
    total: number;
    inAssessment: number;
    active: number;
    withdrawn: number;
  };
}

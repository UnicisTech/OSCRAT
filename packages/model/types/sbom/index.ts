interface SBOMSummary {
  overview: {
    totalComponents: number;
    packageTypes: number;
    sourceTarget: string;
    scanDate: string;
    syftVersion: string;
  };
  packageTypes: Record<string, number>;
  packages: Array<{
    name: string;
    version?: string;
    type: string;
  }>;
}

export type { SBOMSummary };

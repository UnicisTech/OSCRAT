import * as fs from 'fs';
import * as path from 'path';
import { OscratOrganizationRole } from '@oscrat/model';
import type { ComplianceArea } from '@/types/compliance';

interface ComplianceDataConfig {
  dataPath: string;
  roleFileMapping: Record<OscratOrganizationRole, string>;
  errorPrefix: string;
}

function createComplianceDataManager(config: ComplianceDataConfig) {
  const DATA_PATH = path.join(process.cwd(), config.dataPath);

  function getRoleFilePath(role: OscratOrganizationRole): string {
    const fileName = config.roleFileMapping[role];
    return path.join(DATA_PATH, fileName);
  }

  function getData(role: OscratOrganizationRole): ComplianceArea[] | null {
    try {
      const filePath = getRoleFilePath(role);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent) as ComplianceArea[];
    } catch (error) {
      console.error(`Error reading ${config.errorPrefix} data for ${role}:`, error);
      return null;
    }
  }

  return {
    getData,
  };
}

const versionDataManager = createComplianceDataManager({
  dataPath: 'lib/compliance/assessments/version',
  roleFileMapping: {
    [OscratOrganizationRole.MANUFACTURER]: 'manufacturer-4b.json',
    [OscratOrganizationRole.DISTRIBUTOR]: 'distributor-5b.json',
    [OscratOrganizationRole.IMPORTER]: 'importer-3b.json',
    [OscratOrganizationRole.DATA_STEWARD]: 'sme-manufacturer-7b.json',
  },
  errorPrefix: 'Compliance',
});

const teamDataManager = createComplianceDataManager({
  dataPath: 'lib/compliance/assessments/team',
  roleFileMapping: {
    [OscratOrganizationRole.MANUFACTURER]: 'manufacturer-4a.json',
    [OscratOrganizationRole.DISTRIBUTOR]: 'distributor-5a.json',
    [OscratOrganizationRole.IMPORTER]: 'importer-3a.json',
    [OscratOrganizationRole.DATA_STEWARD]: 'sme-manufacturer-7a.json',
  },
  errorPrefix: 'Team compliance',
});

export const getComplianceData = versionDataManager.getData;
export const getTeamComplianceData = teamDataManager.getData;


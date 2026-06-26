import * as fs from 'fs';
import * as path from 'path';
import { OscratOrganizationRole } from '@oscrat/model';
import type { ComplianceArea } from '@/types/compliance';

const TECH_DOC_CHECKLIST_ROLES: OscratOrganizationRole[] = [
  OscratOrganizationRole.MANUFACTURER,
  OscratOrganizationRole.IMPORTER,
  OscratOrganizationRole.DISTRIBUTOR,
  OscratOrganizationRole.AUTHORIZED_REPRESENTATIVE,
];

interface ComplianceDataConfig {
  dataPath: string;
  roleFileMapping: Partial<Record<OscratOrganizationRole, string>>;
  errorPrefix: string;
}

function loadJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function createComplianceDataManager(config: ComplianceDataConfig) {
  const DATA_PATH = path.join(process.cwd(), config.dataPath);

  function getData(role: OscratOrganizationRole): ComplianceArea[] | null {
    try {
      const fileName = config.roleFileMapping[role];
      let areas: ComplianceArea[] = [];

      if (fileName) {
        const filePath = path.join(DATA_PATH, fileName);
        const parsed = loadJsonFile<ComplianceArea[]>(filePath);
        if (!parsed) return null;
        areas = parsed;
      }

      if (TECH_DOC_CHECKLIST_ROLES.includes(role)) {
        const checklistPath = path.join(DATA_PATH, 'tech-doc-checklist.json');
        const checklist = loadJsonFile<ComplianceArea>(checklistPath);
        if (checklist) {
          const isOptional =
            role === OscratOrganizationRole.AUTHORIZED_REPRESENTATIVE;
          areas = [...areas, { ...checklist, optional: isOptional }];
        }
      }

      return areas.length > 0 ? areas : null;
    } catch (error) {
      console.error(
        `Error reading ${config.errorPrefix} data for ${role}:`,
        error
      );
      return null;
    }
  }

  return { getData };
}

const versionDataManager = createComplianceDataManager({
  dataPath: 'lib/compliance/assessments/version',
  roleFileMapping: {
    [OscratOrganizationRole.MANUFACTURER]: 'manufacturer-4b.json',
    [OscratOrganizationRole.DISTRIBUTOR]: 'distributor-5b.json',
    [OscratOrganizationRole.IMPORTER]: 'importer-3b.json',
    [OscratOrganizationRole.DATA_STEWARD]: 'sme-manufacturer-7b.json',
    [OscratOrganizationRole.AUTHORIZED_REPRESENTATIVE]: 'manufacturer-4b.json',
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
    [OscratOrganizationRole.AUTHORIZED_REPRESENTATIVE]: 'manufacturer-4a.json',
  },
  errorPrefix: 'Team compliance',
});

export const getComplianceData = versionDataManager.getData;
export const getTeamComplianceData = teamDataManager.getData;

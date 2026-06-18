import { buildDataKey } from '@/hooks/useTeamData';
import { OscratOrganizationRole } from '@oscrat/model';
import type { ComplianceType } from '@/lib/compliance/translations';

export const TRANSLATION_NAMESPACES: Record<string, { label: string }> = {
  'team-manufacturer': { label: 'Manufacturer (Team)' },
  'team-distributor': { label: 'Distributor (Team)' },
  'team-importer': { label: 'Importer (Team)' },
  'team-sme-manufacturer': { label: 'SME Manufacturer (Team)' },
  'version-manufacturer': { label: 'Manufacturer (Version)' },
  'version-distributor': { label: 'Distributor (Version)' },
  'version-importer': { label: 'Importer (Version)' },
  'version-sme-manufacturer': { label: 'SME Manufacturer (Version)' },
};

export type TranslationNamespaceKey =
  | 'team-manufacturer'
  | 'team-distributor'
  | 'team-importer'
  | 'team-sme-manufacturer'
  | 'version-manufacturer'
  | 'version-distributor'
  | 'version-importer'
  | 'version-sme-manufacturer';

// EU official languages (English included - can be customized per team)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'ro', label: 'Romanian' },
  { code: 'el', label: 'Greek' },
  { code: 'cs', label: 'Czech' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'sv', label: 'Swedish' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'da', label: 'Danish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'sk', label: 'Slovak' },
  { code: 'hr', label: 'Croatian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'lv', label: 'Latvian' },
  { code: 'et', label: 'Estonian' },
  { code: 'mt', label: 'Maltese' },
  { code: 'ga', label: 'Irish' },
] as const;

export interface ExistingTranslation {
  dataKey: string;
  namespace: TranslationNamespaceKey;
  language: string;
  languageLabel: string;
  namespaceLabel: string;
  updatedAt: Date;
}

export function buildTranslationDataKey(
  namespace: TranslationNamespaceKey,
  language: string
): string {
  return buildDataKey('compliance', 'translation', namespace, language);
}

const ROLE_SUFFIX_MAP: Record<OscratOrganizationRole, string> = {
  [OscratOrganizationRole.MANUFACTURER]: 'manufacturer',
  [OscratOrganizationRole.DISTRIBUTOR]: 'distributor',
  [OscratOrganizationRole.IMPORTER]: 'importer',
  [OscratOrganizationRole.DATA_STEWARD]: 'sme-manufacturer',
  [OscratOrganizationRole.AUTHORIZED_REPRESENTATIVE]:
    'authorized-representative',
};

export function getTranslationNamespaceKey(
  role: OscratOrganizationRole,
  type: ComplianceType
): TranslationNamespaceKey {
  const key = `${type}-${ROLE_SUFFIX_MAP[role]}`;
  if (!(key in TRANSLATION_NAMESPACES)) {
    throw new Error(`Invalid namespace key: ${key}`);
  }
  return key as TranslationNamespaceKey;
}

/**
 * Validates and parses a translation data key.
 * Expected format: compliance:translation:{type}-{role}:{language}
 * Example: compliance:translation:team-manufacturer:en
 */
function parseTranslationDataKey(
  dataKey: string
): { namespace: TranslationNamespaceKey; language: string } | null {
  const prefix = 'compliance:translation:';
  if (!dataKey.startsWith(prefix)) return null;

  const remainder = dataKey.slice(prefix.length);
  const lastColonIndex = remainder.lastIndexOf(':');

  // Must have at least one colon separating namespace from language
  if (lastColonIndex === -1 || lastColonIndex === 0) return null;

  const namespacePart = remainder.slice(0, lastColonIndex);
  const language = remainder.slice(lastColonIndex + 1);

  if (!(namespacePart in TRANSLATION_NAMESPACES)) return null;

  if (!language) return null;

  return {
    namespace: namespacePart as TranslationNamespaceKey,
    language,
  };
}

export function parseExistingTranslations(
  dataList: Array<{ dataKey: string; updatedAt: Date }> | undefined
): ExistingTranslation[] {
  if (!dataList) return [];

  const results: ExistingTranslation[] = [];

  for (const item of dataList) {
    const parsed = parseTranslationDataKey(item.dataKey);
    if (!parsed) continue;

    const langInfo = SUPPORTED_LANGUAGES.find(
      (l) => l.code === parsed.language
    );

    results.push({
      dataKey: item.dataKey,
      namespace: parsed.namespace,
      language: parsed.language,
      languageLabel: langInfo?.label || parsed.language.toUpperCase(),
      namespaceLabel:
        TRANSLATION_NAMESPACES[parsed.namespace]?.label || parsed.namespace,
      updatedAt: item.updatedAt,
    });
  }

  return results;
}

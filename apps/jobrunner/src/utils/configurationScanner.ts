import { $ } from 'zx';
import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import {
  ConfigurationScanSummary,
  type ConfigurationScanRuleResult,
  CONFIGURATION_SEVERITY,
  CONFIGURATION_RESULT,
  type ConfigurationSeverity,
  type ConfigurationResult,
} from '@oscrat/model/types/configurationScan';
import { JobError } from './JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { translateError } from './errorTranslator';

type XmlNode = Record<string, unknown>;

const asNode = (value: unknown): XmlNode =>
  value !== null && typeof value === 'object' ? (value as XmlNode) : {};

const toArray = (value: unknown): unknown[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

const stringField = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Generate an HTML report from an ARF XML file using oscap-report.
 */
export async function processWithOscapReport(
  inputFilePath: string,
  outputDir: string
): Promise<{ htmlReportPath: string }> {
  try {
    const htmlReportPath = path.join(outputDir, 'report.html');

    console.log(`[Configuration Scan] Generating HTML report from: ${inputFilePath}`);
    console.log(`[Configuration Scan] Output path: ${htmlReportPath}`);

    const result = await $`oscap-report ${inputFilePath}`;
    fs.writeFileSync(htmlReportPath, result.stdout);

    if (!fs.existsSync(htmlReportPath)) {
      console.error(`[Configuration Scan] HTML report not created at ${htmlReportPath}`);
      throw new JobError(
        ERROR_CODES.CONFIGURATION_SCAN_PROCESSING_FAILED,
        `HTML report was not created at ${htmlReportPath}`
      );
    }

    const stats = fs.statSync(htmlReportPath);
    if (stats.size === 0) {
      throw new JobError(
        ERROR_CODES.CONFIGURATION_SCAN_PROCESSING_FAILED,
        'oscap-report generated an empty HTML file'
      );
    }

    console.log(`[Configuration Scan] Successfully generated HTML report (${stats.size} bytes)`);
    return { htmlReportPath };
  } catch (error) {
    throw translateError(
      'Configuration Scan',
      error,
      ERROR_CODES.CONFIGURATION_SCAN_PROCESSING_FAILED,
      'Failed to generate configuration scan HTML report'
    );
  }
}

function mapSeverity(severity: string | undefined): ConfigurationSeverity {
  if (!severity) return CONFIGURATION_SEVERITY.UNKNOWN;
  switch (severity.toLowerCase()) {
    case 'high':
      return CONFIGURATION_SEVERITY.HIGH;
    case 'medium':
      return CONFIGURATION_SEVERITY.MEDIUM;
    case 'low':
      return CONFIGURATION_SEVERITY.LOW;
    default:
      return CONFIGURATION_SEVERITY.UNKNOWN;
  }
}

function mapResult(result: string | undefined): ConfigurationResult {
  if (!result) return CONFIGURATION_RESULT.ERROR;
  switch (result.toLowerCase()) {
    case 'pass':
      return CONFIGURATION_RESULT.PASS;
    case 'fail':
      return CONFIGURATION_RESULT.FAIL;
    case 'error':
      return CONFIGURATION_RESULT.ERROR;
    case 'notapplicable':
      return CONFIGURATION_RESULT.NOT_APPLICABLE;
    case 'notchecked':
      return CONFIGURATION_RESULT.NOT_CHECKED;
    case 'notselected':
      return CONFIGURATION_RESULT.NOT_SELECTED;
    case 'informational':
      return CONFIGURATION_RESULT.INFORMATIONAL;
    case 'fixed':
      return CONFIGURATION_RESULT.FIXED;
    default:
      return CONFIGURATION_RESULT.ERROR;
  }
}

function extractCceId(identifiers: unknown): string | undefined {
  if (!Array.isArray(identifiers)) return undefined;
  for (const ident of identifiers) {
    if (!ident) continue;
    if (typeof ident === 'string' && ident.startsWith('CCE-')) return ident;
    if (typeof ident === 'object') {
      const value = (ident as { value?: unknown }).value;
      if (typeof value === 'string' && value.startsWith('CCE-')) return value;
    }
  }
  return undefined;
}

function flattenReferences(references: unknown): string[] | undefined {
  if (!Array.isArray(references)) return undefined;
  const ids: string[] = [];
  for (const ref of references) {
    if (ref && typeof ref === 'object') {
      const refIds = (ref as { ref_ids?: unknown }).ref_ids;
      if (Array.isArray(refIds)) {
        for (const id of refIds) {
          if (typeof id === 'string') ids.push(id);
        }
      }
    }
  }
  return ids.length > 0 ? ids : undefined;
}

function buildRuleResult(rule: XmlNode): ConfigurationScanRuleResult {
  const ruleId = stringField(rule.rule_id) ?? '';
  return {
    ruleId,
    title: stringField(rule.title) ?? ruleId,
    cceId: extractCceId(rule.identifiers),
    severity: mapSeverity(stringField(rule.severity)),
    result: mapResult(stringField(rule.result)),
    description: stringField(rule.description),
    references: flattenReferences(rule.references),
  };
}

function deriveBenchmarkId(benchmarkUrl: unknown): string | undefined {
  if (typeof benchmarkUrl !== 'string' || !benchmarkUrl) return undefined;
  const base = path.basename(benchmarkUrl);
  const dot = base.indexOf('.');
  return dot > 0 ? base.slice(0, dot) : base;
}

/**
 * Run `oscap-report -f JSON-EVERYTHING` against an ARF/XCCDF file and map the
 * resulting JSON into a ConfigurationScanSummary. Avoids parsing the raw XML
 * in JS, which trips fast-xml-parser's entity-expansion guard on real ARFs.
 */
export async function parseScanReport(
  inputFilePath: string,
  outputDir: string
): Promise<ConfigurationScanSummary> {
  const jsonPath = path.join(outputDir, 'scan-result.json');

  try {
    console.log(`[Configuration Scan] Generating JSON report from: ${inputFilePath}`);
    await $`oscap-report -f JSON-EVERYTHING -o ${jsonPath} ${inputFilePath}`;

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    if (!data || typeof data !== 'object' || !data.rules || typeof data.rules !== 'object') {
      throw new JobError(
        ERROR_CODES.CONFIGURATION_SCAN_ANALYSIS_FAILED,
        'oscap-report JSON output is missing the rules object'
      );
    }

    const scanResult = (data.scan_result ?? {}) as Record<string, unknown>;
    const profileInfo = (data.profile_info ?? {}) as Record<string, unknown>;

    const profileId =
      (typeof profileInfo.profile_id === 'string' && profileInfo.profile_id) ||
      (typeof scanResult.profile_id === 'string' && scanResult.profile_id) ||
      undefined;
    const profileTitle =
      typeof profileInfo.title === 'string' ? profileInfo.title : undefined;
    const benchmarkId = deriveBenchmarkId(scanResult.benchmark_url);
    const benchmarkVersion =
      typeof scanResult.benchmark_version === 'string'
        ? scanResult.benchmark_version
        : undefined;
    const targetHostname =
      typeof scanResult.target === 'string' ? scanResult.target : undefined;

    let scanDate =
      (typeof scanResult.end_time === 'string' && scanResult.end_time) ||
      (typeof scanResult.start_time === 'string' && scanResult.start_time) ||
      '';
    if (!scanDate) {
      console.warn('[Configuration Scan] No scan date found in JSON, using current time as fallback');
      scanDate = new Date().toISOString();
    }

    const rules: ConfigurationScanRuleResult[] = [];
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    let notApplicableCount = 0;
    let notCheckedCount = 0;
    let otherCount = 0;

    for (const rule of Object.values(data.rules as Record<string, unknown>)) {
      const built = buildRuleResult(asNode(rule));
      rules.push(built);

      switch (built.result) {
        case CONFIGURATION_RESULT.PASS:
          passCount++;
          break;
        case CONFIGURATION_RESULT.FAIL:
          failCount++;
          break;
        case CONFIGURATION_RESULT.ERROR:
          errorCount++;
          break;
        case CONFIGURATION_RESULT.NOT_APPLICABLE:
          notApplicableCount++;
          break;
        case CONFIGURATION_RESULT.NOT_CHECKED:
        case CONFIGURATION_RESULT.NOT_SELECTED:
          notCheckedCount++;
          break;
        default:
          otherCount++;
          break;
      }
    }

    return {
      totalRules: rules.length,
      passCount,
      failCount,
      errorCount,
      notApplicableCount,
      notCheckedCount,
      otherCount,
      profileId,
      profileTitle,
      benchmarkId,
      benchmarkVersion,
      targetHostname,
      scanDate,
      rules,
    };
  } catch (error) {
    console.error('[Configuration Scan Analysis] Analysis failed:', errorMessage(error));
    throw translateError(
      'Configuration Scan Analysis',
      error,
      ERROR_CODES.CONFIGURATION_SCAN_ANALYSIS_FAILED,
      'Configuration scan analysis failed'
    );
  }
}

const OVAL_RESULT_TO_CONFIGURATION_RESULT: Record<string, ConfigurationResult> = {
  true: CONFIGURATION_RESULT.PASS,
  false: CONFIGURATION_RESULT.FAIL,
  error: CONFIGURATION_RESULT.ERROR,
  unknown: CONFIGURATION_RESULT.NOT_CHECKED,
  not_evaluated: CONFIGURATION_RESULT.NOT_CHECKED,
  not_applicable: CONFIGURATION_RESULT.NOT_APPLICABLE,
};

function mapOvalResult(result: string | undefined): ConfigurationResult {
  if (!result) return CONFIGURATION_RESULT.ERROR;
  return (
    OVAL_RESULT_TO_CONFIGURATION_RESULT[result.toLowerCase()] ??
    CONFIGURATION_RESULT.ERROR
  );
}

interface OvalDefinitionMetadata {
  title?: string;
  description?: string;
  references: string[];
}

function buildDefinitionIndex(
  definitions: unknown
): Map<string, OvalDefinitionMetadata> {
  const index = new Map<string, OvalDefinitionMetadata>();
  for (const rawDef of toArray(asNode(definitions).definition)) {
    const def = asNode(rawDef);
    const id = stringField(def['@_id']);
    if (!id) continue;
    const metadata = asNode(def.metadata);
    const references = toArray(metadata.reference)
      .map((ref) => stringField(asNode(ref)['@_ref_id']))
      .filter((r): r is string => Boolean(r));
    index.set(id, {
      title: stringField(metadata.title),
      description: stringField(metadata.description),
      references,
    });
  }
  return index;
}

/**
 * Parse a standalone OVAL results document (root <oval_results>) into a
 * ConfigurationScanSummary. OVAL lacks profile/benchmark/severity concepts —
 * those come from the XCCDF wrapper — so the corresponding summary fields are
 * left unset and per-rule severity is reported as `unknown`.
 */
export async function parseOvalResults(
  inputFilePath: string
): Promise<ConfigurationScanSummary> {
  try {
    console.log(`[Configuration Scan] Parsing OVAL results from: ${inputFilePath}`);
    const xml = fs.readFileSync(inputFilePath, 'utf-8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      processEntities: false,
      htmlEntities: false,
      removeNSPrefix: true,
      parseAttributeValue: false,
    });
    const parsed: unknown = parser.parse(xml);

    const rawRoot = asNode(parsed).oval_results;
    if (!rawRoot || typeof rawRoot !== 'object') {
      throw new JobError(
        ERROR_CODES.CONFIGURATION_SCAN_ANALYSIS_FAILED,
        'OVAL results document is missing the <oval_results> root element'
      );
    }
    const root = asNode(rawRoot);

    const definitions = buildDefinitionIndex(
      asNode(root.oval_definitions).definitions
    );

    const generator = asNode(root.generator);
    const scanDate =
      stringField(generator.timestamp) ?? new Date().toISOString();
    const schemaVersion = stringField(generator.schema_version);

    const systems = toArray(asNode(root.results).system).map(asNode);
    const definitionResults = systems.flatMap((system) =>
      toArray(asNode(system.definitions).definition).map(asNode)
    );

    const targetHostname = systems
      .map((system) =>
        stringField(asNode(system.system_info).primary_host_name)
      )
      .find((host): host is string => Boolean(host));

    const rules: ConfigurationScanRuleResult[] = [];
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    let notApplicableCount = 0;
    let notCheckedCount = 0;
    let otherCount = 0;

    for (const definitionResult of definitionResults) {
      const ruleId = stringField(definitionResult['@_definition_id']) ?? '';
      const result = mapOvalResult(stringField(definitionResult['@_result']));
      const metadata = (ruleId && definitions.get(ruleId)) || {
        title: undefined,
        description: undefined,
        references: [] as string[],
      };

      rules.push({
        ruleId,
        title: metadata.title ?? ruleId,
        severity: CONFIGURATION_SEVERITY.UNKNOWN,
        result,
        description: metadata.description,
        references: metadata.references.length > 0 ? metadata.references : undefined,
      });

      switch (result) {
        case CONFIGURATION_RESULT.PASS:
          passCount++;
          break;
        case CONFIGURATION_RESULT.FAIL:
          failCount++;
          break;
        case CONFIGURATION_RESULT.ERROR:
          errorCount++;
          break;
        case CONFIGURATION_RESULT.NOT_APPLICABLE:
          notApplicableCount++;
          break;
        case CONFIGURATION_RESULT.NOT_CHECKED:
        case CONFIGURATION_RESULT.NOT_SELECTED:
          notCheckedCount++;
          break;
        default:
          otherCount++;
          break;
      }
    }

    return {
      totalRules: rules.length,
      passCount,
      failCount,
      errorCount,
      notApplicableCount,
      notCheckedCount,
      otherCount,
      benchmarkVersion: schemaVersion,
      targetHostname,
      scanDate,
      rules,
    };
  } catch (error) {
    console.error('[Configuration Scan Analysis] OVAL parse failed:', errorMessage(error));
    throw translateError(
      'Configuration Scan Analysis',
      error,
      ERROR_CODES.CONFIGURATION_SCAN_ANALYSIS_FAILED,
      'Failed to parse OVAL results'
    );
  }
}

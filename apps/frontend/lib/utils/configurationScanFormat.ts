export const CONFIGURATION_SCAN_FORMAT_KIND = {
  ARF: 'arf',
  XCCDF: 'xccdf',
  OVAL: 'oval',
  UNKNOWN: 'unknown',
} as const;

export type ConfigurationScanFormatKind =
  (typeof CONFIGURATION_SCAN_FORMAT_KIND)[keyof typeof CONFIGURATION_SCAN_FORMAT_KIND];

export type ConfigurationScanFormat =
  | { kind: typeof CONFIGURATION_SCAN_FORMAT_KIND.ARF; version: string }
  | { kind: typeof CONFIGURATION_SCAN_FORMAT_KIND.XCCDF; version: string }
  | { kind: typeof CONFIGURATION_SCAN_FORMAT_KIND.OVAL; version: string }
  | {
      kind: typeof CONFIGURATION_SCAN_FORMAT_KIND.UNKNOWN;
      rootElement?: string;
    };

const ARF_NAMESPACE_PREFIX =
  'http://scap.nist.gov/schema/asset-reporting-format/';
const XCCDF_NAMESPACE_PREFIX = 'http://checklists.nist.gov/xccdf/';
const OVAL_RESULTS_NAMESPACE_PREFIX =
  'http://oval.mitre.org/XMLSchema/oval-results-';

const HEAD_BYTES = 4096;

const ROOT_TAG_PATTERN = /<\s*(?:[\w-]+:)?([\w-]+)\b([^>]*)>/;
const ARF_NAMESPACE_PATTERN =
  /xmlns(?::[\w-]+)?\s*=\s*["']http:\/\/scap\.nist\.gov\/schema\/asset-reporting-format\/([\d.]+)["']/;
const XCCDF_NAMESPACE_PATTERN =
  /xmlns(?::[\w-]+)?\s*=\s*["']http:\/\/checklists\.nist\.gov\/xccdf\/([\d.]+)["']/;
const OVAL_RESULTS_NAMESPACE_PATTERN =
  /xmlns(?::[\w-]+)?\s*=\s*["']http:\/\/oval\.mitre\.org\/XMLSchema\/oval-results-([\d.]+)["']/;
// OVAL files carry the full schema version (e.g. 5.11.2) in a <schema_version>
// element inside <generator>, separate from the namespace's major version.
const OVAL_SCHEMA_VERSION_PATTERN =
  /<(?:[\w-]+:)?schema_version\b[^>]*>\s*([\d.]+)\s*<\//;

/**
 * Inspect the leading bytes of an XML upload and report what *kind* of file it
 * is (ARF version X, XCCDF version Y, or unknown). This function makes no
 * policy decision about which versions are supported — that lives at the call
 * site (e.g. the upload API route).
 *
 * Cheap regex scan only; safe to call on raw user input without parsing the
 * entire (potentially 100MB) file.
 */
export function detectConfigurationScanFormat(
  xml: string
): ConfigurationScanFormat {
  if (!xml) return { kind: CONFIGURATION_SCAN_FORMAT_KIND.UNKNOWN };

  const head = xml.length > HEAD_BYTES ? xml.slice(0, HEAD_BYTES) : xml;
  const cleaned = head
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/g, '');

  const match = ROOT_TAG_PATTERN.exec(cleaned);
  if (!match) return { kind: CONFIGURATION_SCAN_FORMAT_KIND.UNKNOWN };

  const [, localName, attrs] = match;

  if (localName === 'asset-report-collection') {
    const versionMatch = ARF_NAMESPACE_PATTERN.exec(attrs);
    if (versionMatch)
      return {
        kind: CONFIGURATION_SCAN_FORMAT_KIND.ARF,
        version: versionMatch[1],
      };
    if (attrs.includes(ARF_NAMESPACE_PREFIX)) {
      return { kind: CONFIGURATION_SCAN_FORMAT_KIND.ARF, version: 'unknown' };
    }
  }

  if (localName === 'Benchmark') {
    const versionMatch = XCCDF_NAMESPACE_PATTERN.exec(attrs);
    if (versionMatch)
      return {
        kind: CONFIGURATION_SCAN_FORMAT_KIND.XCCDF,
        version: versionMatch[1],
      };
    if (attrs.includes(XCCDF_NAMESPACE_PREFIX)) {
      return { kind: CONFIGURATION_SCAN_FORMAT_KIND.XCCDF, version: 'unknown' };
    }
  }

  if (localName === 'oval_results') {
    const schemaVersion = OVAL_SCHEMA_VERSION_PATTERN.exec(cleaned);
    if (schemaVersion)
      return {
        kind: CONFIGURATION_SCAN_FORMAT_KIND.OVAL,
        version: schemaVersion[1],
      };
    const nsVersion = OVAL_RESULTS_NAMESPACE_PATTERN.exec(attrs);
    if (nsVersion)
      return {
        kind: CONFIGURATION_SCAN_FORMAT_KIND.OVAL,
        version: nsVersion[1],
      };
    if (attrs.includes(OVAL_RESULTS_NAMESPACE_PREFIX)) {
      return { kind: CONFIGURATION_SCAN_FORMAT_KIND.OVAL, version: 'unknown' };
    }
  }

  return {
    kind: CONFIGURATION_SCAN_FORMAT_KIND.UNKNOWN,
    rootElement: localName,
  };
}

/** Human-readable label for a detected format, used in error messages. */
export function describeConfigurationScanFormat(
  format: ConfigurationScanFormat
): string {
  switch (format.kind) {
    case CONFIGURATION_SCAN_FORMAT_KIND.ARF:
      return `ARF ${format.version}`;
    case CONFIGURATION_SCAN_FORMAT_KIND.XCCDF:
      return `XCCDF ${format.version}`;
    case CONFIGURATION_SCAN_FORMAT_KIND.OVAL:
      return `OVAL ${format.version}`;
    case CONFIGURATION_SCAN_FORMAT_KIND.UNKNOWN:
      return 'unrecognized';
  }
}

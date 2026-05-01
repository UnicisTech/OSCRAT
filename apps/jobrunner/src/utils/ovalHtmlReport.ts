import {
  CONFIGURATION_RESULT,
  CONFIGURATION_SEVERITY,
  sortConfigurationScanRules,
  type ConfigurationResult,
  type ConfigurationScanRuleResult,
  type ConfigurationScanSummary,
  type ConfigurationSeverity,
} from '@oscrat/model/types/configurationScan';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const RESULT_LABEL: Record<ConfigurationResult, string> = {
  [CONFIGURATION_RESULT.PASS]: 'Pass',
  [CONFIGURATION_RESULT.FAIL]: 'Fail',
  [CONFIGURATION_RESULT.ERROR]: 'Error',
  [CONFIGURATION_RESULT.NOT_APPLICABLE]: 'Not applicable',
  [CONFIGURATION_RESULT.NOT_CHECKED]: 'Not checked',
  [CONFIGURATION_RESULT.NOT_SELECTED]: 'Not selected',
  [CONFIGURATION_RESULT.INFORMATIONAL]: 'Informational',
  [CONFIGURATION_RESULT.FIXED]: 'Fixed',
};

const SEVERITY_LABEL: Record<ConfigurationSeverity, string> = {
  [CONFIGURATION_SEVERITY.HIGH]: 'High',
  [CONFIGURATION_SEVERITY.MEDIUM]: 'Medium',
  [CONFIGURATION_SEVERITY.LOW]: 'Low',
  [CONFIGURATION_SEVERITY.UNKNOWN]: 'Unknown',
};

const STYLES = `
:root {
  --color-blue: #0066CC;
  --color-blue-bg: #e7f1fa;
  --color-green: #3e8635;
  --color-green-bg: #f3faf2;
  --color-red: #c9190b;
  --color-red-bg: #faeae8;
  --color-gold: #f0ab00;
  --color-gold-bg: #fdf7e7;
  --color-text: #151515;
  --color-muted: #6a6e73;
  --color-border: #d2d2d2;
  --color-card: #ffffff;
  --color-page: #f0f0f0;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "RedHatText", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-page);
}
header.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 32px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-border);
}
header.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 400;
}
header.page-header svg { flex-shrink: 0; }
main { max-width: 1400px; margin: 0 auto; padding: 24px 32px; }
section { margin-bottom: 32px; }
h2 {
  font-size: 22px;
  font-weight: 400;
  margin: 0 0 16px;
}
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 24px;
}
.card__title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.metadata-grid dt {
  font-size: 12px;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.metadata-grid dd { margin: 4px 0 0; font-size: 15px; }
.alert {
  padding: 16px 20px;
  border-radius: 4px;
  border-left: 4px solid;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.alert--danger { background: var(--color-red-bg); border-color: var(--color-red); color: #7d1007; }
.alert--success { background: var(--color-green-bg); border-color: var(--color-green); color: #1e4f18; }
.alert__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #ffffff;
  font-size: 13px;
}
.alert--danger .alert__icon { background: var(--color-red); }
.alert--success .alert__icon { background: var(--color-green); }
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.progress {
  display: flex;
  width: 100%;
  height: 16px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #ffffff;
}
.progress__bar { min-width: 2px; }
.progress__bar--pass { background: var(--color-green); }
.progress__bar--fail { background: var(--color-red); }
.progress__bar--other { background: var(--color-gold); }
.progress__bar--unknown { background: var(--color-gold); }
.progress__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--color-text);
}
.progress__legend-item { display: inline-flex; align-items: center; gap: 6px; }
.progress__legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.progress__legend-swatch--pass { background: var(--color-green); }
.progress__legend-swatch--fail { background: var(--color-red); }
.progress__legend-swatch--other { background: var(--color-gold); }
.progress__legend-swatch--unknown { background: var(--color-gold); }
.progress__total {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-muted);
}
table.rules {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}
table.rules th, table.rules td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}
table.rules th {
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
table.rules tbody tr:last-child td { border-bottom: none; }
table.rules td.rule-id { font-family: "RedHatMono", "SF Mono", Menlo, Consolas, monospace; font-size: 12px; color: var(--color-muted); white-space: nowrap; }
table.rules td.rule-title { font-weight: 500; }
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.badge--pass { background: var(--color-green-bg); color: var(--color-green); }
.badge--fail, .badge--error { background: var(--color-red-bg); color: var(--color-red); }
.badge--informational, .badge--fixed { background: var(--color-blue-bg); color: var(--color-blue); }
.badge--notapplicable, .badge--notchecked, .badge--notselected { background: #f0f0f0; color: var(--color-muted); }
.badge--high { background: var(--color-red-bg); color: var(--color-red); }
.badge--medium { background: var(--color-gold-bg); color: var(--color-gold); }
.badge--low { background: var(--color-blue-bg); color: var(--color-blue); }
.badge--unknown { background: #f0f0f0; color: var(--color-muted); }
.note {
  font-size: 13px;
  color: var(--color-muted);
  margin-top: 8px;
}
`;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toUTCString();
};

interface ProgressSegment {
  value: number;
  label: string;
  className: string;
}

const renderProgressBar = (segments: ProgressSegment[]): string => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  if (total === 0) {
    return '<div class="progress" aria-label="No data"><div class="progress__bar" style="flex:1;background:#f0f0f0"></div></div>';
  }
  const bars = segments
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const percent = (seg.value / total) * 100;
      return `<div class="progress__bar progress__bar--${seg.className}" style="width:${percent.toFixed(2)}%" aria-label="${seg.value} ${escapeHtml(seg.label)}"></div>`;
    })
    .join('');
  const legend = segments
    .map(
      (seg) =>
        `<span class="progress__legend-item"><span class="progress__legend-swatch progress__legend-swatch--${seg.className}" aria-hidden="true"></span>${seg.value} ${escapeHtml(seg.label)}</span>`
    )
    .join('');
  return `<div class="progress">${bars}</div><div class="progress__legend">${legend}</div>`;
};

const renderMetadataItem = (label: string, value: string | undefined): string =>
  value
    ? `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
    : '';

const renderRow = (rule: ConfigurationScanRuleResult): string => `
<tr>
  <td class="rule-id">${escapeHtml(rule.ruleId)}</td>
  <td class="rule-title">${escapeHtml(rule.title)}</td>
  <td><span class="badge badge--${rule.severity}">${escapeHtml(SEVERITY_LABEL[rule.severity])}</span></td>
  <td><span class="badge badge--${rule.result}">${escapeHtml(RESULT_LABEL[rule.result])}</span></td>
</tr>`;

export function renderOvalHtmlReport(summary: ConfigurationScanSummary): string {
  const otherCount =
    summary.errorCount +
    summary.notApplicableCount +
    summary.notCheckedCount +
    summary.otherCount;
  const hasFailures = summary.failCount > 0 || summary.errorCount > 0;

  const sortedRules = sortConfigurationScanRules(summary.rules);

  const ruleResultsBar = renderProgressBar([
    { value: summary.passCount, label: 'Pass', className: 'pass' },
    { value: summary.failCount, label: 'Fail', className: 'fail' },
    { value: otherCount, label: 'Other', className: 'other' },
  ]);

  const severityBar = renderProgressBar([
    { value: summary.failCount, label: 'Unknown', className: 'unknown' },
  ]);

  const aboutItems = [
    renderMetadataItem('Schema version', summary.benchmarkVersion),
    renderMetadataItem('Target hostname', summary.targetHostname),
    renderMetadataItem('Scan timestamp', formatDate(summary.scanDate)),
  ]
    .filter(Boolean)
    .join('');

  const alert = hasFailures
    ? `<div class="alert alert--danger" role="alert">
         <span class="alert__icon" aria-hidden="true">!</span>
         <div>
           <strong>The target system did not satisfy ${summary.failCount} OVAL definition${summary.failCount === 1 ? '' : 's'}.</strong>
           ${summary.errorCount > 0 ? ` ${summary.errorCount} additional definition${summary.errorCount === 1 ? '' : 's'} resulted in errors.` : ''}
           Review the results below.
         </div>
       </div>`
    : `<div class="alert alert--success" role="alert">
         <span class="alert__icon" aria-hidden="true">&#10003;</span>
         <div><strong>All ${summary.passCount} OVAL definition${summary.passCount === 1 ? '' : 's'} passed.</strong></div>
       </div>`;

  const rulesTable =
    sortedRules.length === 0
      ? '<p class="note">No OVAL definitions were evaluated.</p>'
      : `<table class="rules">
           <thead>
             <tr><th>Definition ID</th><th>Title</th><th>Severity</th><th>Result</th></tr>
           </thead>
           <tbody>
             ${sortedRules.map(renderRow).join('')}
           </tbody>
         </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SCAP Evaluation Report</title>
<style>${STYLES}</style>
</head>
<body>
<header class="page-header">
  <h1>SCAP Evaluation Report</h1>
</header>
<main>
  <section>
    <h2>About scan</h2>
    <div class="card">
      <div class="card__title">OVAL ${escapeHtml(summary.benchmarkVersion ?? 'results')}</div>
      ${aboutItems ? `<dl class="metadata-grid">${aboutItems}</dl>` : '<p class="note">No additional metadata was reported.</p>'}
    </div>
  </section>

  <section>
    <h2>Compliance and Scoring</h2>
    ${alert}
    <div class="stats-row" style="margin-top:24px">
      <div>
        <h3 style="font-size:16px;font-weight:600;margin:0 0 8px">Definition results</h3>
        ${ruleResultsBar}
        <p class="progress__total">Total ${summary.totalRules} definition${summary.totalRules === 1 ? '' : 's'} evaluated.</p>
      </div>
      <div>
        <h3 style="font-size:16px;font-weight:600;margin:0 0 8px">Severity of failed definitions</h3>
        ${severityBar}
        <p class="progress__total">OVAL definitions do not carry severity. Severity is assigned by the wrapping XCCDF profile and is therefore unknown for standalone OVAL.</p>
      </div>
    </div>
  </section>

  <section>
    <h2>Definition results</h2>
    ${rulesTable}
  </section>
</main>
</body>
</html>`;
}

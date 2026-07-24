import type { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from '@/lib/rate-limit';
import { getIpAddress } from '@/lib/utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS_PER_REQUEST = 10;

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

// Reported URLs keep their path and query, so these carry live tokens.
const TOKEN_PATH_PREFIXES = ['/auth/reset-password/', '/invitations/'];

const safeUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;

  // Keywords such as 'inline', 'eval', 'self' and 'data' are not URLs.
  if (!value.includes('://')) return value.slice(0, 64);

  try {
    const url = new URL(value);
    const prefix = TOKEN_PATH_PREFIXES.find((p) => url.pathname.startsWith(p));
    const path = prefix ? `${prefix}[token]` : url.pathname;
    return `${url.origin}${path}`;
  } catch {
    return undefined;
  }
};

const safeOrigin = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;
  if (!value.includes('://')) return value.slice(0, 64);

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

const safeNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const safeString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value.slice(0, 128) : undefined;

// Allowlist. Dropped on purpose: script-sample (real page script/style content),
// referrer (can carry tokens), originalPolicy (our own policy).
const sanitizeReport = (report: Record<string, unknown>) => ({
  directive: safeString(
    report.effectiveDirective ??
      report['effective-directive'] ??
      report.violatedDirective ??
      report['violated-directive']
  ),
  disposition: safeString(report.disposition),
  documentUrl: safeUrl(report.documentURL ?? report['document-uri']),
  blockedUrl: safeOrigin(report.blockedURL ?? report['blocked-uri']),
  sourceFile: safeUrl(report.sourceFile ?? report['source-file']),
  statusCode: safeNumber(report.statusCode ?? report['status-code']),
  line: safeNumber(report.lineNumber ?? report['line-number']),
  column: safeNumber(report.columnNumber ?? report['column-number']),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// report-uri sends { "csp-report": {...} }, Reporting-Endpoints sends [{ body }].
const extractReports = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload
      .slice(0, MAX_REPORTS_PER_REQUEST)
      .map((entry) => (isRecord(entry) ? entry.body : null))
      .filter(isRecord);
  }

  if (!isRecord(payload)) return [];

  const nested = payload['csp-report'];
  if (isRecord(nested)) return [nested];

  return [payload];
};

async function readBody(req: NextApiRequest): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error('CSP report body too large');
    }
    chunks.push(buf);
  }

  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  try {
    await limiter.check(20, getIpAddress(req), res);
  } catch {
    return res.status(429).end();
  }

  try {
    const raw = await readBody(req);

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      console.warn(
        `[csp-report] discarded unparseable report (${raw.length} bytes)`
      );
      return res.status(204).end();
    }

    for (const report of extractReports(payload)) {
      console.warn('[csp-report]', JSON.stringify(sanitizeReport(report)));
    }
  } catch (err) {
    console.warn('[csp-report] failed to read report', err);
  }

  return res.status(204).end();
}

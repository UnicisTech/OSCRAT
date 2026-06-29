import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';
import {
  ClipboardIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import type { OscratAuditLog } from '@oscrat/model';
import {
  getAuditActionTranslationKey,
  oscratEntityTypeTranslationMap,
} from '@/utils/translation';
import { getCrudConfig, formatTimestamp } from '@/lib/auditUtils';
import { isUuid } from '@/lib/utils';
import { formatDateTime } from '@/utils/dateFormat';
import { useQuery } from '@tanstack/react-query';
import { teamsEndpoints } from '@/lib/api/endpoints/teams';
import { queryKeys } from '@/lib/api/queryKeys';

interface AuditDetailsModalProps {
  log: OscratAuditLog | null;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Team slug. When provided, UUIDs in user-reference patch fields
   * (`assigneeId`, `userId`) are resolved to the member name so audit
   * entries read "Jane Doe" instead of "a1b2c3d4-…".
   */
  teamSlug?: string;
}

const formatKey = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const isDateString = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) ||
  /^\d{4}-\d{2}-\d{2}$/.test(value);

const USER_REFERENCE_FIELDS = new Set(['assigneeId', 'userId']);

const isUserReferenceField = (path: string): boolean => {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 && USER_REFERENCE_FIELDS.has(parts[parts.length - 1]);
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && isDateString(value)) {
    return formatDateTime(value);
  }
  return String(value);
};

const PatchOp = {
  Add: 'add',
  Remove: 'remove',
  Replace: 'replace',
} as const;
type PatchOpValue = (typeof PatchOp)[keyof typeof PatchOp];

interface PatchOperation {
  op: PatchOpValue;
  path: string;
  value?: unknown;
  /**
   * Old value at this op's path, captured server-side at write time. Absent
   * on legacy log rows written before this field was added — in which case
   * we render only the new value (the previous behaviour).
   */
  previousValue?: unknown;
}

const parseMetadata = (
  metadata: Record<string, unknown>
): { type: 'snapshot' | 'patch' | 'raw'; data: unknown } => {
  const parsed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  }

  if ('snapshot' in parsed && typeof parsed.snapshot === 'object') {
    return { type: 'snapshot', data: parsed.snapshot };
  }

  if ('patch' in parsed && Array.isArray(parsed.patch)) {
    return { type: 'patch', data: parsed.patch };
  }

  return { type: 'raw', data: parsed };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const pathToFieldName = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? formatKey(parts[parts.length - 1]) : path;
};

const opIndicator: Record<PatchOpValue, { symbol: string; className: string }> =
  {
    [PatchOp.Replace]: { symbol: '→', className: 'text-warning' },
    [PatchOp.Add]: { symbol: '+', className: 'text-success' },
    [PatchOp.Remove]: { symbol: '−', className: 'text-danger' },
  };

const resolveDisplayValue = (
  rawValue: unknown,
  path: string,
  resolveUserId?: (id: string) => string | undefined
): string => {
  if (
    resolveUserId &&
    isUserReferenceField(path) &&
    typeof rawValue === 'string' &&
    isUuid(rawValue)
  ) {
    return resolveUserId(rawValue) ?? formatValue(rawValue);
  }
  return formatValue(rawValue);
};

const PatchDisplay: React.FC<{
  patch: PatchOperation[];
  resolveUserId?: (id: string) => string | undefined;
}> = ({ patch, resolveUserId }) => (
  <dl className="grid grid-cols-[max-content_1fr_max-content_1fr] items-baseline gap-x-3 gap-y-1.5">
    {patch.map((op, index) => {
      const ind = opIndicator[op.op];
      const hasPrevious =
        op.op !== PatchOp.Add && op.previousValue !== undefined;
      return (
        <React.Fragment key={index}>
          <dt className="text-content-muted text-xs">
            {pathToFieldName(op.path)}
          </dt>
          <dd className="text-content-muted break-words text-sm">
            {hasPrevious ? (
              <span className="line-through decoration-content-muted/40">
                {resolveDisplayValue(op.previousValue, op.path, resolveUserId)}
              </span>
            ) : (
              <span className="italic">—</span>
            )}
          </dd>
          <span
            className={`font-mono text-sm ${ind.className}`}
            aria-hidden="true"
          >
            {ind.symbol}
          </span>
          <dd className="text-content break-words text-sm">
            {op.op === PatchOp.Remove ? (
              <span className="text-danger italic">removed</span>
            ) : (
              resolveDisplayValue(op.value, op.path, resolveUserId)
            )}
          </dd>
        </React.Fragment>
      );
    })}
  </dl>
);

const SimplePropertyList: React.FC<{
  data: Record<string, unknown>;
  depth?: number;
}> = ({ data, depth = 0 }) => (
  <dl
    className={`grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-1 ${depth > 0 ? 'col-span-2 ml-4 mt-1' : ''}`}
  >
    {Object.entries(data).map(([key, value]) => (
      <React.Fragment key={key}>
        <dt className="text-content-muted text-xs">{formatKey(key)}</dt>
        <dd className="text-content min-w-0 break-words text-sm">
          {isObject(value) ? (
            <SimplePropertyList data={value} depth={depth + 1} />
          ) : Array.isArray(value) ? (
            value.length === 0 ? (
              '—'
            ) : (
              value.map(formatValue).join(', ')
            )
          ) : (
            formatValue(value)
          )}
        </dd>
      </React.Fragment>
    ))}
  </dl>
);

const CopyableValue: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  const display = isUuid(value)
    ? `${value.slice(0, 8)}…${value.slice(-4)}`
    : value;
  return (
    <Button
      variant="tertiary"
      size="s"
      onClick={handleCopy}
      title={value}
      className="text-content-secondary hover:text-content group !px-0 font-mono text-xs"
      endIcon={
        copied ? (
          <CheckIcon className="text-success h-3.5 w-3.5" />
        ) : (
          <ClipboardIcon className="group-hover:text-content-muted text-content-placeholder h-3.5 w-3.5 transition-colors" />
        )
      }
    >
      {display}
    </Button>
  );
};

const FileRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  filename: string;
}> = ({ icon, label, filename }) => (
  <div className="flex min-w-0 items-center gap-3 text-sm">
    <div className="text-content-placeholder flex-shrink-0">{icon}</div>
    <span className="text-content-muted w-[50px] flex-shrink-0 text-xs">
      {label}
    </span>
    <span
      className="text-content-secondary min-w-0 truncate font-mono text-xs"
      title={filename}
    >
      {filename}
    </span>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <>
    <dt className="text-content-muted pt-0.5 text-xs">{label}</dt>
    <dd className="text-content min-w-0 text-sm">{children}</dd>
  </>
);

const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({
  log,
  isOpen,
  onClose,
  teamSlug,
}) => {
  const { t } = useTranslation('common');

  // Resolve user UUIDs in patch values to readable member names. The query
  // is gated on `teamSlug` so call sites without team context don't issue
  // an empty-slug request; absent that lookup the modal still renders
  // (UUIDs simply fall through `formatValue`).
  const { data: members } = useQuery({
    queryKey: queryKeys.teams.members(teamSlug ?? ''),
    queryFn: () => teamsEndpoints.getMembers(teamSlug!),
    enabled: !!teamSlug && isOpen,
  });
  const userIdToName = useMemo(() => {
    const map = new Map<string, string>();
    members?.forEach((member: any) => {
      const id = member?.userId ?? member?.user?.id;
      const name = member?.user?.name ?? member?.user?.email;
      if (id && name) map.set(id, name);
    });
    return map;
  }, [members]);
  const resolveUserId = useMemo(
    () => (teamSlug ? (id: string) => userIdToName.get(id) : undefined),
    [teamSlug, userIdToName]
  );

  if (!log) return null;

  const crud = getCrudConfig(log.crud);
  const metadata = log.metadata
    ? parseMetadata(log.metadata as Record<string, unknown>)
    : null;
  const metadataData = metadata?.data;
  const metadataType = metadata?.type;

  // Pull file context out of raw metadata so we can show it in a dedicated block.
  let inputFilename: string | undefined;
  let outputFilename: string | undefined;
  let extraMetadata: Record<string, unknown> | undefined;
  if (metadataType === 'raw' && isObject(metadataData)) {
    const { inputFilename: i, outputFilename: o, ...rest } = metadataData;
    inputFilename = typeof i === 'string' ? i : undefined;
    outputFilename = typeof o === 'string' ? o : undefined;
    if (Object.keys(rest).length > 0) extraMetadata = rest;
  }

  const hasFiles = !!(inputFilename || outputFilename);
  const hasChanges =
    metadataType === 'patch' ||
    (metadataType === 'snapshot' &&
      isObject(metadataData) &&
      Object.keys(metadataData).length > 0) ||
    (metadataType === 'raw' && !!extraMetadata);

  const targetTypeLabel = t(
    oscratEntityTypeTranslationMap[log.targetType] ?? '',
    { defaultValue: log.targetType }
  );
  const actionLabel = t(getAuditActionTranslationKey(log.action), {
    defaultValue: log.action,
  });

  const showSeparateTargetId = log.targetId && log.targetName !== log.targetId;

  return (
    <Modal open={isOpen} close={onClose} size="lg">
      <Modal.Header>
        <div className="flex flex-col">
          <div
            className="text-content text-base font-semibold leading-tight"
            title={log.action}
          >
            {actionLabel}
          </div>
          <div className="mt-1 text-xs">
            <span className={`rounded px-1.5 py-0.5 ${crud.bg} ${crud.text}`}>
              {t(crud.labelKey, { defaultValue: log.crud.toUpperCase() })}
            </span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="max-h-[60vh] space-y-5 overflow-y-auto py-2">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3">
            <Field label={t('user')}>
              <div className="font-medium">
                {log.userName || log.userId || '—'}
              </div>
              {log.userEmail && (
                <div className="text-content-muted text-xs">
                  {log.userEmail}
                </div>
              )}
            </Field>

            <Field label={t('timestamp')}>
              {formatTimestamp(log.createdAt, true)}
            </Field>

            {(log.productName || log.versionName) && (
              <Field
                label={
                  log.versionName
                    ? `${t('product')} · ${t('version')}`
                    : t('product')
                }
              >
                {log.productName ?? '—'}
                {log.versionName && (
                  <span className="text-content-muted">
                    {' '}
                    · {log.versionName}
                  </span>
                )}
              </Field>
            )}

            <Field label={t('target')}>
              <div>{targetTypeLabel}</div>
              {log.targetName && (
                <div>
                  {isUuid(log.targetName) ? (
                    <CopyableValue value={log.targetName} />
                  ) : (
                    <span
                      className="text-content-muted break-all text-xs"
                      title={log.targetName}
                    >
                      {log.targetName}
                    </span>
                  )}
                </div>
              )}
              {showSeparateTargetId && (
                <div>
                  <CopyableValue value={log.targetId!} />
                </div>
              )}
            </Field>
          </dl>

          {hasFiles && (
            <div>
              <h3 className="text-content-secondary mb-2 text-sm font-medium">
                {t('files')}
              </h3>
              <div className="space-y-1 pl-1">
                {inputFilename && (
                  <FileRow
                    icon={<ArrowUpTrayIcon className="h-4 w-4" />}
                    label="Input"
                    filename={inputFilename}
                  />
                )}
                {outputFilename && (
                  <FileRow
                    icon={<ArrowDownTrayIcon className="h-4 w-4" />}
                    label="Output"
                    filename={outputFilename}
                  />
                )}
              </div>
            </div>
          )}

          {hasChanges && (
            <div>
              <h3 className="text-content-secondary mb-2 text-sm font-medium">
                {t('changes')}
              </h3>
              <div className="pl-1">
                {metadataType === 'patch' ? (
                  <PatchDisplay
                    patch={metadataData as PatchOperation[]}
                    resolveUserId={resolveUserId}
                  />
                ) : metadataType === 'snapshot' && isObject(metadataData) ? (
                  <SimplePropertyList data={metadataData} />
                ) : extraMetadata ? (
                  <SimplePropertyList data={extraMetadata} />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {t('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuditDetailsModal;

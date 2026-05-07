import React, { useState } from 'react';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import Button from '@atlaskit/button';
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

interface AuditDetailsModalProps {
  log: OscratAuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatKey = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const isDateString = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) ||
  /^\d{4}-\d{2}-\d{2}$/.test(value);

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && isDateString(value)) {
    return new Date(value).toLocaleString();
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

const opIndicator: Record<PatchOpValue, { symbol: string; className: string }> = {
  [PatchOp.Replace]: { symbol: '→', className: 'text-amber-600' },
  [PatchOp.Add]:     { symbol: '+', className: 'text-emerald-600' },
  [PatchOp.Remove]:  { symbol: '−', className: 'text-rose-600' },
};

const PatchDisplay: React.FC<{ patch: PatchOperation[] }> = ({ patch }) => (
  <dl className="grid grid-cols-[max-content_max-content_1fr] gap-x-3 gap-y-1.5 items-baseline">
    {patch.map((op, index) => {
      const ind = opIndicator[op.op];
      return (
        <React.Fragment key={index}>
          <dt className="text-xs text-gray-500">{pathToFieldName(op.path)}</dt>
          <span className={`font-mono text-sm ${ind.className}`}>{ind.symbol}</span>
          <dd className="text-sm text-gray-900 break-words">
            {op.op === PatchOp.Remove ? (
              <span className="text-rose-600 italic">removed</span>
            ) : (
              formatValue(op.value)
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
    className={`grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 items-baseline ${depth > 0 ? 'ml-4 mt-1 col-span-2' : ''}`}
  >
    {Object.entries(data).map(([key, value]) => (
      <React.Fragment key={key}>
        <dt className="text-xs text-gray-500">{formatKey(key)}</dt>
        <dd className="text-sm text-gray-900 break-words min-w-0">
          {isObject(value) ? (
            <SimplePropertyList data={value} depth={depth + 1} />
          ) : Array.isArray(value) ? (
            value.length === 0 ? '—' : value.map(formatValue).join(', ')
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
  const display = isUuid(value) ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={value}
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-gray-700 hover:text-gray-900"
    >
      <span>{display}</span>
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <ClipboardIcon className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      )}
    </button>
  );
};

const FileRow: React.FC<{ icon: React.ReactNode; label: string; filename: string }> = ({ icon, label, filename }) => (
  <div className="flex items-center gap-3 text-sm min-w-0">
    <div className="text-gray-400 flex-shrink-0">{icon}</div>
    <span className="text-xs text-gray-500 w-[50px] flex-shrink-0">{label}</span>
    <span className="font-mono text-xs text-gray-700 truncate min-w-0" title={filename}>
      {filename}
    </span>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <>
    <dt className="text-xs text-gray-500 pt-0.5">{label}</dt>
    <dd className="text-sm text-gray-900 min-w-0">{children}</dd>
  </>
);

const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('common');

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
    (metadataType === 'snapshot' && isObject(metadataData) && Object.keys(metadataData).length > 0) ||
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
    <Modal open={isOpen} className="bg-white text-gray-900 max-w-2xl">
      <Modal.Header className="border-b border-gray-100 pb-3 mb-0">
        <div
          className="font-semibold text-base text-gray-900 leading-tight"
          title={log.action}
        >
          {actionLabel}
        </div>
        <div className="mt-1 text-xs">
          <span className={`px-1.5 py-0.5 rounded ${crud.bg} ${crud.text}`}>
            {t(crud.labelKey, { defaultValue: log.crud.toUpperCase() })}
          </span>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="max-h-[60vh] overflow-y-auto py-2 space-y-5">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3">
            <Field label={t('user')}>
              <div className="font-medium">{log.userName || log.userId || '—'}</div>
              {log.userEmail && (
                <div className="text-xs text-gray-500">{log.userEmail}</div>
              )}
            </Field>

            <Field label={t('timestamp')}>
              {formatTimestamp(log.createdAt, true)}
            </Field>

            {(log.productName || log.versionName) && (
              <Field label={log.versionName ? `${t('product')} · ${t('version')}` : t('product')}>
                {log.productName ?? '—'}
                {log.versionName && (
                  <span className="text-gray-500"> · {log.versionName}</span>
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
                    <span className="text-xs text-gray-500 break-all" title={log.targetName}>
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
              <h3 className="text-sm font-medium text-gray-700 mb-2">
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
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {t('changes')}
              </h3>
              <div className="pl-1">
                {metadataType === 'patch' ? (
                  <PatchDisplay patch={metadataData as PatchOperation[]} />
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

      <Modal.Actions className="border-t border-gray-100 pt-3">
        <Button appearance="default" onClick={onClose}>
          {t('close')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default AuditDetailsModal;

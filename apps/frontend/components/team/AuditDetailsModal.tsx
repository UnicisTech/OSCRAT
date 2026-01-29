import React from 'react';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import Button from '@atlaskit/button';
import type { OscratAuditLog } from '@oscrat/model';
import { getAuditActionTranslationKey } from '@/utils/translation';
import { getCrudConfig, formatTimestamp } from '@/lib/auditUtils';

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

interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
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

const pathToFieldName = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? formatKey(parts[parts.length - 1]) : path;
};

const PatchDisplay: React.FC<{ patch: PatchOperation[] }> = ({ patch }) => {
  return (
    <dl className="space-y-1">
      {patch.map((op, index) => (
        <div key={index} className="flex py-1">
          <dt className="text-gray-500 min-w-[140px] flex-shrink-0">
            {pathToFieldName(op.path)}
          </dt>
          <dd className="text-gray-900">
            {op.op === 'replace' && (
              <span>→ {formatValue(op.value)}</span>
            )}
            {op.op === 'add' && (
              <span className="text-emerald-600">+ {formatValue(op.value)}</span>
            )}
            {op.op === 'remove' && (
              <span className="text-rose-600">removed</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const SimplePropertyList: React.FC<{
  data: Record<string, unknown>;
  depth?: number;
}> = ({ data, depth = 0 }) => {
  return (
    <dl className={depth > 0 ? 'ml-4' : ''}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex py-1">
          <dt className="text-gray-500 min-w-[140px] flex-shrink-0">
            {formatKey(key)}
          </dt>
          <dd className="text-gray-900">
            {isObject(value) ? (
              <SimplePropertyList data={value} depth={depth + 1} />
            ) : Array.isArray(value) ? (
              value.length === 0 ? (
                '—'
              ) : (
                <span>{value.map(formatValue).join(', ')}</span>
              )
            ) : (
              formatValue(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('common');

  if (!log) {
    return null;
  }

  const crudStyle = getCrudConfig(log.crud);
  const metadata = log.metadata
    ? parseMetadata(log.metadata as Record<string, unknown>)
    : null;
  const metadataData = metadata?.data;
  const metadataType = metadata?.type;
  const hasMetadataData = metadataData !== null && metadataData !== undefined;

  return (
    <Modal open={isOpen}>
      <Modal.Header className="font-bold">Audit Log Details</Modal.Header>

      <Modal.Body>
        <div className="max-h-[60vh] overflow-y-auto space-y-6">
          {/* Context section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('context')}
            </h3>

            {/* Action - CRUD badge only */}
            <div>
              <div className="text-sm font-medium text-gray-500">
                {t('action')}
              </div>
              <div className="mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${crudStyle.bg} ${crudStyle.text}`}
                >
                  {crudStyle.label}
                </span>
              </div>
            </div>

            {/* Scope - full action string */}
            <div>
              <div className="text-sm font-medium text-gray-500">
                {t('scope')}
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {t(getAuditActionTranslationKey(log.action), { defaultValue: log.action })}
              </div>
            </div>

            {/* User info */}
            <div>
              <div className="text-sm font-medium text-gray-500">
                {t('user')}
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {log.userName || log.userId || '—'}
              </div>
              {log.userEmail && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {log.userEmail}
                </div>
              )}
            </div>

            {/* Target info */}
            <div>
              <div className="text-sm font-medium text-gray-500">
                {t('target')}
              </div>
              <div className="mt-1 text-sm text-gray-900">{log.targetType}</div>
              {log.targetName && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {log.targetName}
                </div>
              )}
            </div>

            {/* Product context */}
            {log.productName && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {t('product')}
                </div>
                <div className="mt-1 text-sm text-gray-900">{log.productName}</div>
              </div>
            )}

            {/* Version context */}
            {log.versionName && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {t('version')}
                </div>
                <div className="mt-1 text-sm text-gray-900">{log.versionName}</div>
              </div>
            )}

            {/* Timestamp */}
            <div>
              <div className="text-sm font-medium text-gray-500">
                {t('timestamp')}
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {formatTimestamp(log.createdAt, true)}
              </div>
            </div>
          </div>

          {/* Changes section (if metadata exists) */}
          {hasMetadataData && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {t('changes')}
              </h3>
              <div className="text-sm">
                {metadataType === 'patch' ? (
                  <PatchDisplay patch={metadataData as PatchOperation[]} />
                ) : isObject(metadataData) ? (
                  <SimplePropertyList data={metadataData} />
                ) : (
                  <span className="text-gray-900">{formatValue(metadataData)}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Actions>
        <Button appearance="default" onClick={onClose}>
          {t('close')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default AuditDetailsModal;

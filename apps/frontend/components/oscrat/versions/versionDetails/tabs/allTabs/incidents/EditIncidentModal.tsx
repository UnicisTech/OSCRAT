import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
  type OscratIncidentDetail,
  type OscratIncidentUpdate,
} from '@oscrat/model';
import { FaDownload, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import ActionButton from '@/components/oscrat/ActionButton';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';
import { formatDateLong } from '@/utils/dateFormat';
import { incidentUpdateSchema } from '@/lib/validation/incident';
import * as Yup from 'yup';
import {
  INCIDENT_STATUS_MAP,
  INCIDENT_CLASSIFICATION_MAP,
  INCIDENT_ATTACK_TYPE_MAP,
  INCIDENT_SEVERITY_MAP,
} from '@/utils/incidentEnumMaps';

interface EditIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: OscratIncidentDetail;
  onSave: (data: OscratIncidentUpdate) => Promise<void>;
  version?: { version: string };
  product?: { name: string };
  teamMembers?: Array<{
    userId: string;
    user: { name: string; email: string };
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    mimeType?: string;
    createdAt: Date;
  }>;
  onUploadAttachment?: (file: File) => Promise<{ id: string }>;
  onDownloadAttachment?: (
    attachmentId: string,
    filename: string
  ) => Promise<void>;
}

const EditIncidentModal: React.FC<EditIncidentModalProps> = ({
  isOpen,
  onClose,
  incident,
  onSave,
  version,
  product,
  teamMembers,
  attachments,
  onUploadAttachment,
  onDownloadAttachment,
}) => {
  const { t } = useTranslation('common');

  const mapIncidentToFormData = (incident: OscratIncidentDetail) => ({
    name: incident.name || '',
    status: incident.status,
    classification: incident.classification,
    attackType: incident.attackType,
    assetDetails: incident.assetDetails || '',
    reporterId: incident.reporter.id,
    dateOfDetection: incident.dateOfDetection
      ? new Date(incident.dateOfDetection).toISOString().split('T')[0]
      : '',
    severity: incident.severity,
    handlingDate: incident.handlingDate
      ? new Date(incident.handlingDate).toISOString().split('T')[0]
      : '',
    description: incident.description,
    correctiveActions: incident.correctiveActions || '',
    rootCause: incident.rootCause || '',
    scope: incident.scope,
    preventiveActions: incident.preventiveActions || '',
    suspectedUnlawfulAct: incident.suspectedUnlawfulAct,
    unlawfulActDescription: incident.unlawfulActDescription || '',
    crossBorderImpact: incident.crossBorderImpact,
    crossBorderImpactDetails: incident.crossBorderImpactDetails || '',
  });

  const [formData, setFormData] = useState(() =>
    mapIncidentToFormData(incident)
  );
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(mapIncidentToFormData(incident));
    setPendingFiles([]);
  }, [incident, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFiles((prev) => [...prev, file]);
    toast.success(t('oscrat.ui.file-added-will-upload-on-save'));
    e.target.value = '';
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadAttachment = async (
    attachmentId: string,
    filename: string
  ) => {
    if (!onDownloadAttachment) return;
    try {
      await onDownloadAttachment(attachmentId, filename);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-download'))
      );
    }
  };

  const uploadPendingFiles = async (): Promise<string[]> => {
    if (pendingFiles.length === 0 || !onUploadAttachment) return [];

    const uploadedIds: string[] = [];
    for (const file of pendingFiles) {
      try {
        const result = await onUploadAttachment(file);
        uploadedIds.push(result.id);
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(
            error,
            `${t('oscrat.ui.failed-to-upload-file')}: ${file.name}`
          )
        );
        throw error; // Re-throw to stop the save process
      }
    }
    return uploadedIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: OscratIncidentUpdate = {
      name: formData.name.trim(),
      status: formData.status,
      classification: formData.classification,
      attackType: formData.attackType,
      assetDetails: formData.assetDetails || undefined,
      reporterId: formData.reporterId,
      dateOfDetection: new Date(formData.dateOfDetection),
      severity: formData.severity,
      handlingDate: formData.handlingDate
        ? new Date(formData.handlingDate)
        : undefined,
      description: formData.description,
      correctiveActions: formData.correctiveActions || undefined,
      rootCause: formData.rootCause || undefined,
      scope: formData.scope,
      preventiveActions: formData.preventiveActions || undefined,
      suspectedUnlawfulAct: formData.suspectedUnlawfulAct,
      unlawfulActDescription: formData.suspectedUnlawfulAct
        ? formData.unlawfulActDescription || undefined
        : undefined,
      crossBorderImpact: formData.crossBorderImpact,
      crossBorderImpactDetails: formData.crossBorderImpact
        ? formData.crossBorderImpactDetails || undefined
        : undefined,
      updatedBy: '', // Will be set by API from authenticated user
    };

    // Validate form data
    try {
      await incidentUpdateSchema.validate(updateData, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        toast.error(t(error.errors[0]));
      }
      return;
    }

    setSaving(true);
    try {
      // Upload pending files first and get their IDs
      const uploadedAttachmentIds = await uploadPendingFiles();

      // Include ALL attachment IDs (existing + newly uploaded)
      // Always preserve existing attachments, even if no new files are uploaded
      const existingAttachmentIds = attachments?.map((att) => att.id) || [];
      updateData.attachmentIds =
        uploadedAttachmentIds.length > 0
          ? [...existingAttachmentIds, ...uploadedAttachmentIds]
          : existingAttachmentIds;

      // Save incident updates
      await onSave(updateData);

      toast.success(t('oscrat.ui.versions.incidents.updated-successfully'));
      setPendingFiles([]);
      onClose();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.incidents.failed-to-update')
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} close={onClose} size="2xl">
      <Modal.Header>
        {t('oscrat.ui.versions.incidents.edit-incident')}
      </Modal.Header>
      <Modal.Body>
        <form
          id="edit-incident-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Section 1: Read-Only Fields */}
          <div className="border-line bg-surface-muted rounded-card border p-4">
            <h3 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.versions.incidents.context-information')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.version')}
                </label>
                <input
                  type="text"
                  value={version?.version || ''}
                  disabled
                  className="border-line bg-surface-muted text-content-secondary rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.product')}
                </label>
                <input
                  type="text"
                  value={product?.name || ''}
                  disabled
                  className="border-line bg-surface-muted text-content-secondary rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Editable Fields */}
          <div className="border-line bg-surface rounded-card border p-4">
            <h3 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.versions.incidents.incident-information')}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder={t('oscrat.ui.versions.incidents.name-placeholder')}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.status')} *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                >
                  {Object.values(IncidentStatus).map((status) => (
                    <option key={status} value={status}>
                      {t(INCIDENT_STATUS_MAP[status])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.classification')} *
                </label>
                <select
                  name="classification"
                  value={formData.classification}
                  onChange={handleInputChange}
                  required
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                >
                  {Object.values(IncidentClassification).map(
                    (classification) => (
                      <option key={classification} value={classification}>
                        {t(INCIDENT_CLASSIFICATION_MAP[classification])}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.attack-type')} *
                </label>
                <select
                  name="attackType"
                  value={formData.attackType}
                  onChange={handleInputChange}
                  required
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                >
                  {Object.values(IncidentAttackType).map((attackType) => (
                    <option key={attackType} value={attackType}>
                      {t(INCIDENT_ATTACK_TYPE_MAP[attackType])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.asset-details')}
                </label>
                <input
                  type="text"
                  name="assetDetails"
                  value={formData.assetDetails}
                  onChange={handleInputChange}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.reporter')} *
                </label>
                <select
                  name="reporterId"
                  value={formData.reporterId}
                  onChange={handleInputChange}
                  required
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                >
                  {teamMembers?.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.date-of-detection')} *
                </label>
                <input
                  type="date"
                  name="dateOfDetection"
                  value={formData.dateOfDetection}
                  onChange={handleInputChange}
                  required
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.severity')} *
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                >
                  {Object.values(IncidentSeverity).map((severity) => (
                    <option key={severity} value={severity}>
                      {t(INCIDENT_SEVERITY_MAP[severity])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.handling-date')}
                </label>
                <input
                  type="date"
                  name="handlingDate"
                  value={formData.handlingDate}
                  onChange={handleInputChange}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.description')} *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.corrective-actions')}
                </label>
                <textarea
                  name="correctiveActions"
                  value={formData.correctiveActions}
                  onChange={handleInputChange}
                  rows={3}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.root-cause')}
                </label>
                <textarea
                  name="rootCause"
                  value={formData.rootCause}
                  onChange={handleInputChange}
                  rows={3}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.scope')} *
                </label>
                <textarea
                  name="scope"
                  value={formData.scope}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.preventive-actions')}
                </label>
                <textarea
                  name="preventiveActions"
                  value={formData.preventiveActions}
                  onChange={handleInputChange}
                  rows={3}
                  className="border-line rounded-input mt-1 w-full border px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="suspectedUnlawfulAct"
                    checked={formData.suspectedUnlawfulAct}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-content-secondary text-sm font-medium">
                    {t('oscrat.ui.versions.incidents.suspected-unlawful-act')}
                  </span>
                </label>
                {formData.suspectedUnlawfulAct && (
                  <textarea
                    name="unlawfulActDescription"
                    value={formData.unlawfulActDescription}
                    onChange={handleInputChange}
                    placeholder={t(
                      'oscrat.ui.versions.incidents.describe-situation'
                    )}
                    rows={3}
                    className="border-line rounded-input mt-2 w-full border px-3 py-2"
                  />
                )}
              </div>

              <div className="col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="crossBorderImpact"
                    checked={formData.crossBorderImpact}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-content-secondary text-sm font-medium">
                    {t('oscrat.ui.versions.incidents.cross-border-impact')}
                  </span>
                </label>
                {formData.crossBorderImpact && (
                  <textarea
                    name="crossBorderImpactDetails"
                    value={formData.crossBorderImpactDetails}
                    onChange={handleInputChange}
                    placeholder={t(
                      'oscrat.ui.versions.incidents.provide-details'
                    )}
                    rows={3}
                    className="border-line rounded-input mt-2 w-full border px-3 py-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Attachments */}
          <div className="border-line bg-surface rounded-card border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-content text-lg font-semibold">
                {t('oscrat.ui.attachments')}
              </h3>
              {onUploadAttachment && (
                <label className="border-line bg-surface text-content-secondary hover:bg-surface-muted rounded-input inline-flex cursor-pointer items-center border px-4 py-2 text-sm font-medium">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={saving}
                    className="hidden"
                  />
                  {t('oscrat.ui.add-document')}
                </label>
              )}
            </div>

            {/* Pending files to upload */}
            {pendingFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-content-secondary mb-2 text-sm font-medium">
                  {t('oscrat.ui.pending-uploads')}:
                </h4>
                <div className="space-y-2">
                  {pendingFiles.map((file, index) => (
                    <div
                      key={index}
                      className="bg-warning-subtle rounded-input flex items-center justify-between px-3 py-2"
                    >
                      <span className="text-content-secondary text-sm">
                        {file.name}
                      </span>
                      <ActionButton
                        onClick={() => handleRemovePendingFile(index)}
                        disabled={saving}
                        icon={<FaTrash size={12} />}
                        title={t('remove')}
                      >
                        {t('remove')}
                      </ActionButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {attachments && attachments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="divide-line-subtle min-w-full divide-y">
                  <thead className="bg-surface-muted border-b border-line-header">
                    <tr>
                      <th className="text-content p-4 text-left text-b2 font-medium">
                        {t('oscrat.ui.name')}
                      </th>
                      <th className="text-content p-4 text-left text-b2 font-medium">
                        {t('oscrat.ui.type')}
                      </th>
                      <th className="text-content p-4 text-left text-b2 font-medium">
                        {t('oscrat.ui.date-added')}
                      </th>
                      <th className="text-content p-4 text-left text-b2 font-medium">
                        {t('oscrat.ui.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-line-subtle divide-y">
                    {attachments.map((attachment) => (
                      <tr key={attachment.id}>
                        <td className="text-content whitespace-nowrap px-4 py-3 text-sm">
                          {attachment.name}
                        </td>
                        <td className="text-content-muted whitespace-nowrap px-4 py-3 text-sm">
                          {attachment.mimeType || '-'}
                        </td>
                        <td className="text-content-muted whitespace-nowrap px-4 py-3 text-sm">
                          {formatDateLong(attachment.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          {onDownloadAttachment && (
                            <Button
                              variant="tertiary"
                              size="s"
                              type="button"
                              onClick={() =>
                                handleDownloadAttachment(
                                  attachment.id,
                                  attachment.name
                                )
                              }
                              startIcon={<FaDownload size={12} />}
                            >
                              {t('oscrat.ui.download')}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-content-muted text-center text-sm">
                {t('oscrat.ui.no-attachments')}
              </p>
            )}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          type="button"
          onClick={onClose}
          disabled={saving}
        >
          {t('oscrat.ui.cancel')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="edit-incident-form"
          disabled={saving}
          loading={saving}
        >
          {saving ? t('oscrat.ui.saving') : t('oscrat.ui.save-changes')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditIncidentModal;

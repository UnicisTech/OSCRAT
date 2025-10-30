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
import { FaDownload, FaTimes, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import ActionButton from '@/components/oscrat/ActionButton';
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
  teamMembers?: Array<{ userId: string; user: { name: string; email: string } }>;
  attachments?: Array<{ id: string; name: string; mimeType?: string; createdAt: Date }>;
  onUploadAttachment?: (file: File) => Promise<{ id: string }>;
  onDownloadAttachment?: (attachmentId: string, filename: string) => Promise<void>;
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

  const [formData, setFormData] = useState(() => mapIncidentToFormData(incident));
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(mapIncidentToFormData(incident));
    setPendingFiles([]);
  }, [incident, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFiles(prev => [...prev, file]);
    toast.success(t('oscrat.ui.file-added-will-upload-on-save'));
    e.target.value = '';
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    if (!onDownloadAttachment) return;
    try {
      await onDownloadAttachment(attachmentId, filename);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-download')));
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
        toast.error(extractErrorMessage(error, `${t('oscrat.ui.failed-to-upload-file')}: ${file.name}`));
        throw error; // Re-throw to stop the save process
      }
    }
    return uploadedIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: OscratIncidentUpdate = {
      status: formData.status,
      classification: formData.classification,
      attackType: formData.attackType,
      assetDetails: formData.assetDetails || undefined,
      reporterId: formData.reporterId,
      dateOfDetection: new Date(formData.dateOfDetection),
      severity: formData.severity,
      handlingDate: formData.handlingDate ? new Date(formData.handlingDate) : undefined,
      description: formData.description,
      correctiveActions: formData.correctiveActions || undefined,
      rootCause: formData.rootCause || undefined,
      scope: formData.scope,
      preventiveActions: formData.preventiveActions || undefined,
      suspectedUnlawfulAct: formData.suspectedUnlawfulAct,
      unlawfulActDescription: formData.suspectedUnlawfulAct ? formData.unlawfulActDescription || undefined : undefined,
      crossBorderImpact: formData.crossBorderImpact,
      crossBorderImpactDetails: formData.crossBorderImpact ? formData.crossBorderImpactDetails || undefined : undefined,
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
      const existingAttachmentIds = attachments?.map(att => att.id) || [];
      updateData.attachmentIds = uploadedAttachmentIds.length > 0
        ? [...existingAttachmentIds, ...uploadedAttachmentIds]
        : existingAttachmentIds;

      // Save incident updates
      await onSave(updateData);
      
      toast.success(t('oscrat.ui.versions.incidents.updated-successfully'));
      setPendingFiles([]);
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.versions.incidents.failed-to-update')));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('oscrat.ui.versions.incidents.edit-incident')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Section 1: Read-Only Fields */}
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t('oscrat.ui.versions.incidents.context-information')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.version')}
                  </label>
                  <input
                    type="text"
                    value={version?.version || ''}
                    disabled
                    className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.product')}
                  </label>
                  <input
                    type="text"
                    value={product?.name || ''}
                    disabled
                    className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Editable Fields */}
            <div className="rounded-lg border border-gray-300 bg-white p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {t('oscrat.ui.versions.incidents.incident-information')}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.status')} *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {Object.values(IncidentStatus).map((status) => (
                      <option key={status} value={status}>
                        {t(INCIDENT_STATUS_MAP[status])}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.classification')} *
                  </label>
                  <select
                    name="classification"
                    value={formData.classification}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {Object.values(IncidentClassification).map((classification) => (
                      <option key={classification} value={classification}>
                        {t(INCIDENT_CLASSIFICATION_MAP[classification])}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.attack-type')} *
                  </label>
                  <select
                    name="attackType"
                    value={formData.attackType}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {Object.values(IncidentAttackType).map((attackType) => (
                      <option key={attackType} value={attackType}>
                        {t(INCIDENT_ATTACK_TYPE_MAP[attackType])}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.asset-details')}
                  </label>
                  <input
                    type="text"
                    name="assetDetails"
                    value={formData.assetDetails}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.reporter')} *
                  </label>
                  <select
                    name="reporterId"
                    value={formData.reporterId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {teamMembers?.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.date-of-detection')} *
                  </label>
                  <input
                    type="date"
                    name="dateOfDetection"
                    value={formData.dateOfDetection}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.severity')} *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {Object.values(IncidentSeverity).map((severity) => (
                      <option key={severity} value={severity}>
                        {t(INCIDENT_SEVERITY_MAP[severity])}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.handling-date')}
                  </label>
                  <input
                    type="date"
                    name="handlingDate"
                    value={formData.handlingDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.description')} *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.corrective-actions')}
                  </label>
                  <textarea
                    name="correctiveActions"
                    value={formData.correctiveActions}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.root-cause')}
                  </label>
                  <textarea
                    name="rootCause"
                    value={formData.rootCause}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.scope')} *
                  </label>
                  <textarea
                    name="scope"
                    value={formData.scope}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.versions.incidents.preventive-actions')}
                  </label>
                  <textarea
                    name="preventiveActions"
                    value={formData.preventiveActions}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
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
                    <span className="text-sm font-medium text-gray-700">
                      {t('oscrat.ui.versions.incidents.suspected-unlawful-act')}
                    </span>
                  </label>
                  {formData.suspectedUnlawfulAct && (
                    <textarea
                      name="unlawfulActDescription"
                      value={formData.unlawfulActDescription}
                      onChange={handleInputChange}
                      placeholder={t('oscrat.ui.versions.incidents.describe-situation')}
                      rows={3}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
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
                    <span className="text-sm font-medium text-gray-700">
                      {t('oscrat.ui.versions.incidents.cross-border-impact')}
                    </span>
                  </label>
                  {formData.crossBorderImpact && (
                    <textarea
                      name="crossBorderImpactDetails"
                      value={formData.crossBorderImpactDetails}
                      onChange={handleInputChange}
                      placeholder={t('oscrat.ui.versions.incidents.provide-details')}
                      rows={3}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Attachments */}
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('oscrat.ui.attachments')}
                </h3>
                {onUploadAttachment && (
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    {t('oscrat.ui.pending-uploads')}:
                  </h4>
                  <div className="space-y-2">
                    {pendingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md bg-yellow-50 px-3 py-2">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <ActionButton
                          onClick={() => handleRemovePendingFile(index)}
                          disabled={saving}
                          icon={<FaTrash size={12} />}
                          title={t('oscrat.ui.remove')}
                        >
                          {t('oscrat.ui.remove')}
                        </ActionButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attachments && attachments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('oscrat.ui.name')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('oscrat.ui.type')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('oscrat.ui.date-added')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('oscrat.ui.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {attachments.map((attachment) => (
                        <tr key={attachment.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                            {attachment.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {attachment.mimeType || '-'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {formatDateLong(attachment.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            {onDownloadAttachment && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadAttachment(attachment.id, attachment.name)
                                }
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <FaDownload size={12} />
                                {t('oscrat.ui.download')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">
                  {t('oscrat.ui.no-attachments')}
                </p>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-6 flex justify-end gap-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('oscrat.ui.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? t('oscrat.ui.saving') : t('oscrat.ui.save-changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIncidentModal;


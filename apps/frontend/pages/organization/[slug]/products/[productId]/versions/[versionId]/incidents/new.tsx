import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import { useIncidents } from '@/hooks/oscrat/useIncidents';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import { Breadcrumb } from '@/components/shared';
import Button from '@/components/button';
import { FaTrash } from 'react-icons/fa';
import {
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
  type OscratIncidentCreate,
} from '@oscrat/model';
import { incidentCreateSchema } from '@/lib/validation/incident';
import * as Yup from 'yup';
import {
  INCIDENT_STATUS_MAP,
  INCIDENT_CLASSIFICATION_MAP,
  INCIDENT_ATTACK_TYPE_MAP,
  INCIDENT_SEVERITY_MAP,
} from '@/utils/incidentEnumMaps';

function NewIncidentPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const { versionContext, teamId, productId, versionId } = useVersionContext();
  const { productContext } = useProductContext();

  const version = versionContext.version;
  const project = productContext.project;
  const { members } = useTeamMembers(slug);
  const { attachments, uploadAttachment, deleteAttachment } =
    useVersionAttachments(teamId, productId, versionId);
  const { createIncident, isCreating } = useIncidents(
    teamId,
    productId,
    versionId
  );

  const [formData, setFormData] = useState({
    name: '',
    status: IncidentStatus.PENDING,
    classification: IncidentClassification.GENERAL,
    attackType: IncidentAttackType.OTHERS,
    assetDetails: '',
    reporterId: '',
    dateOfDetection: new Date().toISOString().split('T')[0],
    severity: IncidentSeverity.LOW,
    handlingDate: '',
    description: '',
    correctiveActions: '',
    rootCause: '',
    scope: '',
    preventiveActions: '',
    suspectedUnlawfulAct: false,
    unlawfulActDescription: '',
    crossBorderImpact: false,
    crossBorderImpactDetails: '',
  });

  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState<string[]>(
    []
  );
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (members && members.length > 0 && !formData.reporterId) {
      setFormData((prev) => ({ ...prev, reporterId: members[0].userId }));
    }
  }, [members]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const attachment = await uploadAttachment(file);
      setUploadedAttachmentIds((prev) => [...prev, attachment.id]);
      toast.success(t('oscrat.ui.file-uploaded-successfully'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-upload-file'))
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId);
      setUploadedAttachmentIds((prev) =>
        prev.filter((id) => id !== attachmentId)
      );
      toast.success(t('oscrat.ui.attachment-deleted'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-delete-attachment'))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createData: OscratIncidentCreate = {
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
      attachmentIds:
        uploadedAttachmentIds.length > 0 ? uploadedAttachmentIds : undefined,
      createdBy: '',
    };

    try {
      await incidentCreateSchema.validate(createData, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const firstError = error.errors[0];
        toast.error(t(firstError));
        return;
      }
    }

    try {
      await createIncident(createData);
      toast.success(t('oscrat.ui.versions.incidents.created-successfully'));
      router.push(
        `/organization/${slug}/products/${productId}/versions/${versionId}?tab=incidents`
      );
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.incidents.failed-to-create'),
          t
        )
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!ready || !teamId || !productId || !versionId) return null;

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${slug}/products`,
    },
    {
      label: project?.name,
      href: `/organization/${slug}/products/${productId}`,
    },
    {
      label: version?.version,
      href: `/organization/${slug}/products/${productId}/versions/${versionId}`,
    },
    {
      label: t('oscrat.ui.versions.incidents.add-new'),
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-content mb-6 text-2xl font-bold">
          {t('oscrat.ui.versions.incidents.add-new')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Context Information (Read-Only) */}
          <div className="border-line bg-surface-muted rounded-lg border p-6">
            <h2 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.versions.incidents.context-information')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.version')}
                </label>
                <input
                  type="text"
                  value={version?.version || ''}
                  disabled
                  className="border-line bg-surface-muted text-content-secondary mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-content-secondary block text-sm font-medium">
                  {t('oscrat.ui.product')}
                </label>
                <input
                  type="text"
                  value={project?.name || ''}
                  disabled
                  className="border-line bg-surface-muted text-content-secondary mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Incident Information */}
          <div className="border-line bg-surface rounded-lg border p-6">
            <h2 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.versions.incidents.incident-information')}
            </h2>
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
                  placeholder={t(
                    'oscrat.ui.versions.incidents.name-placeholder'
                  )}
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
                >
                  {members?.map((member) => (
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                  className="border-line mt-1 w-full rounded-md border px-3 py-2"
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
                    className="border-line mt-2 w-full rounded-md border px-3 py-2"
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
                    className="border-line mt-2 w-full rounded-md border px-3 py-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="border-line bg-surface rounded-lg border p-6">
            <h2 className="text-content mb-4 text-lg font-semibold">
              {t('oscrat.ui.attachments')}
            </h2>
            <div className="mb-4">
              <label className="border-line bg-surface text-content-secondary hover:bg-surface-muted inline-flex cursor-pointer items-center rounded-md border px-4 py-2 text-sm font-medium">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
                {uploadingFile
                  ? t('oscrat.ui.uploading')
                  : t('oscrat.ui.add-document')}
              </label>
            </div>
            {uploadedAttachmentIds.length > 0 && attachments && (
              <div className="space-y-2">
                <p className="text-content-secondary text-sm font-medium">
                  {t('oscrat.ui.uploaded-attachments')}:{' '}
                  {uploadedAttachmentIds.length}
                </p>
                {attachments
                  .filter((att) => uploadedAttachmentIds.includes(att.id))
                  .map((attachment) => (
                    <div
                      key={attachment.id}
                      className="border-line-subtle bg-surface-muted text-content-secondary flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{attachment.name}</span>
                      <Button
                        type="button"
                        tone="danger"
                        variant="tertiary"
                        size="s"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="ml-2"
                        title={t('oscrat.ui.delete')}
                        icon={<FaTrash size={12} />}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={handleCancel}
              text={t('oscrat.ui.cancel')}
            />
            <Button
              type="submit"
              variant="primary"
              size="m"
              disabled={isCreating}
              loading={isCreating}
              text={isCreating ? t('oscrat.ui.adding') : t('oscrat.ui.add')}
            />
          </div>
        </form>
      </div>
    </>
  );
}

NewIncidentPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default NewIncidentPage;

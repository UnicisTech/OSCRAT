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
import { 
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
  type OscratIncidentCreate 
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
  const { attachments, uploadAttachment } = useVersionAttachments(teamId, productId, versionId);
  const { createIncident, isCreating } = useIncidents(teamId, productId, versionId);

  const [formData, setFormData] = useState({
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

  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (members && members.length > 0 && !formData.reporterId) {
      setFormData((prev) => ({ ...prev, reporterId: members[0].userId }));
    }
  }, [members]);


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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const attachment = await uploadAttachment(file);
      setUploadedAttachmentIds(prev => [...prev, attachment.id]);
      toast.success(t('oscrat.ui.file-uploaded-successfully'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-upload-file')));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createData: OscratIncidentCreate = {
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
      attachmentIds: uploadedAttachmentIds.length > 0 ? uploadedAttachmentIds : undefined,
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
      router.push(`/teams/${slug}/products/${productId}/versions/${versionId}?tab=incidents`);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.versions.incidents.failed-to-create')));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!ready || !teamId || !productId || !versionId) return null;

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/teams/${slug}/products`,
    },
    {
      label: project?.name,
      href: `/teams/${slug}/products/${productId}`,
    },
    {
      label: version?.version,
      href: `/teams/${slug}/products/${productId}/versions/${versionId}`,
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
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {t('oscrat.ui.versions.incidents.add-new')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Context Information (Read-Only) */}
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t('oscrat.ui.versions.incidents.context-information')}
            </h2>
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
                  value={project?.name || ''}
                  disabled
                  className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Incident Information */}
          <div className="rounded-lg border border-gray-300 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t('oscrat.ui.versions.incidents.incident-information')}
            </h2>
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
                  {members?.map((member) => (
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

          {/* Attachments Section */}
          <div className="rounded-lg border border-gray-300 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t('oscrat.ui.attachments')}
            </h2>
            <div className="mb-4">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
                {uploadingFile ? t('oscrat.ui.uploading') : t('oscrat.ui.add-document')}
              </label>
            </div>
            {uploadedAttachmentIds.length > 0 && attachments && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t('oscrat.ui.uploaded-attachments')}: {uploadedAttachmentIds.length}
                </p>
                {attachments
                  .filter(att => uploadedAttachmentIds.includes(att.id))
                  .map((attachment) => (
                    <div key={attachment.id} className="flex items-center text-sm text-gray-700">
                      <span>{attachment.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('oscrat.ui.cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? t('oscrat.ui.adding') : t('oscrat.ui.add')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

NewIncidentPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default NewIncidentPage;


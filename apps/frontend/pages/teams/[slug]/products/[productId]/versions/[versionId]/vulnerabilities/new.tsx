import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import { useVulnerabilities } from '@/hooks/oscrat/useVulnerabilities';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import VulnerabilityFormFields, {
  type VulnerabilityFormData,
} from '@/components/oscrat/VulnerabilityFormFields';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import { mapScanSeverityToVulnerabilitySeverity } from '@/lib/utils/severity';
import { Breadcrumb } from '@/components/shared';
import {
  OscratProductVulnerabilityStatus,
  OscratProductVulnerabilitySeverity,
  type OscratVulnerabilityCreate
} from '@oscrat/model';
import { FaInfoCircle } from 'react-icons/fa';

const PAGE_STYLES = {
  sectionCard: 'rounded-lg border border-gray-300 bg-white p-6',
  sectionCardGray: 'rounded-lg border border-gray-300 bg-gray-50 p-6',
  sectionHeading: 'mb-4 text-lg font-semibold text-gray-900',
  label: 'block text-sm font-medium text-gray-700',
  disabledInput: 'mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700',
  buttonSecondary: 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50',
  buttonPrimary: 'rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50',
  textSmGray: 'text-sm text-gray-700',
} as const;

function NewVulnerabilityPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const { versionContext, teamId, productId, versionId } = useVersionContext();
  const { productContext } = useProductContext();

  const version = versionContext.version;
  const project = productContext.project;
  const { attachments, uploadAttachment } = useVersionAttachments(teamId, productId, versionId);
  const { createVulnerability, isCreating } = useVulnerabilities(teamId, productId, versionId);

  const [formData, setFormData] = useState<VulnerabilityFormData>({
    name: '',
    description: '',
    severity: OscratProductVulnerabilitySeverity.LOW,
    status: OscratProductVulnerabilityStatus.PENDING,
    cve: '',
    advisoryId: '',
    dateOfDiscovery: new Date().toISOString().split('T')[0],
    affectedMemberStates: '',
  });

  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isFromScanReport, setIsFromScanReport] = useState(false);

  // Handle query params for pre-filling from scan report
  useEffect(() => {
    const { prefill, cve, severity, description, package: pkg, version: ver } = router.query;

    if (prefill === 'true' && cve && pkg) {
      setIsFromScanReport(true);

      const mappedSeverity = severity
        ? mapScanSeverityToVulnerabilitySeverity(severity as string)
        : OscratProductVulnerabilitySeverity.LOW;

      const descriptionText = description
        ? `${description as string}${ver ? ` (Package: ${pkg}@${ver})` : ''}`
        : `Vulnerability in package ${pkg}${ver ? `@${ver}` : ''}`;

      setFormData({
        name: `${pkg} - ${cve}`,
        description: descriptionText,
        severity: mappedSeverity,
        status: OscratProductVulnerabilityStatus.PENDING,
        cve: cve as string,
        advisoryId: '',
        dateOfDiscovery: new Date().toISOString().split('T')[0],
        affectedMemberStates: '',
      });
    }
  }, [router.query]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.name.trim()) {
      toast.error(t('oscrat.ui.versions.vulnerabilities.name-required'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('oscrat.ui.versions.vulnerabilities.description-required'));
      return;
    }

    if (!formData.dateOfDiscovery) {
      toast.error(t('oscrat.ui.versions.vulnerabilities.date-discovery-required'));
      return;
    }

    try {
      const affectedMemberStatesArray = formData.affectedMemberStates
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const createData: OscratVulnerabilityCreate = {
        name: formData.name,
        description: formData.description,
        severity: formData.severity,
        status: formData.status,
        cve: formData.cve || undefined,
        advisoryId: formData.advisoryId || undefined,
        dateOfDiscovery: new Date(formData.dateOfDiscovery),
        affectedMemberStates: affectedMemberStatesArray,
        attachmentIds: uploadedAttachmentIds.length > 0 ? uploadedAttachmentIds : undefined,
        createdBy: '', // Will be set by the API
      };

      await createVulnerability(createData);
      toast.success(t('oscrat.ui.versions.vulnerabilities.created-successfully'));
      router.push(`/teams/${slug}/products/${productId}/versions/${versionId}?tab=vulnerabilities`);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.versions.vulnerabilities.failed-to-create')));
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
      label: t('oscrat.ui.versions.vulnerabilities.add-new'),
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {t('oscrat.ui.versions.vulnerabilities.add-new')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Context Information (Read-Only) */}
          <div className={PAGE_STYLES.sectionCardGray}>
            <h2 className={PAGE_STYLES.sectionHeading}>
              {t('oscrat.ui.versions.vulnerabilities.context-information')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={PAGE_STYLES.label}>
                  {t('oscrat.ui.version')}
                </label>
                <input
                  type="text"
                  value={version?.version || ''}
                  disabled
                  className={PAGE_STYLES.disabledInput}
                />
              </div>
              <div>
                <label className={PAGE_STYLES.label}>
                  {t('oscrat.ui.product')}
                </label>
                <input
                  type="text"
                  value={project?.name || ''}
                  disabled
                  className={PAGE_STYLES.disabledInput}
                />
              </div>
            </div>
          </div>

          {/* Vulnerability Information */}
          <div className={PAGE_STYLES.sectionCard}>
            <h2 className={PAGE_STYLES.sectionHeading}>
              {t('oscrat.ui.versions.vulnerabilities.vulnerability-information')}
            </h2>
            <VulnerabilityFormFields
              formData={formData}
              onChange={handleInputChange}
              isFromScanReport={isFromScanReport}
            />
          </div>

          {/* Attachments Section */}
          <div className={PAGE_STYLES.sectionCard}>
            <h2 className={PAGE_STYLES.sectionHeading}>
              {t('oscrat.ui.attachments')}
            </h2>
            <div className="mb-4">
              <label className={`inline-flex cursor-pointer items-center ${PAGE_STYLES.buttonSecondary}`}>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
                {uploadingFile ? t('oscrat.ui.uploading') : t('oscrat.ui.add-attachment')}
              </label>
            </div>
            {uploadedAttachmentIds.length > 0 && attachments && (
              <div className="space-y-2">
                <p className={PAGE_STYLES.label}>
                  {t('oscrat.ui.uploaded-attachments')}: {uploadedAttachmentIds.length}
                </p>
                {attachments
                  .filter(att => uploadedAttachmentIds.includes(att.id))
                  .map((attachment) => (
                    <div key={attachment.id} className={`flex items-center ${PAGE_STYLES.textSmGray}`}>
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
              className={PAGE_STYLES.buttonSecondary}
            >
              {t('oscrat.ui.cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={PAGE_STYLES.buttonPrimary}
            >
              {isCreating ? t('oscrat.ui.adding') : t('oscrat.ui.add')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

NewVulnerabilityPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default NewVulnerabilityPage;

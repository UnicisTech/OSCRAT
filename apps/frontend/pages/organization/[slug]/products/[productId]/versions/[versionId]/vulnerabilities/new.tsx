import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { useFormik } from 'formik';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import { useVulnerabilities } from '@/hooks/oscrat/useVulnerabilities';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import VulnerabilityFormFields, {
  type VulnerabilityFormData,
  type VulnerabilityFormErrors,
} from '@/components/oscrat/VulnerabilityFormFields';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import { mapScanSeverityToVulnerabilitySeverity } from '@/lib/utils/severity';
import { Breadcrumb } from '@/components/shared';
import Button from '@/components/button';
import {
  OscratProductVulnerabilityStatus,
  OscratProductVulnerabilitySeverity,
  type OscratVulnerabilityCreate,
} from '@oscrat/model';
import { vulnerabilityFormSchema } from '@/lib/validation/vulnerability';
import {
  sanitizeForDescription,
  sanitizeForTitle,
  truncateAtWordBoundary,
} from '@/lib/text-sanitize';

const PAGE_STYLES = {
  sectionCard: 'rounded-lg border border-line bg-surface p-6',
  sectionCardGray: 'rounded-lg border border-line bg-surface-muted p-6',
  sectionHeading: 'mb-4 text-lg font-semibold text-content',
  label: 'block text-sm font-medium text-content-secondary',
  disabledInput:
    'mt-1 w-full rounded-input border border-line bg-surface-muted px-3 py-2 text-content-secondary',
  buttonSecondary:
    'rounded-input border border-line bg-surface px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-muted',
  textSmGray: 'text-sm text-content-secondary',
} as const;

function NewVulnerabilityPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const { slug } = useTeamContext();
  const { versionContext, teamId, productId, versionId } = useVersionContext();
  const { productContext } = useProductContext();

  const version = versionContext.version;
  const project = productContext.project;
  const { attachments, uploadAttachment } = useVersionAttachments(
    teamId,
    productId,
    versionId
  );
  const { createVulnerability, isCreating } = useVulnerabilities(
    teamId,
    productId,
    versionId
  );
  const { members } = useTeamMembers(slug);

  const currentUserId = session?.user?.id || '';

  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState<string[]>(
    []
  );
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isFromScanReport, setIsFromScanReport] = useState(false);

  const formik = useFormik<VulnerabilityFormData>({
    initialValues: {
      name: '',
      description: '',
      severity: OscratProductVulnerabilitySeverity.LOW,
      status: OscratProductVulnerabilityStatus.PENDING,
      cve: '',
      affectedVendor: '',
      references: '',
      advisoryId: '',
      dateOfDiscovery: new Date().toISOString().split('T')[0],
      assigner: currentUserId,
      hasOtherMemberStates: false,
      affectedMemberStates: '',
    },
    validationSchema: vulnerabilityFormSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const affectedMemberStatesArray =
          values.hasOtherMemberStates && values.affectedMemberStates
            ? values.affectedMemberStates
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : [];

        const referencesArray = values.references
          ? values.references
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          : [];

        const createData: OscratVulnerabilityCreate = {
          name: values.name,
          description: values.description,
          severity: values.severity,
          status: values.status,
          cve: values.cve || undefined,
          affectedVendor: values.affectedVendor || undefined,
          references: referencesArray.length > 0 ? referencesArray : undefined,
          advisoryId: values.advisoryId || undefined,
          dateOfDiscovery: new Date(values.dateOfDiscovery),
          affectedMemberStates: affectedMemberStatesArray,
          attachmentIds:
            uploadedAttachmentIds.length > 0
              ? uploadedAttachmentIds
              : undefined,
          createdBy: '',
        };

        await createVulnerability(createData);
        toast.success(
          t('oscrat.ui.versions.vulnerabilities.created-successfully')
        );
        router.push(
          `/organization/${slug}/products/${productId}/versions/${versionId}?tab=vulnerabilities`
        );
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(
            error,
            t('oscrat.ui.versions.vulnerabilities.failed-to-create'),
            t
          )
        );
      }
    },
  });

  // Handle query params for pre-filling from scan report
  useEffect(() => {
    const {
      prefill,
      advisoryId,
      cve,
      severity,
      description,
      package: pkg,
      version: ver,
    } = router.query;

    if (prefill === 'true' && (advisoryId || cve) && pkg) {
      setIsFromScanReport(true);

      const mappedSeverity = severity
        ? mapScanSeverityToVulnerabilitySeverity(severity as string)
        : OscratProductVulnerabilitySeverity.LOW;

      const rawDescription = description
        ? `${description as string}${ver ? ` (Package: ${pkg}@${ver})` : ''}`
        : `Vulnerability in package ${pkg}${ver ? `@${ver}` : ''}`;
      const name = truncateAtWordBoundary(
        sanitizeForTitle(`${pkg} - ${advisoryId || cve}`),
        100
      );
      const descriptionText = truncateAtWordBoundary(
        sanitizeForDescription(rawDescription),
        500
      );

      formik.setValues({
        name,
        description: descriptionText,
        severity: mappedSeverity,
        status: OscratProductVulnerabilityStatus.PENDING,
        cve: (cve as string) || '',
        affectedVendor: '',
        references: '',
        advisoryId: (advisoryId as string) || '',
        dateOfDiscovery: new Date().toISOString().split('T')[0],
        assigner: currentUserId,
        hasOtherMemberStates: false,
        affectedMemberStates: '',
      });
    }
  }, [router.query, currentUserId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    formik.handleChange(e);
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    formik.setFieldValue(name, checked);
    if (name === 'hasOtherMemberStates' && !checked) {
      formik.setFieldValue('affectedMemberStates', '');
    }
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
      label: t('oscrat.ui.versions.vulnerabilities.add-new'),
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-content mb-6 text-2xl font-bold">
          {t('oscrat.ui.versions.vulnerabilities.add-new')}
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
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
              {t(
                'oscrat.ui.versions.vulnerabilities.vulnerability-information'
              )}
            </h2>
            <VulnerabilityFormFields
              formData={formik.values}
              onChange={handleInputChange}
              onBlur={formik.handleBlur}
              onCheckboxChange={handleCheckboxChange}
              isFromScanReport={isFromScanReport}
              affectedProductName={project?.name}
              affectedVersionName={version?.version}
              teamMembers={members}
              errors={formik.errors as VulnerabilityFormErrors}
              touched={formik.touched as Record<string, boolean>}
            />
          </div>

          {/* Attachments Section */}
          <div className={PAGE_STYLES.sectionCard}>
            <h2 className={PAGE_STYLES.sectionHeading}>
              {t('oscrat.ui.attachments')}
            </h2>
            <div className="mb-4">
              <label
                className={`inline-flex cursor-pointer items-center ${PAGE_STYLES.buttonSecondary}`}
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
                {uploadingFile
                  ? t('oscrat.ui.uploading')
                  : t('oscrat.ui.add-attachment')}
              </label>
            </div>
            {uploadedAttachmentIds.length > 0 && attachments && (
              <div className="space-y-2">
                <p className={PAGE_STYLES.label}>
                  {t('oscrat.ui.uploaded-attachments')}:{' '}
                  {uploadedAttachmentIds.length}
                </p>
                {attachments
                  .filter((att) => uploadedAttachmentIds.includes(att.id))
                  .map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`flex items-center ${PAGE_STYLES.textSmGray}`}
                    >
                      <span>{attachment.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="secondary" type="button" onClick={handleCancel}>
              {t('oscrat.ui.cancel')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isCreating || formik.isSubmitting}
            >
              {isCreating || formik.isSubmitting
                ? t('oscrat.ui.adding')
                : t('oscrat.ui.add')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

NewVulnerabilityPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default NewVulnerabilityPage;

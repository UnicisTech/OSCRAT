import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useIncidents } from '@/hooks/oscrat/useIncidents';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import { tableStyles } from '@/components/oscrat/tableStyles';
import EditIncidentModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/incidents/EditIncidentModal';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import { FaDownload, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { IncidentStatus } from '@oscrat/model';
import normalizeText from '@/utils/normalizeText';
import { formatDateLong } from '@/utils/dateFormat';
import {
  Breadcrumb,
  ClampableText,
  FullScreenModal,
} from '@/components/shared';
import Button from '@/components/button';

function IncidentDetailsPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { incidentId } = router.query;
  const { slug } = useTeamContext();
  const { versionContext, teamId, productId, versionId } = useVersionContext();
  const { productContext } = useProductContext();

  const version = versionContext.version;
  const project = productContext.project;
  const { downloadAttachment, uploadAttachment, deleteAttachment } =
    useVersionAttachments(teamId, productId, versionId, {
      incidentId: incidentId as string,
    });
  const { members } = useTeamMembers(slug);

  const { incident, isLoading, isDetailError, detailError, updateIncident } =
    useIncidents(teamId, productId, versionId, incidentId as string);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] =
    useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(
    null
  );
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleComplete = () => {
    setShowCompleteModal(true);
  };

  const confirmComplete = async () => {
    if (!incident) return;

    try {
      await updateIncident({
        status: IncidentStatus.COMPLETED,
        updatedBy: '',
      });
      toast.success(t('oscrat.ui.versions.incidents.completed-successfully'));
      setShowCompleteModal(false);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.incidents.failed-to-complete')
        )
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await uploadAttachment(file);
      toast.success(t('oscrat.ui.file-uploaded-successfully'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-upload-file'))
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadAttachment = async (
    attachmentId: string,
    filename: string
  ) => {
    try {
      await downloadAttachment(attachmentId, filename);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-download'))
      );
    }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId);
    setShowDeleteAttachmentModal(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;

    try {
      await deleteAttachment(attachmentToDelete);
      toast.success(t('oscrat.ui.attachment-deleted'));
      setShowDeleteAttachmentModal(false);
      setAttachmentToDelete(null);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-delete-attachment'))
      );
    }
  };

  const handleCancelDeleteAttachment = () => {
    setShowDeleteAttachmentModal(false);
    setAttachmentToDelete(null);
  };

  if (!ready) return null;

  if (isLoading) {
    return <div>{t('oscrat.ui.loading')}</div>;
  }

  if (isDetailError || !incident) {
    return (
      <div className="text-danger">
        {extractErrorMessage(
          detailError,
          t('oscrat.ui.versions.incidents.failed-to-load')
        )}
      </div>
    );
  }

  // Cap the displayed incident name so a long title cannot push the action
  // buttons off-screen in the header row. Validation allows up to 100 chars,
  // so we truncate here rather than at the data layer to avoid invalidating
  // existing records.
  const MAX_TITLE_DISPLAY_CHARS = 40;
  const incidentName = incident.name?.trim();
  const displayedIncidentName = incidentName
    ? incidentName.length > MAX_TITLE_DISPLAY_CHARS
      ? `${incidentName.slice(0, MAX_TITLE_DISPLAY_CHARS)}…`
      : incidentName
    : t('oscrat.ui.versions.incidents.incident-details');

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
      label: t('oscrat.ui.versions.incidents.incident-details'),
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Section 1: Basic Incident Information */}
        <div className="border-line bg-surface rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1
                className="text-content text-2xl font-bold"
                title={incidentName || undefined}
              >
                {displayedIncidentName}
              </h1>
              {incident.name && (
                <p className="text-content-muted mt-1 text-sm">
                  {t('oscrat.ui.versions.incidents.incident-details')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="m"
                onClick={handleEdit}
                disabled={incident.status === IncidentStatus.COMPLETED}
              >
                {t('oscrat.ui.edit')}
              </Button>
              <Button
                variant="secondary"
                size="m"
                onClick={handleComplete}
                disabled={incident.status === IncidentStatus.COMPLETED}
              >
                {t('oscrat.ui.complete-incident')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.classification')}
              </label>
              <p className="text-content mt-1 text-lg font-semibold">
                {normalizeText(incident.classification)}
              </p>
            </div>
            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.attack-type')}
              </label>
              <p className="text-content mt-1 text-lg font-semibold">
                {normalizeText(incident.attackType)}
              </p>
            </div>
            <div className="min-w-0">
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.asset-details')}
              </label>
              <ClampableText
                text={incident.assetDetails}
                className="text-content mt-1 text-lg font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Extended Incident Data */}
        <div className="border-line bg-surface rounded-lg border p-6">
          <h2 className="text-content mb-4 text-xl font-semibold">
            {t('oscrat.ui.versions.incidents.extended-data')}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.reporter')}
              </label>
              <p className="text-content mt-1 text-base">
                {incident.reporter.name} ({incident.reporter.email})
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.date-of-detection')}
              </label>
              <p className="text-content mt-1 text-base">
                {formatDateLong(incident.dateOfDetection)}
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.published-date')}
              </label>
              <p className="text-content mt-1 text-base">
                {formatDateLong(incident.createdAt)}
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.added-by')}
              </label>
              <p className="text-content mt-1 text-base">
                {incident.createdByUser?.name || '-'}{' '}
                {incident.createdByUser?.email &&
                  `(${incident.createdByUser.email})`}
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.last-edited')}
              </label>
              <p className="text-content mt-1 text-base">
                {formatDateLong(incident.updatedAt)}
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.edited-by')}
              </label>
              <p className="text-content mt-1 text-base">
                {incident.updatedByUser?.name || '-'}{' '}
                {incident.updatedByUser?.email &&
                  `(${incident.updatedByUser.email})`}
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.severity')}
              </label>
              <p className="text-content mt-1 text-base font-semibold">
                {normalizeText(incident.severity)}
              </p>
            </div>

            <div>
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.handling-date')}
              </label>
              <p className="text-content mt-1 text-base">
                {formatDateLong(incident.handlingDate)}
              </p>
            </div>

            <div className="col-span-2">
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.description')}
              </label>
              <ClampableText
                text={incident.description}
                className="text-content mt-1 text-base"
              />
            </div>

            <div className="col-span-2">
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.corrective-actions')}
              </label>
              <ClampableText
                text={incident.correctiveActions}
                className="text-content mt-1 text-base"
              />
            </div>

            <div className="col-span-2">
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.root-cause')}
              </label>
              <ClampableText
                text={incident.rootCause}
                className="text-content mt-1 text-base"
              />
            </div>

            <div className="col-span-2">
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.scope')}
              </label>
              <ClampableText
                text={incident.scope}
                className="text-content mt-1 text-base"
              />
            </div>

            <div className="col-span-2">
              <label className="text-content-muted block text-sm font-medium">
                {t('oscrat.ui.versions.incidents.preventive-actions')}
              </label>
              <ClampableText
                text={incident.preventiveActions}
                className="text-content mt-1 text-base"
              />
            </div>

            {incident.suspectedUnlawfulAct && (
              <div className="col-span-2">
                <label className="text-content-muted block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.unlawful-act-description')}
                </label>
                <ClampableText
                  text={incident.unlawfulActDescription}
                  className="text-content mt-1 text-base"
                />
              </div>
            )}

            {incident.crossBorderImpact && (
              <div className="col-span-2">
                <label className="text-content-muted block text-sm font-medium">
                  {t('oscrat.ui.versions.incidents.cross-border-details')}
                </label>
                <ClampableText
                  text={incident.crossBorderImpactDetails}
                  className="text-content mt-1 text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Attachments */}
        <div className="border-line bg-surface rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-content text-xl font-semibold">
              {t('oscrat.ui.attachments')}
            </h2>
            <div className="flex items-center gap-2">
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
              <div
                className="tooltip tooltip-left"
                data-tip={`${t('oscrat.ui.file-upload-max-size')} • ${t('oscrat.ui.file-upload-allowed-types')}`}
              >
                <FaInfoCircle className="text-content-placeholder hover:text-content-secondary h-5 w-5" />
              </div>
            </div>
          </div>

          {incident.attachments && incident.attachments.length > 0 ? (
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead className={tableStyles.thead}>
                  <tr>
                    <th className={tableStyles.th}>{t('oscrat.ui.name')}</th>
                    <th className={tableStyles.th}>{t('oscrat.ui.type')}</th>
                    <th className={tableStyles.th}>
                      {t('oscrat.ui.date-added')}
                    </th>
                    <th className={tableStyles.th}>
                      {t('oscrat.ui.added-by')}
                    </th>
                    <th className={tableStyles.th}>{t('oscrat.ui.actions')}</th>
                  </tr>
                </thead>
                <tbody className={tableStyles.tbody}>
                  {incident.attachments.map((attachment) => (
                    <tr key={attachment.id} className={tableStyles.tr}>
                      <td className={tableStyles.td}>{attachment.name}</td>
                      <td className={tableStyles.td}>
                        {attachment.mimeType || '-'}
                      </td>
                      <td className={tableStyles.td}>
                        {formatDateLong(attachment.createdAt)}
                      </td>
                      <td className={tableStyles.td}>
                        {incident.createdByUser.name}
                      </td>
                      <td className={tableStyles.td}>
                        <div className="flex items-center justify-start space-x-4">
                          <Button
                            variant="tertiary"
                            size="s"
                            startIcon={<FaDownload size={12} />}
                            onClick={() =>
                              handleDownloadAttachment(
                                attachment.id,
                                attachment.name
                              )
                            }
                          >
                            {t('oscrat.ui.download')}
                          </Button>
                          <Button
                            variant="tertiary"
                            tone="danger"
                            size="s"
                            startIcon={<FaTrash size={12} />}
                            onClick={() =>
                              handleDeleteAttachment(attachment.id)
                            }
                          >
                            {t('oscrat.ui.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-content-muted text-center">
              {t('oscrat.ui.no-attachments')}
            </p>
          )}
        </div>
      </div>

      {/* Edit Incident Modal */}
      {incident && (
        <EditIncidentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          incident={incident}
          onSave={async (data) => void (await updateIncident(data))}
          version={version}
          product={project}
          teamMembers={members}
          attachments={incident.attachments.map((att) => ({
            id: att.id,
            name: att.name,
            mimeType: att.mimeType || undefined,
            createdAt: att.createdAt,
          }))}
          onUploadAttachment={async (file: File) => {
            return await uploadAttachment(file);
          }}
          onDownloadAttachment={downloadAttachment}
        />
      )}

      {/* Delete Attachment Confirmation Modal */}
      <FullScreenModal
        isOpen={showDeleteAttachmentModal}
        onClose={handleCancelDeleteAttachment}
        title={t('oscrat.ui.delete-attachment')}
        text={t('oscrat.ui.delete-attachment-confirmation')}
        cancelButtonText={t('cancel')}
        continueButtonText={t('delete')}
        onCancel={handleCancelDeleteAttachment}
        onContinue={confirmDeleteAttachment}
      />

      {/* Complete Incident Confirmation Modal */}
      <FullScreenModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title={t('oscrat.ui.versions.incidents.complete-confirm-title')}
        text={t('oscrat.ui.versions.incidents.complete-confirm-warning')}
        cancelButtonText={t('cancel')}
        continueButtonText={t('oscrat.ui.versions.incidents.complete-confirm-button')}
        onCancel={() => setShowCompleteModal(false)}
        onContinue={confirmComplete}
      />
    </>
  );
}

IncidentDetailsPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default IncidentDetailsPage;

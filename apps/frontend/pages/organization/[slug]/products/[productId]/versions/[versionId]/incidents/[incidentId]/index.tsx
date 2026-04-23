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
import { Breadcrumb, FullScreenModal } from '@/components/shared';

function IncidentDetailsPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { incidentId } = router.query;
  const { slug } = useTeamContext();
  const { versionContext, teamId, productId, versionId } = useVersionContext();
  const { productContext } = useProductContext();

  const version = versionContext.version;
  const project = productContext.project;
  const { downloadAttachment, uploadAttachment, deleteAttachment } = useVersionAttachments(
    teamId,
    productId,
    versionId,
    { incidentId: incidentId as string }
  );
  const { members } = useTeamMembers(slug);
  
  const { incident, isLoading, isDetailError, detailError, updateIncident } = useIncidents(
    teamId,
    productId,
    versionId,
    incidentId as string
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleComplete = async () => {
    if (!incident) return;

    try {
      await updateIncident({
        status: IncidentStatus.COMPLETED,
        updatedBy: '',
      });
      toast.success(t('oscrat.ui.versions.incidents.completed-successfully'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.versions.incidents.failed-to-complete'))
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
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-upload-file')));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    try {
      await downloadAttachment(attachmentId, filename);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-download')));
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
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-delete-attachment')));
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
      <div className="text-red-600">
        {extractErrorMessage(detailError, t('oscrat.ui.versions.incidents.failed-to-load'))}
      </div>
    );
  }

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
        <div className="rounded-lg border border-gray-300 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('oscrat.ui.versions.incidents.incident-details')}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={incident.status === IncidentStatus.COMPLETED}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('oscrat.ui.edit')}
              </button>
              <button
                onClick={handleComplete}
                disabled={incident.status === IncidentStatus.COMPLETED}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('oscrat.ui.complete-incident')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.classification')}
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {normalizeText(incident.classification)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.attack-type')}
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {normalizeText(incident.attackType)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.asset-details')}
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {incident.assetDetails || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Extended Incident Data */}
        <div className="rounded-lg border border-gray-300 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            {t('oscrat.ui.versions.incidents.extended-data')}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.reporter')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.reporter.name} ({incident.reporter.email})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.date-of-detection')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {formatDateLong(incident.dateOfDetection)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.published-date')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {formatDateLong(incident.createdAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.added-by')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.createdByUser?.name || '-'} {incident.createdByUser?.email && `(${incident.createdByUser.email})`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.last-edited')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {formatDateLong(incident.updatedAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.edited-by')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.updatedByUser?.name || '-'} {incident.updatedByUser?.email && `(${incident.updatedByUser.email})`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.severity')}
              </label>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {normalizeText(incident.severity)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.handling-date')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {formatDateLong(incident.handlingDate)}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.description')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.description}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.corrective-actions')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.correctiveActions || '-'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.root-cause')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.rootCause || '-'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.scope')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.scope}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">
                {t('oscrat.ui.versions.incidents.preventive-actions')}
              </label>
              <p className="mt-1 text-base text-gray-900">
                {incident.preventiveActions || '-'}
              </p>
            </div>

            {incident.suspectedUnlawfulAct && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  {t('oscrat.ui.versions.incidents.unlawful-act-description')}
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {incident.unlawfulActDescription || '-'}
                </p>
              </div>
            )}

            {incident.crossBorderImpact && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  {t('oscrat.ui.versions.incidents.cross-border-details')}
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {incident.crossBorderImpactDetails || '-'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Attachments */}
        <div className="rounded-lg border border-gray-300 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('oscrat.ui.attachments')}
            </h2>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
                {uploadingFile ? t('oscrat.ui.uploading') : t('oscrat.ui.add-document')}
              </label>
              <div
                className="tooltip tooltip-left"
                data-tip={`${t('oscrat.ui.file-upload-max-size')} • ${t('oscrat.ui.file-upload-allowed-types')}`}
              >
                <FaInfoCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
                    <th className={tableStyles.th}>{t('oscrat.ui.date-added')}</th>
                    <th className={tableStyles.th}>{t('oscrat.ui.added-by')}</th>
                    <th className={tableStyles.th}>{t('oscrat.ui.actions')}</th>
                  </tr>
                </thead>
                <tbody className={tableStyles.tbody}>
                  {incident.attachments.map((attachment) => (
                    <tr key={attachment.id} className={tableStyles.tr}>
                      <td className={tableStyles.td}>{attachment.name}</td>
                      <td className={tableStyles.td}>{attachment.mimeType || '-'}</td>
                      <td className={tableStyles.td}>
                        {formatDateLong(attachment.createdAt)}
                      </td>
                      <td className={tableStyles.td}>
                        {incident.createdByUser.name}
                      </td>
                      <td className={tableStyles.td}>
                        <div className="flex items-center justify-start space-x-4">
                          <button
                            onClick={() =>
                              handleDownloadAttachment(attachment.id, attachment.name)
                            }
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <FaDownload size={12} />
                            {t('oscrat.ui.download')}
                          </button>
                          <button
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={12} />
                            {t('oscrat.ui.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">
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
          onSave={async (data) => void await updateIncident(data)}
          version={version}
          product={project}
          teamMembers={members}
          attachments={incident.attachments.map(att => ({
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
    </>
  );
}

IncidentDetailsPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default IncidentDetailsPage;


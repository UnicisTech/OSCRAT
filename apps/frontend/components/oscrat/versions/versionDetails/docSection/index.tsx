import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  FaFileContract,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import toast from 'react-hot-toast';

import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { useProductContext } from '@/context/ProductContext';
import { useDeclarationOfConformity } from '@/hooks/oscrat/useDeclarationOfConformity';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { extractErrorMessage } from '@/lib/utils';
import { OscratProductVersionStatus } from '@oscrat/model';
import ConfirmationModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/repository/confirmationModal';
import Button from '@/components/button';

import SuccessBadge from '@/components/oscrat/shared/SuccessBadge';
import CarUpload from './CarUpload';
import DocDisplay from './DocDisplay';
import DocWizard from './DocWizard';

export default function DocSection() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { versionId } = useVersionContext();
  const { teamContext, slug: teamSlug } = useTeamContext();
  const { productId } = useProductContext();

  const team = teamContext.team;
  const { project } = useOscratProject(teamSlug, productId);
  const { version } = useOscratVersion(teamSlug, productId, versionId);

  const {
    car,
    hasCAR,
    carDownloadUrl,
    uploadCAR,
    deleteCAR,
    isUploadingCAR,
    doc,
    hasDoC,
    docDownloadUrl,
    uploadDoC,
    deleteDoC,
    isUploadingDoC,
    isLoading,
  } = useDeclarationOfConformity(teamSlug, productId, versionId);

  const [showWizard, setShowWizard] = useState(false);
  const [showDeleteCARModal, setShowDeleteCARModal] = useState(false);
  const [showDeleteDoCModal, setShowDeleteDoCModal] = useState(false);
  const [isDeletingCAR, setIsDeletingCAR] = useState(false);
  const [isDeletingDoC, setIsDeletingDoC] = useState(false);

  const handleUploadCAR = async (file: File) => {
    try {
      await uploadCAR(file);
      toast.success(t('oscrat.ui.doc.car-uploaded'));
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.doc.car-upload-failed'))
      );
    }
  };

  const handleConfirmDeleteCAR = async () => {
    setIsDeletingCAR(true);
    try {
      await deleteCAR();
      toast.success(t('oscrat.ui.doc.car-deleted'));
      setShowDeleteCARModal(false);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.doc.car-delete-failed'))
      );
    } finally {
      setIsDeletingCAR(false);
    }
  };

  const handleGenerateDoC = async (pdfBlob: Blob, filename: string) => {
    try {
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      await uploadDoC(file, false);
      toast.success(t('oscrat.ui.doc.doc-generated'));
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.doc.doc-generate-failed'))
      );
    }
  };

  const handleUploadSignedDoC = async (file: File) => {
    try {
      await uploadDoC(file, true);
      toast.success(t('oscrat.ui.doc.doc-signed-uploaded'));
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.doc.doc-upload-failed'))
      );
    }
  };

  const handleConfirmDeleteDoC = async () => {
    setIsDeletingDoC(true);
    try {
      await deleteDoC();
      toast.success(t('oscrat.ui.doc.doc-deleted'));
      setShowDeleteDoCModal(false);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.doc.doc-delete-failed'))
      );
    } finally {
      setIsDeletingDoC(false);
    }
  };

  const handleNavigateToCompliance = () => {
    router.push(
      `/organization/${team?.slug}/products/${productId}/versions/${versionId}/compliance`
    );
  };

  if (isLoading || !team || !project || !version) {
    return null;
  }

  const isReadyForMarket =
    hasCAR && hasDoC && version.status === OscratProductVersionStatus.SUPPORTED;

  return (
    <div className="border-line bg-surface rounded-card mt-4 border p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaFileContract className="text-primary h-6 w-6" />
          <h2 className="text-content text-h6 font-bold">
            {t('oscrat.ui.doc.section-title')}
          </h2>
          {isReadyForMarket && (
            <SuccessBadge
              icon={<FaCheckCircle className="h-3 w-3" />}
              label={t('oscrat.ui.doc.ready-for-market')}
            />
          )}
        </div>
      </div>

      {/* Step 1: CAR Section */}
      <div className="mb-6">
        <h3 className="text-content-secondary mb-2 text-sm font-medium">
          {t('oscrat.ui.doc.prerequisite')}:{' '}
          {t('oscrat.ui.doc.conformity-assessment-report')}
        </h3>

        {hasCAR ? (
          <CarUpload
            car={car}
            onUpload={handleUploadCAR}
            onDelete={() => setShowDeleteCARModal(true)}
            downloadUrl={carDownloadUrl}
            isUploading={isUploadingCAR}
          />
        ) : (
          <div className="bg-warning-subtle border-warning rounded-input flex items-start gap-3 border px-4 py-3">
            <FaExclamationTriangle className="text-warning mt-0.5 h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-b2 text-content font-medium">
                {t('oscrat.ui.doc.car-required')}
              </p>
              <p className="text-c1 text-content-secondary mt-1">
                {t('oscrat.ui.doc.car-options')}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <Button
                variant="secondary"
                size="m"
                onClick={handleNavigateToCompliance}
                text={t('oscrat.ui.doc.complete-self-assessment')}
              />
              <CarUpload
                car={undefined}
                onUpload={handleUploadCAR}
                onDelete={() => setShowDeleteCARModal(true)}
                downloadUrl={carDownloadUrl}
                isUploading={isUploadingCAR}
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: DoC Section (only shown if CAR exists) */}
      {hasCAR && (
        <div className="border-line-subtle border-t pt-6">
          <h3 className="text-content-secondary mb-3 text-sm font-medium">
            {t('oscrat.ui.doc.declaration-of-conformity')}
          </h3>

          {hasDoC && doc ? (
            <DocDisplay
              doc={doc}
              downloadUrl={docDownloadUrl}
              onUploadSigned={handleUploadSignedDoC}
              onDelete={() => setShowDeleteDoCModal(true)}
              isUploading={isUploadingDoC}
              versionStatus={version.status}
            />
          ) : (
            <Button
              variant="tertiary"
              fullWidth
              onClick={() => setShowWizard(true)}
              startIcon={<IoAdd className="h-6 w-6" />}
              className="border-line bg-surface-muted text-content-secondary hover:border-info hover:bg-info-subtle hover:text-primary rounded-card border-2 border-dashed py-8 font-medium transition-colors"
              text={t('oscrat.ui.doc.create-doc')}
            />
          )}
        </div>
      )}

      {/* DoC Wizard Modal */}
      <DocWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onGenerate={handleGenerateDoC}
        prefillData={{
          manufacturerName: team.name,
          manufacturerAddress: team.postalAddress || '',
          productName: project.name,
          versionName: version.version,
        }}
      />

      {/* Delete CAR Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteCARModal}
        onClose={() => setShowDeleteCARModal(false)}
        onConfirm={handleConfirmDeleteCAR}
        title={t('oscrat.ui.doc.delete-car-title')}
        message={t('oscrat.ui.doc.confirm-delete-car')}
        confirmText={t('delete')}
        isLoading={isDeletingCAR}
        variant="danger"
      />

      {/* Delete DoC Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteDoCModal}
        onClose={() => setShowDeleteDoCModal(false)}
        onConfirm={handleConfirmDeleteDoC}
        title={t('oscrat.ui.doc.delete-doc-title')}
        message={t('oscrat.ui.doc.confirm-delete-doc')}
        confirmText={t('delete')}
        isLoading={isDeletingDoC}
        variant="danger"
      />
    </div>
  );
}

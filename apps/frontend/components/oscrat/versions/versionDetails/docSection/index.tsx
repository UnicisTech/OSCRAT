import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FaFileContract, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
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
      toast.error(extractErrorMessage(error, t('oscrat.ui.doc.car-upload-failed')));
    }
  };

  const handleConfirmDeleteCAR = async () => {
    setIsDeletingCAR(true);
    try {
      await deleteCAR();
      toast.success(t('oscrat.ui.doc.car-deleted'));
      setShowDeleteCARModal(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.doc.car-delete-failed')));
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
      toast.error(extractErrorMessage(error, t('oscrat.ui.doc.doc-generate-failed')));
    }
  };

  const handleUploadSignedDoC = async (file: File) => {
    try {
      await uploadDoC(file, true);
      toast.success(t('oscrat.ui.doc.doc-signed-uploaded'));
    } catch (error) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.doc.doc-upload-failed')));
    }
  };

  const handleConfirmDeleteDoC = async () => {
    setIsDeletingDoC(true);
    try {
      await deleteDoC();
      toast.success(t('oscrat.ui.doc.doc-deleted'));
      setShowDeleteDoCModal(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.doc.doc-delete-failed')));
    } finally {
      setIsDeletingDoC(false);
    }
  };

  const handleNavigateToCompliance = () => {
    router.push(`/organization/${team?.slug}/products/${productId}/versions/${versionId}/compliance`);
  };

  if (isLoading || !team || !project || !version) {
    return null;
  }

  const isReadyForMarket =
    hasCAR &&
    hasDoC &&
    version.status === OscratProductVersionStatus.SUPPORTED;

  return (
    <div className="mt-4 rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaFileContract className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('oscrat.ui.doc.section-title')}
          </h2>
          {isReadyForMarket && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-100">
              <FaCheckCircle className="h-3 w-3" />
              {t('oscrat.ui.doc.ready-for-market')}
            </span>
          )}
        </div>
      </div>

      {/* Step 1: CAR Section */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('oscrat.ui.doc.prerequisite')}: {t('oscrat.ui.doc.conformity-assessment-report')}
        </h3>

        {!hasCAR && (
          <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
            <FaExclamationTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <p className="font-medium">{t('oscrat.ui.doc.car-required')}</p>
              <p className="mt-1">{t('oscrat.ui.doc.car-options')}</p>
              <button
                onClick={handleNavigateToCompliance}
                className="mt-2 text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
              >
                {t('oscrat.ui.doc.complete-self-assessment')}
              </button>
            </div>
          </div>
        )}

        <CarUpload
          car={car}
          onUpload={handleUploadCAR}
          onDelete={() => setShowDeleteCARModal(true)}
          downloadUrl={carDownloadUrl}
          isUploading={isUploadingCAR}
        />
      </div>

      {/* Step 2: DoC Section (only shown if CAR exists) */}
      {hasCAR && (
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <button
              onClick={() => setShowWizard(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-gray-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            >
              <IoAdd className="h-6 w-6" />
              <span className="font-medium">{t('oscrat.ui.doc.create-doc')}</span>
            </button>
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


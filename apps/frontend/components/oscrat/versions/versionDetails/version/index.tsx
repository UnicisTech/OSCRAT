import React, { useState } from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';
import { getBorderClass } from '@/lib/borderUtils';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useVulnerabilities } from '@/hooks/oscrat/useVulnerabilities';
import { useIncidents } from '@/hooks/oscrat/useIncidents';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTeamContext } from '@/context/TeamContext';
import VersionEditModal from './VersionEditModal';
import VersionActionModal from './VersionActionModal';
import type { OscratProductVersionUpdate } from '@oscrat/model';
import { extractErrorMessage } from '@/lib/utils';

const Index = () => {
  const { t, ready } = useTranslation('common');
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const { teamId, productId } = useProductContext();
  const { version, deleteVersion, updateVersion } = useOscratVersion(
    teamId,
    productId,
    versionId
  );
  const { openCount: openVulnerabilitiesCount } = useVulnerabilities(teamId, productId, versionId);
  const { openCount: openIncidentsCount } = useIncidents(teamId, productId, versionId);

  const router = useRouter();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState<'delete' | 'withdraw' | null>(
    null
  );

  // Standard way: don't render until translations are ready
  if (!ready) return null;

  const displayVulnerabilities =
    openVulnerabilitiesCount > 0
      ? `${openVulnerabilitiesCount} ${t('oscrat.ui.open')}`
      : t('oscrat.ui.none');

  const displayIncidents =
    openIncidentsCount > 0
      ? `${openIncidentsCount} ${t('oscrat.ui.open')}`
      : t('oscrat.ui.none');

  const handleEdit = async (updatedData: OscratProductVersionUpdate) => {
    try {
      await updateVersion(updatedData);
      toast.success(t('oscrat.ui.version-updated-successfully'));
      setShowEditModal(false);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-update-version'))
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVersion();
      toast.success(t('oscrat.ui.version-deleted-successfully'));
      const redirectPath = `/teams/${slug}/products/${productId}`;
      router.replace(redirectPath);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-delete-version'))
      );
    }
  };

  const handleWithdraw = () => {
    // TODO: Implement withdraw functionality
  };

  const handleEditClick = () => setShowEditModal(true);

  const handleActionClick = (action: 'delete' | 'withdraw') => {
    setModalAction(action);
    setShowActionModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowActionModal(false);
    setModalAction(null);
  };

  if (!version) return null;

  return (
    <>
      <VersionEditModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSave={handleEdit}
        initialData={{
          version: version?.version,
          status: version?.status,
        }}
      />

      <VersionActionModal
        isOpen={showActionModal}
        onClose={handleCloseModals}
        action={modalAction}
        versionName={version?.version || ''}
        onConfirm={modalAction === 'delete' ? handleDelete : handleWithdraw}
      />
      <div
        className={`flex flex-col gap-2 rounded-lg border border-gray-400 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800`}
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {version?.version}
          </div>

          <div className="flex font-medium text-gray-600">
            <div>
              <button
                onClick={() => handleActionClick('delete')}
                className="rounded px-6 py-1 text-sm"
              >
                {t('delete')}
              </button>
            </div>

            <div>
              <button
                onClick={() => handleActionClick('withdraw')}
                className="rounded px-6 py-1 text-sm"
              >
                {t('oscrat.ui.withdraw')}
              </button>
            </div>

            <div>
              <button
                onClick={handleEditClick}
                className="rounded border border-gray-400 px-3 py-1 text-sm text-black hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t('edit')}
              </button>
            </div>
          </div>
        </div>

        <div className="my-2 w-full border-b border-gray-200 dark:border-gray-600" />

        <div className="grid grid-cols-6 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('status')}:
            </span>
            <div className="inline-flex font-semibold text-black dark:text-gray-100">
              <p className="rounded-full bg-green-100 px-2 py-0.5">
                {version?.status}
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.release-date')}:
            </span>
            <span className="font-semibold text-black dark:text-gray-100">
              {version?.createdAt &&
                new Date(version.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.incidents')}:
            </span>
            <div
              className={`inline-flex font-semibold text-black dark:text-gray-100`}
            >
              {openIncidentsCount > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                    openIncidentsCount
                  )}`}
                >
                  <BsExclamationCircleFill className="text-red-600" />
                  <p>{displayIncidents}</p>
                </div>
              ) : (
                <p
                  className={`${getBorderClass(
                    0
                  )} rounded-full border border-gray-400 px-2 py-0.5`}
                >
                  {displayIncidents}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.vulnerabilities')}:
            </span>
            <div
              className={`inline-flex items-center gap-2 font-semibold text-black dark:text-gray-100`}
            >
              {openVulnerabilitiesCount > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                    openVulnerabilitiesCount
                  )}`}
                >
                  <BsExclamationCircleFill className="text-red-600" />
                  <p>{displayVulnerabilities}</p>
                </div>
              ) : (
                <p
                  className={`rounded-full border border-gray-400 px-2 py-0.5 ${getBorderClass(
                    0
                  )}`}
                >
                  {displayVulnerabilities}
                </p>
              )}
            </div>
          </div>

          {/*    /!*TODO:align with Radu to implement in DB*!/*/}
          {/*    <div className="flex flex-col">*/}
          {/*      <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">*/}
          {/*        {t('oscrat.ui.tasks')}:*/}
          {/*      </span>*/}
          {/*      <div className="inline-flex font-semibold text-black dark:text-gray-100">*/}
          {/*        <p className="rounded-full border border-gray-400 bg-gray-50 px-2 py-0.5">*/}
          {/*          {version?.tasks} open*/}
          {/*        </p>*/}
          {/*      </div>*/}
          {/*    </div>*/}

          {/*    /!*TODO:align with Radu to implement in DB*!/*/}
          {/*    <div className="flex flex-col">*/}
          {/*      <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">*/}
          {/*        {t('oscrat.ui.support-period')}:*/}
          {/*      </span>*/}
          {/*      <span className="font-semibold text-black dark:text-gray-100">*/}
          {/*        {version?.supportPeriod}*/}
          {/*      </span>*/}
          {/*    </div>*/}
        </div>
      </div>
    </>
  );
};

export default Index;

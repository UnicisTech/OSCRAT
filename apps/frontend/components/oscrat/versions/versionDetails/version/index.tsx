import React, { useState, useEffect } from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';
import { FullScreenModal } from '@/components/shared';
import { getBorderClass } from '@/lib/borderUtils';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTeamContext } from '@/context/TeamContext';

const Index = () => {
  const { t, ready } = useTranslation('common');
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const { teamId, projectId } = useProductContext();
  const { version, deleteVersion, updateVersion } = useOscratVersion(
    teamId,
    projectId,
    versionId
  );

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<
    'edit' | 'delete' | 'withdraw' | null
  >(null);

  // Edit form state
  const [editName, setEditName] = useState('');

  // Initialize edit form when version data is available
  useEffect(() => {
    if (version?.version) {
      setEditName(version.version);
    }
  }, [version]);

  // TODO: Align with design team to see if they belong
  // const [editType, setEditType] = useState(version?.type);
  // const [editExternalReporting, setEditExternalReporting] = useState<string[]>(
  //   version.externalReportingAcronyms || []
  // );

  // Standard way: don't render until translations are ready
  if (!ready) return null;

  const displayVulnerabilities =
    version?.vulnerabilities && version.vulnerabilities.length > 0
      ? `${version.vulnerabilities.length} ${t('oscrat.ui.open')}`
      : t('oscrat.ui.none');

  const displayIncidents =
    version?.incidents && version.incidents.length > 0
      ? `${version.incidents.length} ${t('oscrat.ui.open')}`
      : t('oscrat.ui.none');

  const handleEdit = async () => {
    if (!editName.trim()) {
      toast.error('Version name is required');
      return;
    }

    try {
      await updateVersion({
        version: editName.trim(),
      });
      toast.success('Version updated successfully');
    } catch (error) {
      console.error('Failed to update version:', error);
      toast.error('Failed to update version');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVersion();
      toast.success('Project deleted successfully');
      const redirectPath = `/teams/${slug}/oscrat/projects/${projectId}/versions`;
      router.replace(redirectPath);
    } catch (error) {
      console.error('Failed to delete version:', error);
    }
  };

  const handleWithdraw = () => {
    console.log('Withdraw product:', version?.id);
  };

  // Function to get modal content based on action
  const getModalContent = () => {
    switch (modalAction) {
      case 'edit':
        return {
          title: t('oscrat.ui.edit-version'),
          continueButtonText: t('save'),
          onContinue: () => {
            setShowModal(false);
            setModalAction(null);
            handleEdit();
          },
        };
      case 'delete':
        return {
          title: t('oscrat.ui.delete-version'),
          text: t('oscrat.ui.delete-version-confirmation', {
            versionName: version?.version,
          }),
          continueButtonText: t('delete'),
          onContinue: () => {
            setShowModal(false);
            setModalAction(null);
            handleDelete();
          },
        };
      case 'withdraw':
        return {
          title: t('oscrat.ui.withdraw-version'),
          text: t('oscrat.ui.withdraw-version-confirmation', {
            versionName: version?.version,
          }),
          continueButtonText: t('oscrat.ui.withdraw'),
          onContinue: () => {
            setShowModal(false);
            setModalAction(null);
            handleWithdraw();
          },
        };
      default:
        return {
          title: t('oscrat.ui.version-details'),
          continueButtonText: t('oscrat.ui.close'),
          onContinue: () => {
            setShowModal(false);
            setModalAction(null);
          },
        };
    }
  };

  const modalContent = getModalContent();

  const handleActionClick = (action: 'edit' | 'delete' | 'withdraw') => {
    setModalAction(action);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalAction(null);
  };

  return (
    <>
      <FullScreenModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={modalContent.title}
        text={modalAction !== 'edit' ? modalContent.text : undefined}
        cancelButtonText={t('cancel')}
        continueButtonText={modalContent.continueButtonText}
        onCancel={handleModalClose}
        onContinue={modalContent.onContinue}
      >
        {modalAction === 'edit' && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                {t('oscrat.ui.version-name')}
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                placeholder={t('oscrat.ui.version-name')}
              />
            </div>

            {/*    /!*TODO:align with Radu to implement in DB*!/*/}
            {/*<div>*/}
            {/*  <label className="mb-2 block text-sm font-medium dark:text-gray-300">*/}
            {/*    {t('oscrat.ui.role')}*/}
            {/*  </label>*/}
            {/*  <select*/}
            {/*    value={editType}*/}
            {/*    onChange={(e) => setEditType(e.target.value)}*/}
            {/*    className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"*/}
            {/*  >*/}
            {/*    {mockProductTypes.map((productType) => (*/}
            {/*      <option key={productType} value={productType}>*/}
            {/*        {productType}*/}
            {/*      </option>*/}
            {/*    ))}*/}
            {/*  </select>*/}
            {/*</div>*/}

            {/*    /!*TODO:align with Radu to implement in DB*!/*/}
            {/*<div>*/}
            {/*  <label className="mb-2 block text-sm font-medium dark:text-gray-300">*/}
            {/*    {t('oscrat.ui.external-reporting')}*/}
            {/*  </label>*/}
            {/*  <select*/}
            {/*    value={editExternalReporting[0] || ''}*/}
            {/*    onChange={(e) =>*/}
            {/*      setEditExternalReporting(*/}
            {/*        e.target.value ? [e.target.value] : []*/}
            {/*      )*/}
            {/*    }*/}
            {/*    className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"*/}
            {/*  >*/}
            {/*    <option value="">{t('choose')}</option>*/}
            {/*    {mockExternalReportingOptions.map((option) => (*/}
            {/*      <option key={option} value={option}>*/}
            {/*        {option}*/}
            {/*      </option>*/}
            {/*    ))}*/}
            {/*  </select>*/}
            {/*</div>*/}
          </div>
        )}
      </FullScreenModal>
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
                onClick={() => handleActionClick('withdraw')}
                className="rounded px-6 py-1 text-sm"
              >
                {t('oscrat.ui.withdraw')}
              </button>
            </div>

            <div>
              <button
                onClick={() => handleActionClick('edit')}
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
              {version?.incidents && version.incidents.length > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                    version.incidents.length
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
              {version?.vulnerabilities &&
              version.vulnerabilities.length > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                    version.vulnerabilities.length
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

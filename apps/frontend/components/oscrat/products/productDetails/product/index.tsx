import React, { useState, useMemo } from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';
import { OscratProductDetail } from '@oscrat/model';
import { getProductCategoryKey, getProductTypeKey } from '@/utils/translation';
import { getBorderClass } from '@/lib/borderUtils';
import ProductEditModal from './ProductEditModal';
import ProductActionModal from './ProductActionModal';
import type { OscratProductUpdate } from '@oscrat/model';
import { useTeamContext } from '@/context/TeamContext';

interface ProductProps {
  project: OscratProductDetail;
  onDelete?: () => void;
  onEdit?: (updatedData: OscratProductUpdate) => void;
  onWithdraw?: () => void;
}

const Index: React.FC<ProductProps> = ({
  project,
  onDelete,
  onEdit,
  onWithdraw,
}) => {
  const { t, ready } = useTranslation('common');
  const { slug } = useTeamContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const [modalAction, setModalAction] = useState<
    'delete' | 'withdraw' | 'details' | null
  >(null);

  // Standard way: don't render until translations are ready
  if (!ready || !project) return null;

  // Handle action buttons
  const handleEditClick = () => setShowEditModal(true);

  const handleActionClick = (action: 'delete' | 'withdraw') => {
    setModalAction(action);
    setShowActionModal(true);
  };

  // Handle modal callbacks
  const handleEditSave = (data: OscratProductUpdate) => {
    setShowEditModal(false);
    onEdit?.(data);
  };

  const handleDelete = () => {
    setShowActionModal(false);
    setModalAction(null);
    onDelete?.();
  };

  const handleWithdraw = () => {
    // TODO: Implement withdraw functionality
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowActionModal(false);
    setModalAction(null);
  };

  const reportingOrganizations = useMemo(() => {
    return (
      project?.reportingOrganizations?.map((org) => org.acronym).join(', ') ||
      t('oscrat.ui.n-a')
    );
  }, [project?.reportingOrganizations, t]);

  return (
    <>
      <ProductEditModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSave={handleEditSave}
        initialData={{
          name: project.name,
          acronym: project.acronym,
          description: project.description,
          type: project.type,
          reportingOrganizations: project.reportingOrganizations,
          status: project.status,
          updatedBy: project.updatedBy,
        }}
      />

      <ProductActionModal
        isOpen={showActionModal}
        onClose={handleCloseModals}
        action={modalAction}
        productName={project.name}
        productDescription={project.description}
        onDelete={handleDelete}
        onWithdraw={handleWithdraw}
      />

      <div className="flex flex-col gap-2 rounded-lg border border-gray-400 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {project.name}
            </div>
            {project.acronym && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20">
                {project.acronym}
              </span>
            )}
          </div>

          <div className="flex font-medium text-gray-600">
            {onDelete && (
              <div>
                <button
                  onClick={() => handleActionClick('delete')}
                  className="rounded px-6 py-1 text-sm"
                >
                  {t('delete')}
                </button>
              </div>
            )}

            {onWithdraw && (
              <div>
                <button
                  onClick={() => handleActionClick('withdraw')}
                  className="rounded px-6 py-1 text-sm"
                >
                  {t('oscrat.ui.withdraw')}
                </button>
              </div>
            )}

            {onEdit && (
              <div>
                <button
                  onClick={handleEditClick}
                  className="rounded border border-gray-400 px-3 py-1 text-sm text-black hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {t('edit')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="my-2 w-full border-b border-gray-200 dark:border-gray-600" />

        <div className="grid grid-cols-7 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.category')}:
            </span>
            <span className="font-semibold text-black dark:text-gray-100">
              {t(getProductCategoryKey(project.productCategory))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.role')}:
            </span>
            <span className="font-semibold text-black dark:text-gray-100">
              {t(getProductTypeKey(project.type))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.open-incidents')}:
            </span>
            <div
              className={`inline-flex font-semibold text-black dark:text-gray-100`}
            >
              {project.versions?.reduce(
                (total, version) => total + version.openIncidents,
                0
              ) || 0 > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                    project.versions?.reduce(
                      (total, version) => total + version.openIncidents,
                      0
                    ) || 0
                  )}`}
                >
                  <BsExclamationCircleFill className="text-red-600" />
                  <p>
                    {project.versions?.reduce(
                      (total, version) => total + version.openIncidents,
                      0
                    ) || 0}{' '}
                    {t('oscrat.ui.open')}
                  </p>
                </div>
              ) : (
                <p
                  className={`${getBorderClass(0)} rounded-full border border-gray-400 px-2 py-0.5`}
                >
                  {t('oscrat.ui.none')}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.open-vulnerabilities')}:
            </span>
            <div
              className={`inline-flex items-center gap-2 font-semibold text-black dark:text-gray-100`}
            >
              {project.versions?.reduce(
                (total, version) => total + version.openVulnerabilities,
                0
              ) || 0 > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                    project.versions?.reduce(
                      (total, version) => total + version.openVulnerabilities,
                      0
                    ) || 0
                  )}`}
                >
                  <BsExclamationCircleFill className="text-red-600" />
                  <p>
                    {project.versions?.reduce(
                      (total, version) => total + version.openVulnerabilities,
                      0
                    ) || 0}{' '}
                    {t('oscrat.ui.open')}
                  </p>
                </div>
              ) : (
                <p
                  className={`rounded-full border border-gray-400 px-2 py-0.5 ${getBorderClass(0)}`}
                >
                  {t('oscrat.ui.none')}
                </p>
              )}
            </div>
          </div>
          <div className="flex min-w-[120px] flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.external-reporting')}:
            </span>
            <span className="font-semibold text-black dark:text-gray-100">
              {reportingOrganizations || t('oscrat.ui.n-a')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('status')}:
            </span>
            <div className="inline-flex font-semibold text-black dark:text-gray-100">
              <span>
                {t(
                  `oscrat.compliance.status.${project.complianceStatus?.toLowerCase().replace('_', '-')}`
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.assessment-type')}:
            </span>
            <span className="font-semibold text-black dark:text-gray-100">
              {'assessments' in project && project.assessments?.[0]?.type
                ? project.assessments[0].type
                : t('oscrat.ui.n-a')}
            </span>
          </div>
        </div>

        <div className="my-2 w-full border-b border-gray-200 dark:border-gray-600" />

        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('description')}:
            </span>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {project.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;

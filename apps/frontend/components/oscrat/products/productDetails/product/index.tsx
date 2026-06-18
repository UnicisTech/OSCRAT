import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductDetail } from '@oscrat/model';
import { getProductCategoryKey, getProductTypeKey } from '@/utils/translation';
import Button from '@/components/button';
import Card from '@/components/oscrat/shared/Card';
import Divider from '@/components/oscrat/shared/Divider';
import MetaField from '@/components/oscrat/shared/MetaField';
import CountChip from '@/components/oscrat/shared/CountChip';
import AcronymBadge from '@/components/oscrat/shared/AcronymBadge';
import ProductEditModal from './ProductEditModal';
import ProductActionModal from './ProductActionModal';
import type { OscratProductUpdate } from '@oscrat/model';

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

  const { totalIncidents, totalVulnerabilities } = useMemo(() => {
    const versions = project?.versions ?? [];
    return {
      totalIncidents: versions.reduce((sum, v) => sum + v.openIncidents, 0),
      totalVulnerabilities: versions.reduce(
        (sum, v) => sum + v.openVulnerabilities,
        0
      ),
    };
  }, [project?.versions]);

  const openLabel = (count: number) =>
    count > 0 ? `${count} ${t('oscrat.ui.open')}` : t('oscrat.ui.none');

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

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-content text-h6 font-bold">{project.name}</div>
            {project.acronym && <AcronymBadge acronym={project.acronym} />}
          </div>

          <div className="text-content-secondary flex flex-wrap items-center gap-3 font-medium">
            {onDelete && (
              <Button
                variant="tertiary"
                tone="danger"
                size="m"
                onClick={() => handleActionClick('delete')}
              >
                {t('delete')}
              </Button>
            )}

            {onWithdraw && (
              <Button
                variant="tertiary"
                size="m"
                onClick={() => handleActionClick('withdraw')}
              >
                {t('oscrat.ui.withdraw')}
              </Button>
            )}

            {onEdit && (
              <Button variant="secondary" size="m" onClick={handleEditClick}>
                {t('edit')}
              </Button>
            )}
          </div>
        </div>

        <Divider />

        <div className="text-content-secondary text-b2 grid grid-cols-7 gap-4">
          <MetaField
            label={t('oscrat.ui.category')}
            value={t(getProductCategoryKey(project.productCategory))}
          />
          <MetaField
            label={t('oscrat.ui.product-type')}
            value={t(getProductTypeKey(project.type))}
          />
          <MetaField label={t('oscrat.ui.open-incidents')}>
            <CountChip
              count={totalIncidents}
              displayText={openLabel(totalIncidents)}
            />
          </MetaField>
          <MetaField label={t('oscrat.ui.open-vulnerabilities')}>
            <CountChip
              count={totalVulnerabilities}
              displayText={openLabel(totalVulnerabilities)}
            />
          </MetaField>
          <MetaField
            className="min-w-[120px]"
            label={t('oscrat.ui.external-reporting')}
            value={reportingOrganizations || t('oscrat.ui.n-a')}
          />
          <MetaField
            label={t('oscrat.ui.assessment-type')}
            value={
              'assessments' in project && project.assessments?.[0]?.type
                ? project.assessments[0].type
                : t('oscrat.ui.n-a')
            }
          />
        </div>

        <Divider />

        <MetaField label={t('description')}>
          <p className="text-content-secondary text-b2 break-words">
            {project.description}
          </p>
        </MetaField>
      </Card>
    </>
  );
};

export default Index;

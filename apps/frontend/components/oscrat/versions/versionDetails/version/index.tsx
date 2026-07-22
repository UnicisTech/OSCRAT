import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
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
import { OscratProductVersionStatus } from '@oscrat/model';
import { extractErrorMessage } from '@/lib/utils';
import { getProductVersionStatusKey } from '@/utils/translation';
import Button from '@/components/button';
import Card from '@/components/oscrat/shared/Card';
import Divider from '@/components/oscrat/shared/Divider';
import MetaField from '@/components/oscrat/shared/MetaField';
import CountChip from '@/components/oscrat/shared/CountChip';
import StatusPill from '@/components/oscrat/shared/StatusPill';
import { formatDateShort } from '@/utils/dateFormat';

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
  const { openCount: openVulnerabilitiesCount } = useVulnerabilities(
    teamId,
    productId,
    versionId
  );
  const { openCount: openIncidentsCount } = useIncidents(
    teamId,
    productId,
    versionId
  );

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

  const openTasksCount = version?.openTasks ?? 0;

  const displayTasks =
    openTasksCount > 0
      ? `${openTasksCount} ${t('oscrat.ui.open')}`
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
      const redirectPath = `/organization/${slug}/products/${productId}`;
      router.replace(redirectPath);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-delete-version'))
      );
    }
  };

  const handleWithdraw = async () => {
    try {
      await updateVersion({ status: OscratProductVersionStatus.WITHDRAWN });
      toast.success(t('oscrat.ui.version-withdrawn-successfully'));
      setShowActionModal(false);
      setModalAction(null);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-withdraw-version'), t)
      );
    }
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
          releaseDate: version?.releaseDate?.toString(),
          supportEndDate: version?.supportEndDate?.toString(),
        }}
      />

      <VersionActionModal
        isOpen={showActionModal}
        onClose={handleCloseModals}
        action={modalAction}
        versionName={version?.version || ''}
        onConfirm={modalAction === 'delete' ? handleDelete : handleWithdraw}
      />
      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-content text-h6 font-bold">
            {version?.version}
          </div>

          <div className="text-content-secondary flex flex-wrap items-center gap-3 font-medium">
            <Button
              tone="danger"
              variant="tertiary"
              size="m"
              onClick={() => handleActionClick('delete')}
            >
              {t('delete')}
            </Button>

            <Button
              variant="tertiary"
              size="m"
              onClick={() => handleActionClick('withdraw')}
            >
              {t('oscrat.ui.withdraw')}
            </Button>

            <Button variant="secondary" size="m" onClick={handleEditClick}>
              {t('edit')}
            </Button>
          </div>
        </div>

        <Divider />

        <div className="text-content-secondary text-b2 grid grid-cols-2 items-start gap-4 md:grid-cols-3 lg:grid-cols-6">
          <MetaField label={t('status')}>
            <StatusPill
              status={version.status}
              label={t(getProductVersionStatusKey(version.status))}
            />
          </MetaField>
          <MetaField
            label={t('oscrat.ui.release-date')}
            value={
              version?.releaseDate
                ? formatDateShort(version.releaseDate)
                : t('not-set')
            }
          />
          <MetaField label={t('oscrat.ui.incidents')}>
            <CountChip
              count={openIncidentsCount}
              displayText={displayIncidents}
            />
          </MetaField>
          <MetaField label={t('oscrat.ui.vulnerabilities')}>
            <CountChip
              count={openVulnerabilitiesCount}
              displayText={displayVulnerabilities}
            />
          </MetaField>
          <MetaField label={t('oscrat.ui.tasks.title')}>
            <CountChip
              count={openTasksCount}
              displayText={displayTasks}
              iconClassName="text-primary"
            />
          </MetaField>
          <MetaField
            label={t('oscrat.ui.support-period')}
            value={
              version?.supportEndDate
                ? formatDateShort(version.supportEndDate)
                : t('not-set')
            }
          />
        </div>
      </Card>
    </>
  );
};

export default Index;

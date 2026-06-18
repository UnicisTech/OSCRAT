import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatusPill, {
  VULNERABILITY_STATUS_CLASSES,
} from '@/components/shared/StatusPill';
import DetailItem from '@/components/shared/DetailItem';
import Button from '@/components/button';

type VulnerabilityStatus = 'Pending' | 'Active' | 'Closed';

interface VulnerabilityDetailsData {
  id: string;
  title: string;
  status: VulnerabilityStatus;
  severity: number;
  affectedVendor: string;
  affectedProduct: string;
  affectedVersion: string;
}

export default function Index() {
  const { t, ready } = useTranslation('common');

  const mockVulnerability: VulnerabilityDetailsData = {
    id: 'vuln-23.4b',
    title: 'Vulnerability - 23.4b',
    status: 'Pending',
    severity: 5,
    affectedVendor: 'TSMC Industrial',
    affectedProduct: 'N5 5nm - 9 7950x',
    affectedVersion: 'v2.3',
  };

  const [vulnerability] = useState<VulnerabilityDetailsData>(mockVulnerability);

  if (!ready) return null;

  const handleEdit = () => {
    alert(t('edit-button-clicked-not-implemented'));
  };

  const handleClose = () => {
    alert(t('close-button-clicked-not-implemented'));
  };

  return (
    <div className="flex w-full justify-center">
      <div className="border-line bg-surface rounded-card w-full border p-4">
        {/* Header Section */}
        <header className="border-line-subtle flex items-center justify-between border-b pb-4">
          <h1 className="text-content text-xl font-bold">
            {vulnerability.title}
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="m" onClick={handleEdit}>
              {t('edit')}
            </Button>
            <Button variant="secondary" size="m" onClick={handleClose}>
              {t('close')}
            </Button>
          </div>
        </header>

        {/* Details Section */}
        <main className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6 sm:grid-cols-3 md:grid-cols-5">
          <DetailItem
            label="Status"
            value={
              <StatusPill
                label={vulnerability.status}
                className={VULNERABILITY_STATUS_CLASSES[vulnerability.status]}
              />
            }
          />
          <DetailItem label="Severity" value={vulnerability.severity} />
          <DetailItem
            label="Affected Vendor"
            value={vulnerability.affectedVendor}
          />
          <DetailItem
            label="Affected Product"
            value={vulnerability.affectedProduct}
          />
          <DetailItem
            label="Affected Version"
            value={vulnerability.affectedVersion}
          />
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatusPill, { VULNERABILITY_STATUS_CLASSES } from '@/components/shared/StatusPill';
import DetailItem from '@/components/shared/DetailItem';

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

  const [vulnerability] =
    useState<VulnerabilityDetailsData>(mockVulnerability);

  if (!ready) return null;

  const handleEdit = () => {
    alert(t('edit-button-clicked-not-implemented'));
  };

  const handleClose = () => {
    alert(t('close-button-clicked-not-implemented'));
  };

  return (
    <div className="flex w-full justify-center">
      <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
        {/* Header Section */}
        <header className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {vulnerability.title}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('edit')}
            </button>
            <button
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('close')}
            </button>
          </div>
        </header>

        {/* Details Section */}
        <main className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6 sm:grid-cols-3 md:grid-cols-5">
          <DetailItem
            label="Status"
            value={<StatusPill label={vulnerability.status} className={VULNERABILITY_STATUS_CLASSES[vulnerability.status]} />}
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

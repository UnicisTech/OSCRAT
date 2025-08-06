import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- TYPE DEFINITIONS ---

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

// --- MAIN APP COMPONENT ---

export default function Index() {
  const { t, ready } = useTranslation('common');

  // --- MOCK DATA ---
  const mockVulnerability: VulnerabilityDetailsData = {
    id: 'vuln-23.4b',
    title: 'Vulnerability - 23.4b',
    status: 'Pending',
    severity: 5,
    affectedVendor: 'TSMC Industrial',
    affectedProduct: 'N5 5nm - 9 7950x',
    affectedVersion: 'v2.3',
  };

  const [vulnerability, setVulnerability] =
    useState<VulnerabilityDetailsData>(mockVulnerability);

  if (!ready) return null;

  // --- HANDLERS ---
  const handleEdit = () => {
    alert('Edit button clicked. Functionality not implemented.');
  };

  const handleClose = () => {
    alert('Close button clicked. Functionality not implemented.');
  };

  // --- SUB-COMPONENTS

  const StatusPill: React.FC<{ status: VulnerabilityStatus }> = ({
    status,
  }) => {
    const pillClasses =
      status === 'Pending'
        ? 'bg-yellow-100 text-yellow-800'
        : status === 'Active'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800';
    return (
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${pillClasses}`}
      >
        {status}
      </span>
    );
  };

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
  }) => (
    <div>
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );

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
            value={<StatusPill status={vulnerability.status} />}
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

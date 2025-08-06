import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';

// --- TYPE DEFINITIONS ---

interface VulnerabilityDetailsData {
  id: string;
  title: string;
  classification: string;
  attackType: string;
  assetDetails: string;
}

export default function Index() {
  const { t, ready } = useTranslation('common');

  // --- MOCK DATA ---
  const mockVulnerability: VulnerabilityDetailsData = {
    id: 'vuln-23.4b',
    title: 'Vulnerability - 23.4b',
    classification: 'General',
    attackType: 'Denial of Service',
    assetDetails: '-',
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

  // --- SUB-COMPONENTS ---

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
        <main className="grid grid-cols-1 gap-x-6 gap-y-4 pt-6 sm:grid-cols-3">
          <DetailItem
            label={t('classification')}
            value={vulnerability.classification}
          />
          <DetailItem
            label={t('attack-type')}
            value={vulnerability.attackType}
          />
          <DetailItem
            label={t('asset-details')}
            value={vulnerability.assetDetails}
          />
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';

// --- TYPE DEFINITIONS ---

interface AttachmentData {
  id: string;
  name: string;
  type: string;
  version: string;
  dateAdded: string;
  addedBy: string;
  lastEdited: string;
  editedBy: string;
}

interface VulnerabilitySummaryData {
  summaryText: string;
  advisoryId: string;
  publishedDate: string;
  updatedDate: string;
  assigner: string;
  references: string[];
  attachments: AttachmentData[];
}

// --- MAIN APP COMPONENT ---
// TODO: Wait for DB implementation
export default function Index() {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  // --- MOCK DATA ---
  const mockData: VulnerabilitySummaryData = {
    summaryText:
      'An attacker can hijack valid session IDs due to insufficient session renewal during user login. After successful authentication, the server does not generate a new session ID, allowing attackers to reuse previously issued session tokens and impersonate authenticated users. This incident can be exploited remotely without user interaction.',
    advisoryId: 'SMGW-2025-004',
    publishedDate: '02.05.2025',
    updatedDate: '12.05.2025',
    assigner: 'Julien Koch',
    references: [],
    attachments: [
      {
        id: 'att-1',
        name: 'Internal Memo 82.4',
        type: 'Policy',
        version: '1.0',
        dateAdded: '01.01.2025',
        addedBy: 'Emily Carter',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
      {
        id: 'att-2',
        name: 'Cyber Quality Check',
        type: 'Procedure',
        version: '2.36',
        dateAdded: '01.01.2025',
        addedBy: 'Emily Carter',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
      {
        id: 'att-3',
        name: 'SSM 3.56/2025',
        type: 'Certificate',
        version: '4.5',
        dateAdded: '01.01.2025',
        addedBy: 'Ravi Patel',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
      {
        id: 'att-4',
        name: 'Security Assessment',
        type: 'Other',
        version: '1.2',
        dateAdded: '01.01.2025',
        addedBy: 'Emily Carter',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
      {
        id: 'att-5',
        name: 'Production PXC',
        type: 'Policy',
        version: '1.6',
        dateAdded: '01.01.2025',
        addedBy: 'Ravi Patel',
        lastEdited: '01.01.2025',
        editedBy: 'Emily Carter',
      },
    ],
  };

  const [vulnerabilityData, setVulnerabilityData] =
    useState<VulnerabilitySummaryData>(mockData);

  // --- HANDLERS ---
  const handleAddDocument = () => {
    alert('Add Document clicked. Functionality not yet implemented.');
  };

  const handleMoreAction = (id: string) => {
    alert(
      `More action for attachment ID: ${id}. Functionality not yet implemented.`
    );
  };

  // --- SUB-COMPONENTS

  const SummarySection: React.FC<{
    summaryText: string;
    advisoryId: string;
  }> = ({ summaryText, advisoryId }) => (
    <div className="mb-6">
      <h2 className="mb-2 text-sm text-gray-600">Summary</h2>
      <p className="mb-4 text-sm font-bold leading-relaxed text-gray-900">
        {summaryText}
      </p>
      <h3 className="mb-1 text-xs font-semibold text-gray-500">
        {t('advisory-ids')}
      </h3>
      <p className="text-sm font-semibold text-gray-900">{advisoryId}</p>
    </div>
  );

  const MetadataSection: React.FC<{
    publishedDate: string;
    updatedDate: string;
    assigner: string;
    references: string[];
  }> = ({ publishedDate, updatedDate, assigner, references }) => (
    <div className="mb-6 border-b border-t border-gray-200 py-4">
      <div className="mb-4 grid grid-cols-2 gap-6 md:grid-cols-3">
        <div>
          <h3 className="mb-1 text-xs font-semibold text-gray-500">
            {t('oscrat.ui.published')}
          </h3>
          <p className="text-sm font-semibold text-gray-900">{publishedDate}</p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold text-gray-500">
            {t('oscrat.ui.updated')}
          </h3>
          <p className="text-sm font-semibold text-gray-900">{updatedDate}</p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold text-gray-500">
            {t('oscrat.ui.assigner')}
          </h3>
          <p className="text-sm font-semibold text-gray-900">{assigner}</p>
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold text-gray-500">
          {t('oscrat.ui.references')}
        </h3>
        <p className="text-sm text-gray-900">
          {references.length > 0 ? references.join(', ') : '-'}
        </p>
      </div>
    </div>
  );

  const AttachmentTable: React.FC<{ attachments: AttachmentData[] }> = ({
    attachments,
  }) => {
    const tableHeaders = [
      'Name',
      'Type',
      'Version',
      'Dated Added',
      'Added by',
      'Last Edited',
      'Edited by',
      '',
    ];
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">Attachment</h2>
          <button
            onClick={handleAddDocument}
            className="rounded-md border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {t('add-documents')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-200 text-xs uppercase text-gray-700">
              <tr>
                {tableHeaders.map((h) => (
                  <th key={h} className="px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attachments.map((file) => (
                <tr
                  key={file.id}
                  className="border-b bg-white text-gray-900 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium">{file.name}</td>
                  <td className="px-6 py-4">{file.type}</td>
                  <td className="px-6 py-4">{file.version}</td>
                  <td className="px-6 py-4">{file.dateAdded}</td>
                  <td className="px-6 py-4">{file.addedBy}</td>
                  <td className="px-6 py-4">{file.lastEdited}</td>
                  <td className="px-6 py-4">{file.editedBy}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleMoreAction(file.id)}
                      className="flex items-center gap-x-2 text-gray-900"
                    >
                      <BsThreeDotsVertical size={16} />
                      <p>{t('more')}</p>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full rounded-lg border border-gray-400 bg-white p-4">
        <SummarySection
          summaryText={vulnerabilityData.summaryText}
          advisoryId={vulnerabilityData.advisoryId}
        />
        <MetadataSection
          publishedDate={vulnerabilityData.publishedDate}
          updatedDate={vulnerabilityData.updatedDate}
          assigner={vulnerabilityData.assigner}
          references={vulnerabilityData.references}
        />
        <AttachmentTable attachments={vulnerabilityData.attachments} />
      </div>
    </div>
  );
}

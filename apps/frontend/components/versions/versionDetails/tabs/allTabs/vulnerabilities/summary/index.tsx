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

// interface IncidentReportData {
//   extends Omit<OscratIncidentSummary, 'type' | 'status'> {
//   reporter: string;
//   dateOfDetection: string;
//   severity: string;
//   handlingDeadline: string;
//   description: string;
//   correctiveAction: string[];
//   rootCause: string;
//   scope: string[];
//   preventiveAction: string[];
//   attachments: AttachmentData[];
// }

// --- MAIN APP COMPONENT ---
// TODO: Wait for DB implementation
export default function Index() {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  // --- MOCK DATA ---
  const mockData: any = {
    reporter: 'Anna Meier',
    dateOfDetection: '02.04.2025',
    severity: '-',
    handlingDeadline: '02.06.2025',
    description:
      'Unauthorized access was detected on the admin dashboard of our product configuration platform. The attacker exploited a known vulnerability in an outdated third-party authentication module.',
    correctiveAction: [
      'Immediate isolation of affected service instance',
      'Revoked exposed admin credentials',
      'Patched authentication module to version 2.3.7',
      'Monitored traffic logs for any additional indicators of compromise (IOCs)',
    ],
    rootCause:
      'Outdated third-party dependency with a known critical vulnerability was not updated due to oversight in dependency tracking and patching workflow.',
    scope: [
      'Applies to all internal tools handling access management',
      'Assessment of all third-party libraries for similar outdated dependencies',
      'Review and improvement of the CI/CD patching pipeline',
    ],
    preventiveAction: [
      'Implemented automated dependency scanning in the CI pipeline (using Snyk)',
      'Quarterly third-party library audit introduced',
      'Introduced role-based access control review every 6 months',
      'Scheduled awareness training for internal developers on secure dependencies',
    ],
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

  const [reportData, setReportData] = useState<any>(mockData);

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

  const MetadataSection: React.FC<{
    data: Omit<
      any,
      | 'attachments'
      | 'description'
      | 'correctiveAction'
      | 'rootCause'
      | 'scope'
      | 'preventiveAction'
    >;
  }> = ({ data }) => (
    <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
      <div>
        <h3 className="mb-1 text-xs font-semibold text-gray-500">Reporter</h3>
        <p className="text-sm font-semibold text-gray-900">{data.reporter}</p>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold text-gray-500">
          Date of Detection
        </h3>
        <p className="text-sm font-semibold text-gray-900">
          {data.dateOfDetection}
        </p>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold text-gray-500">Severity</h3>
        <p className="text-sm font-semibold text-gray-900">{data.severity}</p>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold text-gray-500">
          Handling Deadline
        </h3>
        <p className="text-sm font-semibold text-gray-900">
          {data.handlingDeadline}
        </p>
      </div>
    </div>
  );

  const TextSection: React.FC<{
    title: string;
    content: string | string[];
  }> = ({ title, content }) => (
    <div className="mb-6">
      <h2 className="mb-2 text-sm text-gray-500">{title}</h2>
      {Array.isArray(content) ? (
        <ul className="space-y-1 font-semibold">
          {content.map((item, index) => (
            <li key={index} className="text-sm text-gray-900">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-semibold leading-relaxed text-gray-900">
          {content}
        </p>
      )}
    </div>
  );

  const AttachmentTable: React.FC<{ attachments: AttachmentData[] }> = ({
    attachments,
  }) => {
    const { t, ready } = useTranslation('common');
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

    if (!ready) return null;

    return (
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">
            {t('attachment')}
          </h2>
          <button
            onClick={handleAddDocument}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('add-document')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-900">
            <thead className="bg-gray-200 text-xs text-gray-900">
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
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {file.name}
                  </td>
                  <td className="px-6 py-4">{file.type}</td>
                  <td className="px-6 py-4">{file.version}</td>
                  <td className="px-6 py-4">{file.dateAdded}</td>
                  <td className="px-6 py-4">{file.addedBy}</td>
                  <td className="px-6 py-4">{file.lastEdited}</td>
                  <td className="px-6 py-4">{file.editedBy}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleMoreAction(file.id)}
                      className="flex items-center gap-2 text-gray-900"
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
        <MetadataSection data={reportData} />
        <TextSection
          title={t('description')}
          content={reportData.description}
        />
        <TextSection
          title={t('corrective-action')}
          content={reportData.correctiveAction}
        />
        <TextSection title={t('root-cause')} content={reportData.rootCause} />
        <TextSection title={t('scope')} content={reportData.scope} />
        <TextSection
          title={t('preventive-action')}
          content={reportData.preventiveAction}
        />
        <AttachmentTable attachments={reportData.attachments} />
      </div>
    </div>
  );
}

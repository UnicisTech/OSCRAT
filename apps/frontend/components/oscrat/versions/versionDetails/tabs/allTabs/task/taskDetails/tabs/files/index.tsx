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

// --- MAIN APP COMPONENT ---

export default function Index() {
  const { t, ready } = useTranslation('common');

  // --- MOCK DATA ---
  const mockAttachments: AttachmentData[] = [
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
  ];

  const [attachments, setAttachments] =
    useState<AttachmentData[]>(mockAttachments);

  if (!ready) return null;

  // --- HANDLERS ---
  const handleAddDocument = () => {
    alert('Add Document clicked. Functionality not yet implemented.');
  };

  const handleMoreAction = (id: string) => {
    alert(
      `More action for attachment ID: ${id}. Functionality not yet implemented.`
    );
  };

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
    <div className="flex w-full justify-center">
      <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">Attachment</h2>
          <button
            onClick={handleAddDocument}
            className="rounded-md border border-gray-400 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {t('oscrat.ui.add-document')}
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
                      className="flex items-center gap-x-2 text-gray-500 hover:text-gray-900"
                    >
                      <BsThreeDotsVertical size={16} /> <p> {t('more')} </p>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';
import Button from '@/components/button';

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
    alert(t('add-document-clicked-not-implemented'));
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
      <div className="border-line bg-surface rounded-card w-full border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-content-secondary text-sm font-semibold">
            Attachment
          </h2>
          <Button variant="secondary" size="m" onClick={handleAddDocument}>
            {t('oscrat.ui.add-document')}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="text-content w-full text-left text-sm">
            <thead className="bg-surface-muted text-content border-b border-line-header">
              <tr>
                {tableHeaders.map((h) => (
                  <th key={h} className="p-4 text-b2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attachments.map((file) => (
                <tr
                  key={file.id}
                  className="bg-surface hover:bg-surface-muted border-b"
                >
                  <td className="text-content px-4 py-4 font-medium">
                    {file.name}
                  </td>
                  <td className="px-4 py-4">{file.type}</td>
                  <td className="px-4 py-4">{file.version}</td>
                  <td className="px-4 py-4">{file.dateAdded}</td>
                  <td className="px-4 py-4">{file.addedBy}</td>
                  <td className="px-4 py-4">{file.lastEdited}</td>
                  <td className="px-4 py-4">{file.editedBy}</td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      variant="tertiary"
                      size="m"
                      onClick={() => handleMoreAction(file.id)}
                      startIcon={<BsThreeDotsVertical size={16} />}
                    >
                      {t('more')}
                    </Button>
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

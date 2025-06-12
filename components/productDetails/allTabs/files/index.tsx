import React from 'react';
import { PlusCircle, MoreVertical } from 'lucide-react';

const initialAttachments = [
  {
    id: 1,
    name: 'ENISA Assessment 2.31/2005',
    type: 'CAB Assessment',
    version: '1.0',
    dateAdded: '01.01.2025',
    addedBy: 'Emily Carter',
    lastEdited: '01.01.2025',
    editedBy: 'Emily Carter',
  },
  {
    id: 2,
    name: 'Manual Bx3',
    type: 'User manual',
    version: '2.36',
    dateAdded: '01.01.2025',
    addedBy: 'Emily Carter',
    lastEdited: '01.01.2025',
    editedBy: 'Emily Carter',
  },
  {
    id: 3,
    name: 'SSM 3.56/2025',
    type: 'SBOM',
    version: '4.5',
    dateAdded: '01.01.2025',
    addedBy: 'Ravi Patel',
    lastEdited: '01.01.2025',
    editedBy: 'Emily Carter',
  },
  {
    id: 4,
    name: 'Connection B Plane',
    type: 'Technical Documentation',
    version: '1.2',
    dateAdded: '01.01.2025',
    addedBy: 'Emily Carter',
    lastEdited: '01.01.2025',
    editedBy: 'Emily Carter',
  },
  {
    id: 5,
    name: 'Production PXC',
    type: 'Other',
    version: '1.6',
    dateAdded: '01.01.2025',
    addedBy: 'Ravi Patel',
    lastEdited: '01.01.2025',
    editedBy: 'Emily Carter',
  },
];

const AttachmentItem = ({ attachment }) => {
  const handleMoreActions = () => {
    console.log('More actions for:', attachment.name);
  };

  return (
    <tr className="transition-colors duration-150 hover:bg-gray-50">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
        {attachment.name}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {attachment.type}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {attachment.version}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {attachment.dateAdded}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {attachment.addedBy}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {attachment.lastEdited}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
        {attachment.editedBy}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
        <button
          type="button"
          onClick={handleMoreActions}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <MoreVertical size={18} />
          <span className="sr-only">More</span>
        </button>
      </td>
    </tr>
  );
};

const AttachmentList = () => {
  const [attachments] = React.useState(initialAttachments);

  const handleAddFile = () => {
    console.log('Add File button clicked');
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
    <div className="w-full p-4 pl-0 font-sans">
      <div className="mb-4 flex justify-start">
        <button
          type="button"
          onClick={handleAddFile}
          disabled
          className="flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusCircle size={18} className="mr-2" />
          Add File
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th
                    key={header}
                    scope="col"
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${index === tableHeaders.length - 1 ? 'text-right' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {attachments.length > 0 ? (
                attachments.map((attachment) => (
                  <AttachmentItem key={attachment.id} attachment={attachment} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No attachments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttachmentList;

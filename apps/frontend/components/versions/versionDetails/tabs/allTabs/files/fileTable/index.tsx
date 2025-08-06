import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';

interface FileData {
  id: string;
  name: string;
  type: string;
  version: string;
  dateAdded: string;
  addedBy: string;
  lastEdited: string;
  editedBy: string;
}

interface FileTableProps {
  files: FileData[];
  onAddFileClick: () => void;
}

const FileTable: React.FC<FileTableProps> = ({ files, onAddFileClick }) => {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

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
    <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
      <div className="mb-4">
        <button
          onClick={onAddFileClick}
          className="flex items-center justify-center rounded-md border border-gray-600 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <IoAdd className="mr-2" size={18} />
          {t('oscrat.ui.add-file')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-200 text-xs text-gray-700">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b bg-white hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
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
                    onClick={() => alert('More actions are not yet defined.')}
                    className="flex cursor-pointer gap-x-2 text-gray-500 hover:text-gray-800"
                  >
                    <BsThreeDotsVertical size={18} />
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

export default FileTable;

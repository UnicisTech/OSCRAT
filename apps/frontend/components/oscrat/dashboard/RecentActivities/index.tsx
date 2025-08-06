import React, { useState } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

const MOCK_ACTIVITIES = [
  {
    id: 'act-1',
    dated: '02.05.2025',
    product: 'N5 5nm - 9 7950x',
    version: 'Version 1.2',
    type: 'New Incident Reported',
  },
  {
    id: 'act-2',
    dated: '23.04.2025',
    product: 'N5 4nm - MTD 9200',
    version: 'Version 12.3.b',
    type: 'New Vulnerability Reported',
  },
  {
    id: 'act-3',
    dated: '12.04.2025',
    product: '02.05.N5 5nm - 9 7950x',
    version: 'Version 7.9',
    type: 'External Reporting Added',
  },
  {
    id: 'act-4',
    dated: '06.04.2025',
    product: 'N5 5nm - 9 7950x',
    version: '02.05.Version 1.2',
    type: 'New Vulnerability Reported',
  },
  {
    id: 'act-5',
    dated: '18.03.2025',
    product: '02.N5 5nm - 9 7950x.2025',
    version: 'Version 7.9',
    type: 'Vulnerability Closed',
  },
  {
    id: 'act-6',
    dated: '12.03.2025',
    product: 'N5 4nm - MTD 9200',
    version: 'Version 12.3.b',
    type: 'New Vulnerability Reported',
  },
  {
    id: 'act-7',
    dated: '18.03.2025',
    product: '02.N5 5nm - 9 7950x.2025',
    version: 'Version 7.9',
    type: 'Vulnerability Closed',
  },
];

export default function App() {
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const { t, ready } = useTranslation('common');

  const handlePreview = (activityId) => {
    const activity = activities.find((a) => a.id === activityId);
    alert(`"Preview" clicked for: ${activity?.type}`);
  };

  const handleViewAll = () => {
    alert('"View all" clicked. Functionality not yet implemented.');
  };

  const tableHeaders = ['Dated', 'Product', 'Version', 'Type', ''];

  if (!ready) return null;

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-lg font-bold text-gray-800">
            {t('recent-activities')}
          </h1>
          <button
            onClick={handleViewAll}
            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('view-all')}
          </button>
        </div>

        {/* Activities Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="border-b bg-gray-50 text-xs font-semibold text-gray-900">
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b bg-white last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {activity.dated}
                  </td>
                  <td className="px-6 py-4">{activity.product}</td>
                  <td className="px-6 py-4">{activity.version}</td>
                  <td className="px-6 py-4">{activity.type}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handlePreview(activity.id)}
                      className="hover:blue flex items-center text-sm font-medium text-gray-500"
                    >
                      <FaRegEye className="mr-2" />
                      {t('preview')}
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

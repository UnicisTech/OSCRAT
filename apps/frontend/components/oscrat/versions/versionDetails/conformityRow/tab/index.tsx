import React from 'react';
import { FaRegEye, FaPencilAlt, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

interface TabProps {
  title: string;
  onViewClick: () => void;
  actionType: 'edit' | 'download';
  onActionClick: () => void;
}

const Tab: React.FC<TabProps> = ({
  title,
  onViewClick,
  actionType,
  onActionClick,
}) => {
  const { t } = useTranslation('common');

  const ActionButton = () => {
    const isEdit = actionType === 'edit';
    const icon = isEdit ? (
      <FaPencilAlt className="mr-1.5" />
    ) : (
      <FaDownload className="mr-1.5" />
    );
    const text = isEdit ? 'Edit' : 'Download';

    return (
      <button
        onClick={onActionClick}
        className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        {icon}
        {text}
      </button>
    );
  };

  return (
    <div className="flex w-full items-center justify-between rounded-md border border-gray-400 bg-white px-4 py-3">
      <h3 className="text-[14px] font-medium text-black">{title}</h3>
      <div className="flex items-center space-x-2">
        <button
          onClick={onViewClick}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <FaRegEye className="mr-1.5" />
          {t('oscrat.ui.view')}
        </button>
        <ActionButton />
      </div>
    </div>
  );
};

export default Tab;

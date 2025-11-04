import React from 'react';

interface TabHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const TabHeader: React.FC<TabHeaderProps> = ({ title, children }) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  );
};

export default TabHeader;

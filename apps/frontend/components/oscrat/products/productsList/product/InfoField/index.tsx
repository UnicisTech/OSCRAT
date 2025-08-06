import React from 'react';

interface InfoFieldProps {
  label: string;
  value: string;
  className?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  className = '',
}) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
      {label}:
    </span>
    <span className="font-semibold text-black dark:text-gray-100">{value}</span>
  </div>
);

export default InfoField;

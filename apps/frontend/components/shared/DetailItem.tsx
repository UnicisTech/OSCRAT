import React from 'react';

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  labelClassName = 'mb-1 text-xs text-gray-500',
  valueClassName = 'text-sm font-semibold text-gray-800',
}) => {
  return (
    <div>
      <div className={labelClassName}>{label}</div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
};

export default DetailItem;

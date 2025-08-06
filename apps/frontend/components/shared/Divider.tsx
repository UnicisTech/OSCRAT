import React from 'react';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return (
    <div
      className={`h-[1px] w-full bg-gray-300 dark:bg-gray-600 !${className}`}
    />
  );
};

export default Divider;

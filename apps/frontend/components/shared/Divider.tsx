import React from 'react';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <div className={`h-[1px] w-full bg-gray-200 !${className}`} />;
};

export default Divider;

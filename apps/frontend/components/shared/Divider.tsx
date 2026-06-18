import React from 'react';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <div className={`bg-surface-muted h-[1px] w-full !${className}`} />;
};

export default Divider;

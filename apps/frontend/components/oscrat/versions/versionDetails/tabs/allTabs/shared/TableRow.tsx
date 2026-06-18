import React from 'react';
import { tableStyles } from '@/components/oscrat/tableStyles';

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  onClick,
  className,
}) => {
  return (
    <tr className={`${tableStyles.tr} ${className || ''}`} onClick={onClick}>
      {children}
    </tr>
  );
};

export default TableRow;

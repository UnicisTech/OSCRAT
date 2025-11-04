import React from 'react';
import { tableStyles } from '@/components/oscrat/tableStyles';

interface TableWrapperProps {
  children: React.ReactNode;
}

const TableWrapper: React.FC<TableWrapperProps> = ({ children }) => {
  return <div className={tableStyles.wrapper}>{children}</div>;
};

export default TableWrapper;

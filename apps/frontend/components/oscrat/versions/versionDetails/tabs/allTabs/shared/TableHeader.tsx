import React from 'react';
import { tableStyles } from '@/components/oscrat/tableStyles';

interface Column {
  label: string;
  className?: string;
  scope?: 'col' | 'row';
  /** Visually hide the label (kept for screen readers) — e.g. an Actions column. */
  srOnly?: boolean;
}

interface TableHeaderProps {
  columns: Column[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => {
  return (
    <thead className={tableStyles.thead}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            scope={column.scope || 'col'}
            className={`${tableStyles.th} ${column.className || ''}`}
          >
            {column.srOnly ? (
              <span className="sr-only">{column.label}</span>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;

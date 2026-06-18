import * as React from 'react';

type TableProps = {
  body: JSX.Element | JSX.Element[];
  head?: JSX.Element | JSX.Element[];
  className?: string;
  containerClassName?: string;
  borderless?: boolean;
  headTrClasses?: string;
};

function Table({ body, head }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="text-content-secondary w-full text-left text-sm">
        <thead className="bg-surface-muted text-content border-b border-line-header">
          <tr>{head}</tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

type ThProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const Th: React.FC<ThProps> = ({ children, className, style }) => {
  const classes = ['p-4 text-b2 font-medium text-left'];

  if (className) classes.push(className);

  return (
    <th className={classes.join(' ')} style={style}>
      <span>{children}</span>
    </th>
  );
};

type TrProps = {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
};

const Tr: React.FC<TrProps> = ({ children, onClick, style }) => {
  return (
    <tr
      className="bg-surface border-line-subtle border-b"
      onClick={onClick}
      style={style}
    >
      {children}
    </tr>
  );
};

type TdProps = {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLProps<HTMLTableCellElement>;

const Td: React.FC<TdProps> = ({ children, colSpan, style, ...rest }) => {
  return (
    <td className="p-4" colSpan={colSpan} style={style} {...rest}>
      {children}
    </td>
  );
};

Table.th = Th;
Table.td = Td;
Table.tr = Tr;

export default Table;

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex ${className} py-4`}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isCurrent = item.current;

          return (
            <li key={index} className="flex items-center">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              )}

              {!isCurrent && <span className="ml-2 text-gray-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

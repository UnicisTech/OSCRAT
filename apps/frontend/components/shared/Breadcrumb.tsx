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
                  className="text-content-muted hover:text-content-secondary text-c1 font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`text-c1 font-medium ${
                    isCurrent ? 'text-content' : 'text-content-muted'
                  }`}
                >
                  {item.label}
                </span>
              )}

              {!isCurrent && (
                <span className="text-content-placeholder ml-2">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

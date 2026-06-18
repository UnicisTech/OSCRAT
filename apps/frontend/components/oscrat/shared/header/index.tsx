import React from 'react';
import Button from '@/components/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  /** Custom controls rendered on the right side of the header (e.g. a search/filter toolbar). */
  actions?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  actions,
}: HeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-content-muted text-[12px]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {buttonText && onButtonClick && (
          <Button type="button" variant="primary" onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

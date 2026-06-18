import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Button from '@/components/button';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  defaultValue?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  options,
  onChange,
  label,
  isOpen,
  onToggle,
  onClose,
  defaultValue = 'all',
}) => {
  const isActive = value !== defaultValue;
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel =
    isActive && selectedOption ? selectedOption.label : label;

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="m"
        onClick={onToggle}
        fullWidth
        className={`min-w-[120px] justify-between ${
          isActive ? 'border-info bg-info-subtle' : ''
        }`}
        endIcon={
          <ChevronDownIcon
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        }
      >
        <span className="truncate">{displayLabel}</span>
      </Button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="bg-surface border-line shadow-8 rounded-input absolute z-20 mt-1 w-full border">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
                className={`hover:bg-surface-muted block w-full px-3 py-2 text-left text-sm ${
                  value === option.value
                    ? 'bg-info-subtle text-info-emphasis'
                    : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;

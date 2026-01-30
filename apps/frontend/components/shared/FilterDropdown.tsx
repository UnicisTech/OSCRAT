import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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
  const displayLabel = isActive && selectedOption ? selectedOption.label : label;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-md min-w-[120px] ${
          isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  value === option.value ? 'bg-blue-50 text-blue-700' : ''
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

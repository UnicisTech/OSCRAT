import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithLabelProps {
  name: string;
  value?: string;
  label?: React.ReactNode | string;
  labelStyle?: string;
  error?: string;
  descriptionText?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  options: SelectOption[];
  placeholder?: string;
}

const SelectWithLabel: React.FC<SelectWithLabelProps> = ({
  name,
  value,
  label,
  labelStyle,
  error,
  descriptionText,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  options,
  placeholder = 'Select an option',
}) => {
  const selectId = `select-${name}`;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2">
          {typeof label === 'string' ? (
            <label
              htmlFor={selectId}
              className={
                labelStyle || 'block text-sm font-medium text-gray-700 dark:text-gray-300'
              }
            >
              {label}
            </label>
          ) : (
            label
          )}
        </div>
      )}
      {descriptionText && (
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{descriptionText}</p>
      )}
      <select
        id={selectId}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400' : ''} ${className}`
          .trim()
          .replace(/\s+/g, ' ')}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectWithLabel;

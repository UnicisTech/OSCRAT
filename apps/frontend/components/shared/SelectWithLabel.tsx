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
                labelStyle || 'text-content-secondary block text-sm font-medium'
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
        <p className="text-content-secondary mb-2 text-sm">{descriptionText}</p>
      )}
      <select
        id={selectId}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`border-line text-content-secondary shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted disabled:text-content-muted w-full rounded-md border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${error ? 'border-danger-border focus:border-danger focus:ring-danger' : ''} ${className}`
          .trim()
          .replace(/\s+/g, ' ')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-danger mt-1 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectWithLabel;

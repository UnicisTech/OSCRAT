import React from 'react';

interface InputWithLabelProps {
  type?: string;
  name: string;
  placeholder?: string;
  value?: string;
  label?: React.ReactNode | string;
  labelStyle?: string;
  error?: string;
  descriptionText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  type = 'text',
  name,
  placeholder,
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
  maxLength,
  minLength,
  pattern,
  autoComplete,
}) => {
  const inputId = `input-${name}`;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2">
          {typeof label === 'string' ? (
            <label
              htmlFor={inputId}
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
      <input
        id={inputId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoComplete={autoComplete}
        className={`border-line text-content-secondary placeholder-content-placeholder shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted disabled:text-content-muted w-full rounded-md border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${error ? 'border-danger-border focus:border-danger focus:ring-danger' : ''} ${className} `
          .trim()
          .replace(/\s+/g, ' ')}
      />
      {error && (
        <p className="text-danger mt-1 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputWithLabel;

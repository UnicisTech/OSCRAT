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
                labelStyle || 'block text-sm font-medium text-gray-700'
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
        <p className="mb-2 text-sm text-gray-600">{descriptionText}</p>
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
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className} `
          .trim()
          .replace(/\s+/g, ' ')}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputWithLabel;

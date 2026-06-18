import React from 'react';

export interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
}) => (
  <div>
    <label
      htmlFor={id}
      className="text-content-secondary mb-1 block text-sm font-medium"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="border-line bg-surface placeholder-content-placeholder shadow-2 focus:border-primary focus:ring-primary rounded-input block w-full border px-3 py-2 focus:outline-none sm:text-sm"
    />
  </div>
);

export default InputField;

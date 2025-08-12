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
      className="mb-1 block text-sm font-medium text-gray-700"
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
      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
    />
  </div>
);

export default InputField;

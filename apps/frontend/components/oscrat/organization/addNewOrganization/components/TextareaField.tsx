import React from 'react';

export interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <textarea
      id={id}
      name={id}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
    />
  </div>
);

export default TextareaField;

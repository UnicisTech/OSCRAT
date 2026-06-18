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
      className="text-content-secondary mb-1 block text-sm font-medium"
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
      className="border-line placeholder-content-placeholder shadow-2 focus:border-primary focus:ring-primary rounded-input block w-full border px-3 py-2 focus:outline-none sm:text-sm"
    />
  </div>
);

export default TextareaField;

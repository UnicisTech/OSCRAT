import React from 'react';

export interface RadioGroupProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
}) => (
  <div>
    <label className="text-content-secondary mb-2 block text-sm font-medium">
      {label}
    </label>
    <div className="flex items-center space-x-6">
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="radio"
            value={option.value}
            checked={selectedValue === option.value}
            onChange={onChange}
            className="border-line focus:ring-primary h-4 w-4 accent-gray-800"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-content ml-2 block text-sm"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

export default RadioGroup;

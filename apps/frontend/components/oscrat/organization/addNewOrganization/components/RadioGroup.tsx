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
    <label className="mb-2 block text-sm font-medium text-gray-700">
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
            className="h-4 w-4 border-gray-300 accent-gray-800 focus:ring-blue-500"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-2 block text-sm text-gray-900"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

export default RadioGroup;

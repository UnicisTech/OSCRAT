import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/shared/shadcn/Select';
import { useTheme } from 'next-themes';
import {
  statusOptions,
  getOptionStyle,
} from '@/components/defaultLanding/data/configs/csc';

const StatusSelector = ({
  isDisabled,
  statusValue,
  control,
  handler,
}: {
  isDisabled: boolean;
  statusValue: string;
  control: string;
  handler: (control: string, value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState(statusValue);
  const { theme } = useTheme();

  useEffect(() => {
    setValue(statusValue);
  }, [statusValue]);

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        setValue(newValue);
        handler(control, newValue);
      }}
      disabled={isDisabled}
    >
      <SelectTrigger
        className={` ${theme === 'light' ? 'text-black' : theme === 'dark' ? 'text-white' : ''}`}
      >
        {value || 'Status'}
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.label}
            className={`${getOptionStyle(option.label)}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;

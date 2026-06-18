import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/shared/shadcn/Select';
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
      <SelectTrigger className="text-content">
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

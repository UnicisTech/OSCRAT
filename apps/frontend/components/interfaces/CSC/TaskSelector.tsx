import React, { useState, useEffect } from 'react';
import Select from '@atlaskit/select';
import { useTranslation } from 'next-i18next';
import { WithoutRing } from 'sharedStyles';
import { getCscControlsProp } from '@/lib/csc';
import type { Task } from '@oscrat/model';
import type { CscOption, ISO } from 'types';
import { formatTaskLabel } from '@/lib/tasks';

const TaskSelector = ({
  tasks,
  control,
  handler,
  ISO,
}: {
  tasks: Array<Task>;
  control: string;
  handler: (
    action: string,
    dataToRemove: any,
    control: string
  ) => Promise<void>;
  ISO: ISO;
}) => {
  const [value, setValue] = useState<CscOption[]>([]);
  const [options, setOptions] = useState<CscOption[]>([]);
  const { t } = useTranslation('common');

  useEffect(() => {
    const options = tasks.map((task) => ({
      label: formatTaskLabel(task, t),
      value: task.taskNumber,
    }));
    const cscStatusesProp = getCscControlsProp(ISO);
    const selectedOptions = tasks
      .filter((task: any) =>
        task.properties?.[cscStatusesProp]?.find(
          (item: string) => item === control
        )
      )
      ?.map((issue) => ({ label: formatTaskLabel(issue, t), value: issue.taskNumber }));
    setOptions(options);
    setValue(selectedOptions);
  }, []);
  return (
    <WithoutRing>
      <Select
        inputId="multi-select-status"
        className="multi-select"
        classNamePrefix="react-select"
        options={options}
        onChange={(selectedIssue, actionMeta) => {
          const { action, option, removedValue, removedValues } = actionMeta;
          setValue([...selectedIssue]);
          const dataToRemove = option
            ? [option]
            : removedValue
              ? [removedValue]
              : removedValues;
          handler(action, dataToRemove, control);
        }}
        value={value}
        placeholder="Tasks"
        isMulti
      />
    </WithoutRing>
  );
};

export default TaskSelector;

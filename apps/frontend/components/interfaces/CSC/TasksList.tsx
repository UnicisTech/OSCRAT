import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { TASK_CSC_PROPERTY_KEYS, type Task } from '@oscrat/model';
import { formatTaskLabel } from '@/lib/tasks';

const TasksList = ({
  tasks,
  control,
}: {
  tasks: Array<Task>;
  control: string;
}) => {
  const [selectedTasks] = useState<Array<Task>>(
    tasks.filter((task: any) =>
      task.properties?.[TASK_CSC_PROPERTY_KEYS.CONTROLS]?.find(
        (item: string) => item === control
      )
    )
  );

  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col">
      {selectedTasks.map((task, index) => (
        <Link
          key={index}
          href={`/organization/${slug}/tasks/${task.taskNumber}`}
        >
          <div className="flex items-center justify-start space-x-2">
            <span className="underline">{formatTaskLabel(task, t)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TasksList;

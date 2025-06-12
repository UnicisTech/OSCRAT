import React from 'react';
import type { Task } from '@prisma/client';

const TaskStatusesDetail = ({
  tasks,
  statusCounts,
}: {
  tasks: Array<Task> | any;
  statusCounts: { [key: string]: number };
}) => {
  return (
    <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-2 lg:grid-cols-2">
      <div className="flex-1 justify-center rounded-md bg-blue-100 p-4 text-center ring-1 ring-gray-300 dark:bg-blue-950 dark:text-white">
        <h1 className="text-sm font-bold">Total Tasks</h1>
        <span className="font-sans text-sm font-bold">
          {tasks?.length || 0}
        </span>
      </div>
      <div className="flex-1 justify-center rounded-md p-4 text-center ring-1 ring-gray-300">
        <h1 className="text-sm font-bold">To Do</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.todo || 0}
        </span>
      </div>
      <div className="w-full flex-1 justify-center rounded-md p-4 text-center ring-1 ring-gray-300">
        <h1 className="text-sm font-bold">In Progress</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.inprogress || 0}
        </span>
      </div>
      <div className="flex-1 justify-center rounded-md p-4 text-center ring-1 ring-gray-300">
        <h1 className="text-sm font-bold">In Review</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.inreview || 0}
        </span>
      </div>
      <div className="flex-1 justify-center rounded-md p-4 text-center ring-1 ring-gray-300">
        <h1 className="text-sm font-bold">Feedback</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.feedback || 0}
        </span>
      </div>
      <div className="flex-1 justify-center rounded-md p-4 text-center ring-1 ring-gray-300">
        <h1 className="text-sm font-bold">Done</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.done || 0}
        </span>
      </div>
    </div>
  );
};

export default TaskStatusesDetail;

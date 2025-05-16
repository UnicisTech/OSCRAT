import React, { useState, useEffect } from 'react';
import StatusHeader from './StatusHeader';
import TaskSelector from './TaskSelector';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import { getCscControlsProp } from '@/lib/csc';
import StatusSelector from './StatusSelector';
import type { CscOption } from 'types';
import type { Task } from '@prisma/client';
import usePagination from 'hooks/usePagination';
import useCanAccess from '@/hooks/useCanAccess';
import { ControlOption, ISO } from 'types';
import { TailwindTableWrapper } from 'sharedStyles';
import TasksList from './TasksList';
import { useRouter } from 'next/router';

const StatusesTable = ({
  iso,
  tasks,
  statuses,
  sectionFilter,
  statusFilter,
  perPage,
  statusHandler,
  taskSelectorHandler,
}: {
  iso: ISO;
  tasks: Array<Task>;
  statuses: any;
  sectionFilter: null | Array<{ label: string; value: string }>;
  statusFilter: null | Array<CscOption>;
  perPage: number;
  statusHandler: (control: string, value: string) => Promise<void>;
  taskSelectorHandler: (
    action: string,
    dataToRemove: any,
    control: string,
  ) => Promise<void>;
}) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { canAccess } = useCanAccess(slug);
  const [filteredControls, setFilteredControls] = useState<
    Array<ControlOption>
  >(getControlOptions(iso));
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<ControlOption>(filteredControls, perPage);

  const cscControlsProp = getCscControlsProp(iso);

  useEffect(() => {
    let filteredControls = [...getControlOptions(iso)];
    if (
      (sectionFilter === null || sectionFilter?.length === 0) &&
      (statusFilter === null || statusFilter?.length === 0)
    ) {
      setFilteredControls(filteredControls);
      return;
    }
    if (sectionFilter?.length) {
      filteredControls = filteredControls.filter((item) => {
        const sections = sectionFilter.map((option) => option.value);
        const content = item.value.section;
        if (iso === '2013') {
          return sections.some((section) => content.includes(section));
        } else {
          return sections.includes(content);
        }
      });
    }
    if (statusFilter?.length) {
      filteredControls = filteredControls.filter((control) =>
        statusFilter
          .map((option) => option.label)
          .includes(statuses[control.value.control]),
      );
    }

    setFilteredControls(filteredControls);
  }, [sectionFilter, statusFilter, iso, statuses]);

  return (
    <>
      <TailwindTableWrapper>
        <div className="overflow-x- mt-2">
          {/* <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400"> */}
          <table className="table w-full border-b text-sm dark:border-base-200">
            <thead className="bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Code
                </th>
                <th scope="col" className="px-6 py-3">
                  Section
                </th>
                <th scope="col" className="px-6 py-3">
                  Control
                </th>
                <th scope="col" className="px-6 py-3">
                  Requirements
                </th>
                <th scope="col" className="px-6 py-3">
                  <StatusHeader />
                </th>
                <th scope="col" className="px-6 py-3">
                  Tasks
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((option) => (
                <tr
                  key={option.value.control}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-3">{option.value.code}</td>
                  <td className="px-6 py-3">{option.value.section}</td>
                  <td className="px-6 py-3">
                    {option.value.controlLabel || option.value.control}
                  </td>
                  <td className="px-6 py-3">
                    <span style={{ whiteSpace: "pre-line" }}>
                      {option.value.requirements}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {canAccess("task", ["update"]) ? (
                      <div className="w-40">
                        <StatusSelector
                          statusValue={statuses[option.value.control]}
                          control={option.value.control}
                          handler={statusHandler}
                          isDisabled={
                            !tasks.filter((task: any) =>
                              task.properties?.[cscControlsProp]?.find(
                                (item: string) => item === option.value.control,
                              ),
                            ).length
                          }
                        />
                      </div>
                    ) : (
                      <span style={{ whiteSpace: "pre-line" }}>
                        {statuses[option.value.control]}
                      </span>
                    )}
                  </td>
                  <td className="w-40 px-6 py-3">
                    {canAccess("task", ["update"]) ? (
                      <TaskSelector
                        tasks={tasks}
                        control={option.value.control}
                        handler={taskSelectorHandler}
                        ISO={iso}
                      />
                    ) : (
                      <TasksList tasks={tasks} control={option.value.control} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageData.length ? (
          <div className="mt-3 w-full">
            <div className="w-30 flex justify-center">
              <div className="btn-group join grid grid-cols-10">
                <button
                  className="btn btn-outline join-item col-span-4"
                  onClick={goToPreviousPage}
                  disabled={prevButtonDisabled}
                >
                  Previous page
                </button>
                <button className="btn btn-outline join-item col-span-2">{`${currentPage}/${totalPages}`}</button>
                <button
                  className="btn btn-outline join-item col-span-4"
                  onClick={goToNextPage}
                  disabled={nextButtonDisabled}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </TailwindTableWrapper>
    </>
  );
};

export default StatusesTable;

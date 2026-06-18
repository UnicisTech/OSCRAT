import React, { useState, useEffect } from 'react';
import StatusHeader from './StatusHeader';
import TaskSelector from './TaskSelector';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import { getCscControlsProp } from '@/lib/csc';
import StatusSelector from './StatusSelector';
import type { CscOption } from 'types';
import type { Task } from '@oscrat/model';
import usePagination from 'hooks/usePagination';
import useCanAccess from '@/hooks/useCanAccess';
import { ControlOption, ISO } from 'types';
import { TailwindTableWrapper } from 'sharedStyles';
import TasksList from './TasksList';
import { useRouter } from 'next/router';
import { Button } from '@/components/shared';

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
    control: string
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
          .includes(statuses[control.value.control])
      );
    }

    setFilteredControls(filteredControls);
  }, [sectionFilter, statusFilter, iso, statuses]);

  return (
    <>
      <TailwindTableWrapper>
        <div className="overflow-x- mt-2">
          {/* <table className="w-full table-fixed text-left text-sm text-content-muted ">
 <thead className="bg-surface-muted text-xs uppercase text-content-secondary "> */}
          <table className="table w-full border-b text-sm">
            <thead className="text-content bg-surface-muted border-b border-line-header">
              <tr>
                <th scope="col" className="p-4 text-b2 font-medium">
                  Code
                </th>
                <th scope="col" className="p-4 text-b2 font-medium">
                  Section
                </th>
                <th scope="col" className="p-4 text-b2 font-medium">
                  Control
                </th>
                <th scope="col" className="p-4 text-b2 font-medium">
                  Requirements
                </th>
                <th scope="col" className="p-4 text-b2 font-medium">
                  <StatusHeader />
                </th>
                <th scope="col" className="p-4 text-b2 font-medium">
                  Tasks
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((option) => (
                <tr
                  key={option.value.control}
                  className="bg-surface hover:bg-surface-muted border-b"
                >
                  <td className="px-4 py-3">{option.value.code}</td>
                  <td className="px-4 py-3">{option.value.section}</td>
                  <td className="px-4 py-3">
                    {option.value.controlLabel || option.value.control}
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ whiteSpace: 'pre-line' }}>
                      {option.value.requirements}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canAccess('task', ['update']) ? (
                      <div className="w-40">
                        <StatusSelector
                          statusValue={statuses[option.value.control]}
                          control={option.value.control}
                          handler={statusHandler}
                          isDisabled={
                            !tasks.filter((task: any) =>
                              task.properties?.[cscControlsProp]?.find(
                                (item: string) => item === option.value.control
                              )
                            ).length
                          }
                        />
                      </div>
                    ) : (
                      <span style={{ whiteSpace: 'pre-line' }}>
                        {statuses[option.value.control]}
                      </span>
                    )}
                  </td>
                  <td className="w-40 px-4 py-3">
                    {canAccess('task', ['update']) ? (
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
            <div className="w-30 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                onClick={goToPreviousPage}
                disabled={prevButtonDisabled}
              >
                Previous page
              </Button>
              <span className="text-content-secondary text-b2 px-2">{`${currentPage}/${totalPages}`}</span>
              <Button
                variant="secondary"
                onClick={goToNextPage}
                disabled={nextButtonDisabled}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </TailwindTableWrapper>
    </>
  );
};

export default StatusesTable;

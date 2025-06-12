import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { Loading } from '@/components/shared';
import { useTeamContext } from '@/context/TeamContext';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import {
  StatusesTable,
  PieChart,
  RadarChart,
  SectionFilter,
  StatusCscFilter,
} from '@/components/interfaces/CSC';
import { PerPageSelector } from '@/components/shared/atlaskit';
import {
  perPageOptions,
  isoOptions,
} from '@/components/defaultLanding/data/configs/csc';
import { useTeamTasks } from 'hooks/useTeamTasks';
import { getCscStatusesBySlug } from 'models/team';
import type { Option } from 'types';
import useISO from 'hooks/useISO';
import { useTeam } from 'hooks/useTeam';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from 'next-i18next';

const labels = [
  'Unknown',
  'Not Applicable',
  'Not Performed',
  'Performed Informally',
  'Planned',
  'Well Defined',
  'Quantitatively Controlled',
  'Continuously Improving',
];

const barColors = [
  'rgba(241, 241, 241, 1)',
  'rgba(178, 178, 178, 1)',
  'rgba(255, 0, 0, 1)',
  'rgba(202, 0, 63, 1)',
  'rgba(102, 102, 102, 1)',
  'rgba(255, 190, 0, 1)',
  'rgba(106, 217, 0, 1)',
  'rgba(47, 143, 0, 1)',
];

const CscDashboard = ({
  csc_statuses,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  const [statuses, setStatuses] = useState(csc_statuses || {});
  const [sectionFilter, setSectionFilter] = useState<
    null | { label: string; value: string }[]
  >(null);
  const [statusFilter, setStatusFilter] = useState<null | Option[]>(null);
  const [perPage, setPerPage] = useState<number>(10);

  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { tasks } = useTeamTasks(slug as string);
  const { iso } = useISO(slug as string);
  const { updateCscStatus, updateTaskCsc } = useTeam(slug as string);

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      try {
        const response = await updateCscStatus({ control, value });
        setStatuses(response.statuses);
        return Promise.resolve();
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('failed-to-update-status')));
        return Promise.reject(error);
      }
    },
    [updateCscStatus, t]
  );

  const taskSelectorHandler = useCallback(
    async (action: string, dataToRemove: any, control: string) => {
      const operation = action === 'select-option' ? 'add' : 'remove';

      for (const option of dataToRemove) {
        const taskNumber = option.value;

        try {
          await updateTaskCsc(taskNumber, {
            controls: [control],
            operation,
            iso,
          });
        } catch (error: unknown) {
          toast.error(
            extractErrorMessage(error, t('failed-to-update-task-csc'))
          );
        }
      }
    },
    [iso, updateTaskCsc, t]
  );

  if (!tasks || !iso) {
    return <Loading />;
  }

  return (
    <>
      <h2 className="text-xl font-medium leading-none tracking-tight">
        {'Cybersecurity Controls Dashboard: '}
        {team.name}
      </h2>
      {/* <h2 className="text-2xl font-bold">{"Cybersecurity Controls Dashboard: "}{team.name}</h2> */}
      <div
        style={{
          height: '400px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '10px',
        }}
      >
        <div
          style={{ width: '49%' }}
          className="stats stat-value bg-white py-4 pl-4 shadow dark:bg-base-100"
        >
          <PieChart
            page_name={`csc`}
            statuses={statuses}
            barColor={barColors}
            labels={labels}
          />
        </div>
        <div style={{ width: '49%' }} className="stats stat-value shadow">
          <RadarChart statuses={statuses} iso={iso} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="flex items-center">
          <p>
            Framework:
            <b>{isoOptions.find(({ value }) => value === iso)?.label}</b>
          </p>
        </div>
        <div className="flex flex-row justify-end">
          <SectionFilter iso={iso} setSectionFilter={setSectionFilter} />
          <StatusCscFilter setStatusFilter={setStatusFilter} />
          <PerPageSelector
            setPerPage={setPerPage}
            options={perPageOptions}
            placeholder="Controls per page"
            defaultValue={{
              label: '10',
              value: 10,
            }}
          />
        </div>
      </div>
      <StatusesTable
        iso={iso}
        tasks={tasks}
        statuses={statuses}
        sectionFilter={sectionFilter}
        statusFilter={statusFilter}
        perPage={perPage}
        statusHandler={statusHandler}
        taskSelectorHandler={taskSelectorHandler}
      />
    </>
  );
};

CscDashboard.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
};

export default CscDashboard;

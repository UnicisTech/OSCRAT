import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import { useTask } from 'hooks/useTask';
import {
  Attachments,
  Comments,
  CommentsTab,
  TaskDetails,
  TaskTab,
} from '@/components/interfaces/Task';
import { CscAuditLogs, CscPanel } from '@/components/interfaces/CSC';
import { useTeamContext } from '@/context/TeamContext';
import useISO from 'hooks/useISO';
import { Team } from '@oscrat/model';
import { getCscStatusesBySlug } from 'models/team';
import Breadcrumb from '../../Breadcrumb';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';

const TaskById = ({
  csc_statuses,
}: {
  csc_statuses: { [key: string]: string };
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [statuses, setStatuses] = useState(csc_statuses);
  const [activeCommentTab, setActiveCommentTab] = useState('Comments');
  const router = useRouter();
  const { taskNumber, slug } = router.query;
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { task, isLoading, isError, error } = useTask(
    slug as string,
    taskNumber as string
  );
  const { iso } = useISO(slug as string);

  if (isLoading || !iso) {
    return <Loading />;
  }

  if (!task || isError) {
    return <Error message={error?.message || 'Error loading task'} />;
  }

  return (
    <>
      <Breadcrumb
        taskTitle={task.title}
        backTo={`/teams/${slug}/tasks`}
        teamName={slug as string}
        taskNumber={taskNumber as string}
      />
      <h3 className="text-2xl font-bold">{task.title}</h3>
      <TaskTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Overview' && (
        <>
          <Card heading="Details">
            <Card.Body>
              <TaskDetails task={task} team={team as Team} />
            </Card.Body>
          </Card>
          <Card heading="Attachments">
            <Card.Body>
              <Attachments task={task} />
            </Card.Body>
          </Card>
        </>
      )}
      {activeTab === 'Cybersecurity Controls' && (
        <Card heading="CSC panel">
          <Card.Body>
            <CscPanel
              task={task}
              statuses={statuses}
              setStatuses={setStatuses}
              ISO={iso}
            />
          </Card.Body>
        </Card>
      )}
      <CommentsTab
        activeTab={activeCommentTab}
        setActiveTab={setActiveCommentTab}
      />
      {activeCommentTab === 'Comments' && (
        <Card heading="Comments">
          <Card.Body>
            <Comments task={task} />
          </Card.Body>
        </Card>
      )}
      {activeCommentTab === 'Audit logs' && (
        <>
          <Card heading="CSC Audit logs">
            <Card.Body>
              <CscAuditLogs task={task} />
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

TaskById.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
     {page}
    </AccountLayout>
  );
};

export async function getServerSideProps({
  locale,
  query,
}: GetServerSidePropsContext) {
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TaskById;

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Button,
  Error,
  Loading,
  StatusBadge,
  WithLoadingAndError,
} from '@/components/shared';
import useTasks from 'hooks/useTasks';
import useCanAccess from '@/hooks/useCanAccess';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import type { Task, Team } from '@oscrat/model';
import { CreateTask, DeleteTask, EditTask } from '@/components/interfaces/Task';
import { resolveTaskTitle } from '@/lib/tasks';

const Tasks = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { isLoading, isError, tasks } = useTasks(slug as string);
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task>({} as Task);
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null);

  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(slug);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const openDeleteModal = async (id: number) => {
    setTaskToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = async (task: Task) => {
    setTaskToEdit({ ...task });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="bg-surface space-y-3 text-black">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('all-tasks')}
            </h2>
            <p className="text-content-muted text-sm">{t('task-listed')}</p>
          </div>

          {canAccess('task', ['create']) && (
            <Button
              size="m"
              variant="secondary"
              onClick={() => {
                setVisible(!visible);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
        <table className="table w-full border-b text-sm">
          <thead className="bg-surface-muted text-content border-b border-line-header">
            <tr>
              <th scope="col" className="p-4 text-b2 font-medium">
                {t('task-id')}
              </th>
              <th scope="col" className="p-4 text-b2 font-medium">
                {t('title')}
              </th>
              <th scope="col" className="p-4 text-b2 font-medium">
                {t('status')}
              </th>
              <th scope="col" className="p-4 text-b2 font-medium">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks &&
              tasks.map((task) => {
                return (
                  <tr key={task.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/organization/${slug}/tasks/${task.taskNumber}`}
                      >
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{task.taskNumber}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/organization/${slug}/tasks/${task.taskNumber}`}
                      >
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">
                            {resolveTaskTitle(task, t)}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        value={task.status}
                        label={t(getTaskStatusTranslationKey(task.status))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canAccess('task', ['update']) && (
                          <Button
                            size="m"
                            variant="secondary"
                            onClick={() => {
                              openEditModal(task);
                            }}
                          >
                            {t('edit-task')}
                          </Button>
                        )}
                        {canAccess('task', ['delete']) && (
                          <Button
                            size="m"
                            variant="secondary"
                            onClick={() => {
                              openDeleteModal(task.taskNumber);
                            }}
                          >
                            {t('delete')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <CreateTask visible={visible} setVisible={setVisible} team={team} />
        {editVisible && (
          <EditTask
            visible={editVisible}
            setVisible={setEditVisible}
            team={team}
            task={taskToEdit}
          />
        )}
        <DeleteTask
          visible={deleteVisible}
          setVisible={setDeleteVisible}
          taskNumber={taskToDelete}
          teamSlug={team.slug}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default Tasks;

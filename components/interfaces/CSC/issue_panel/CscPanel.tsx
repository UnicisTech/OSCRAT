import React, {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import ControlBlock from './ControlBlock';
import type { Task } from '@prisma/client';
import { IssuePanelContainer } from 'sharedStyles';
import useCanAccess from '@/hooks/useCanAccess';
import ControlBlockViewOnly from './ControlBlockViewOnly';
import { getCscControlsProp } from '@/lib/csc';
import type { ISO } from 'types';
import { useTeam } from '@/hooks/useTeam';
import { extractErrorMessage } from '@/lib/utils';

const CscPanel = ({
  task,
  statuses,
  ISO,
  setStatuses,
}: {
  task: Task;
  statuses: { [key: string]: string };
  ISO: ISO;
  setStatuses: Dispatch<
    SetStateAction<{
      [key: string]: string;
    }>
  >;
}) => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { updateTaskCsc } = useTeam(slug);
  const { canAccess } = useCanAccess(slug);

  const properties = task?.properties as any;
  const issueControls = (properties?.[getCscControlsProp(ISO)] as string[]) || [
    '',
  ];

  const [controls, setControls] = useState(issueControls);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  console.log('statuses', statuses);

  useEffect(() => {
    setControls(issueControls);
  }, [issueControls]);

  const addControl = useCallback(() => {
    setControls((prev) => [...prev, '']);
  }, [setControls]);

  const deleteControls = useCallback(async () => {
    setIsDeleting(true);
    try {
      await updateTaskCsc(task.taskNumber, {
        controls: [...controls],
        operation: 'remove',
        iso: ISO,
      });
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('error.delete-controls')));
    } finally {
      setIsDeleting(false);
    }
  }, [task, controls, updateTaskCsc, ISO, t]);

  const controlHanlder = useCallback(
    async (oldControl: string, newControl: string) => {
      setIsSaving(true);
      try {
        if (oldControl === '') {
          await updateTaskCsc(task.taskNumber, {
            controls: [newControl],
            operation: 'add',
            iso: ISO,
          });
        } else {
          await updateTaskCsc(task.taskNumber, {
            controls: [oldControl, newControl],
            operation: 'change',
            iso: ISO,
          });
        }
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('error.update-control')));
      } finally {
        setIsSaving(false);
      }
    },
    [task, updateTaskCsc, ISO, t]
  );

  const deleteControlHandler = useCallback(
    async (control: string) => {
      setIsDeleting(true);
      try {
        await updateTaskCsc(task.taskNumber, {
          controls: [control],
          operation: 'remove',
          iso: ISO,
        });
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('error.delete-control')));
      } finally {
        setIsDeleting(false);
      }
    },
    [task, updateTaskCsc, ISO, t]
  );

  return (
    <IssuePanelContainer>
      <h2 className="text-1xl font-bold">Cybersecurity Controls</h2>
      {canAccess('task', ['update']) ? (
        <>
          {controls.map((control, index) => (
            <ControlBlock
              key={index}
              ISO={ISO}
              status={statuses[control]}
              setStatuses={setStatuses}
              control={control}
              controls={controls}
              controlHanlder={controlHanlder}
              deleteControlHandler={deleteControlHandler}
              isSaving={isSaving}
              isDeleting={isDeleting}
            />
          ))}
          <div
            style={{
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ margin: '0 5px' }}>
              <Button
                color="primary"
                variant="outline"
                size="sm"
                onClick={addControl}
                active={isDeleting || isSaving}
              >
                + Add Control
              </Button>
            </div>
            <div style={{ margin: '0 5px' }}>
              <Button variant="outline" size="sm" onClick={deleteControls}>
                {t('remove')}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {controls.map((control, index) => (
            <ControlBlockViewOnly
              key={index}
              ISO={ISO}
              status={statuses[control]}
              control={control}
            />
          ))}
        </>
      )}
    </IssuePanelContainer>
  );
};

export default CscPanel;

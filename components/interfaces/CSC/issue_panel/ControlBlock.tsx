import React, {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Select from '@atlaskit/select';
import { LoadingButton } from '@atlaskit/button';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import TextArea from '@atlaskit/textarea';
import Textfield from '@atlaskit/textfield';
import { WithoutRing } from 'sharedStyles';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import StatusSelector from '../StatusSelector';
import { useTeam } from '@/hooks/useTeam';
import { useTranslation } from 'next-i18next';
import { extractErrorMessage } from '@/lib/utils';
const ControlBlock = ({
  ISO,
  status,
  control,
  controls,
  controlHanlder,
  isSaving,
  isDeleting,
  deleteControlHandler,
  setStatuses,
}: {
  ISO: string;
  status: string;
  control: string;
  controls: string[];
  controlHanlder: (oldControl: string, newControl: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  deleteControlHandler: (control: string) => void;
  setStatuses: Dispatch<
    SetStateAction<{
      [key: string]: string;
    }>
  >;
}) => {
  console.log('status control block', status);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug } = router.query as { slug: string };
  const { updateCscStatus } = useTeam(slug);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const controlOptions = useMemo(() => getControlOptions(ISO), [ISO]);
  const controlData = controlOptions.find(
    ({ value }) => value.control === control
  )?.value;

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      try {
        const response = await updateCscStatus({
          control,
          value,
        });

        toast.success('Status changed!');
        setStatuses(response.statuses);
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('error.update-status')));
      }
    },
    [updateCscStatus, setStatuses, t]
  );

  return (
    <>
      <div>
        <p className="csc_label">Select a control</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '11fr 1fr',
            alignItems: 'center',
          }}
        >
          <WithoutRing>
            <Select
              inputId="single-select-control"
              className="single-select"
              classNamePrefix="react-select"
              options={controlOptions.filter(
                (option) =>
                  !controls.find((item) => item === option.value.control)
              )}
              onChange={(option) => {
                controlHanlder(control, option?.value?.control as string);
              }}
              value={controlOptions.find(
                ({ value }) => value.control === control
              )}
              formatOptionLabel={({ value }) =>
                `${value.code}: ${value.section}, ${value.controlLabel}, ${value.requirements}`
              }
              placeholder="Choose a control"
              isDisabled={isSaving || isDeleting}
            />
          </WithoutRing>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              appearance="danger"
              iconBefore={<TrashIcon size="medium" label="Delete" />}
              onClick={async () => {
                setIsButtonLoading(true);
                await deleteControlHandler(control);
                setIsButtonLoading(false);
              }}
              isLoading={isButtonLoading}
              isDisabled={isSaving}
            ></LoadingButton>
          </div>
        </div>
      </div>
      {controlData?.code && (
        <>
          <p className="csc_label">Code</p>
          <Textfield isReadOnly value={controlData.code} />
        </>
      )}
      {controlData?.section && (
        <>
          <p className="csc_label">Section</p>
          <Textfield isReadOnly value={controlData?.section} />
        </>
      )}
      <>
        <p className="csc_label">Status</p>
        <StatusSelector
          statusValue={status}
          control={control}
          handler={statusHandler}
          isDisabled={false}
        />
      </>
      {controlData?.requirements && (
        <>
          <p className="csc_label">Requirements</p>
          <TextArea
            resize="auto"
            maxHeight="20vh"
            name="area"
            value={controlData?.requirements}
            isReadOnly
            // Temporary solution to escape type errors
            {...({} as any)}
          />
        </>
      )}
      <div
        style={{
          height: '1px',
          width: '100%',
          backgroundColor: 'rgb(223, 225, 231)',
          margin: '24px 0px',
        }}
      ></div>
    </>
  );
};

export default ControlBlock;

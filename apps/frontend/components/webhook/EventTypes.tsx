import React, { ReactElement } from 'react';
import type { WebookFormSchema } from 'types';

export const eventTypes = [
  'member.created',
  'member.removed',
  'invitation.created',
  'invitation.removed',
  'task.created',
  'task.updated',
  'task.commented',
  'task.deleted',
];

const EventTypes = ({
  onChange,
  values,
  error,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  values: WebookFormSchema['eventTypes'];
  error: string | string[] | undefined;
}) => {
  const events: ReactElement[] = [];

  eventTypes.forEach((eventType) => {
    events.push(
      <div className="flex items-center" key={eventType}>
        <input
          type="checkbox"
          name="eventTypes"
          value={eventType}
          onChange={onChange}
          className="border-line bg-surface-muted text-primary focus:ring-primary h-4 w-4 rounded focus:ring-2"
          defaultChecked={values ? values.includes(eventType) : false}
        />
        <label className="text-content ml-2 text-sm">{eventType}</label>
      </div>
    );
  });

  return (
    <>
      {events}
      {error && typeof error === 'string' && (
        <div className="label-text-alt text-danger">{error}</div>
      )}
    </>
  );
};

export default EventTypes;

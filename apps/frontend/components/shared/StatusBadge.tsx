import { Badge as BaseBadge } from 'react-daisyui';

type BadgeColor = 'ghost' | 'secondary' | 'primary' | 'info' | 'success' | 'warning' | 'neutral' | 'accent' | 'error';

const colors: Record<string, BadgeColor> = {
  todo: 'ghost',
  inprogress: 'secondary',
  inreview: 'primary',
  feedback: 'info',
  done: 'success',
  draft: 'warning',
  published: 'success',
  archived: 'ghost',
};

const StatusBadge = ({ label, value }: { label: string; value: string }) => {
  const color = colors[value.toLowerCase()] || 'ghost';
  return (
    <BaseBadge
      className="whitespace-nowrap rounded py-2 text-xs text-white"
      color={color}
    >
      {label}
    </BaseBadge>
  );
};

export default StatusBadge;

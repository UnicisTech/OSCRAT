import Badge, { BadgeColor } from './Badge';

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
  return <Badge color={color}>{label}</Badge>;
};

export default StatusBadge;

import app from '@/lib/app';
import Button from '@/components/button';
import { useTranslation } from 'next-i18next';

interface HeaderProps {
  title: string;
  onClose?: () => void;
}

export default function Header({ title, onClose }: HeaderProps) {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="bg-surface shadow-4 flex items-center justify-between px-6 py-3">
      <div className="flex items-center">
        <img src={app.logoUrl} alt={app.name} className="h-10 w-auto" />
      </div>
      <h1 className="text-content text-lg font-semibold">{title}</h1>
      {onClose ? (
        <Button variant="secondary" onClick={onClose}>
          {t('close')}
        </Button>
      ) : (
        <div></div>
      )}{' '}
    </div>
  );
}

import app from '@/lib/app';
import { useTranslation } from 'next-i18next';

interface HeaderProps {
  title: string;
  onClose?: () => void;
}

export default function Header({ title, onClose }: HeaderProps) {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="flex items-center justify-between py-3 px-6 bg-white dark:bg-gray-900 shadow-md">

      <div className="flex items-center">
        <img src={app.logoUrl} alt={app.name} className="h-10 w-auto" />
      </div>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      
      {onClose ? (
              <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {t('close')}
        </button>
      ) : (
        <div></div>
      )}   </div>
  )
}
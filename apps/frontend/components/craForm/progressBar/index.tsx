import { ProgressBarProps } from '@oscrat/model';
import { useTranslation } from 'next-i18next';

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const progress = Math.round((step / total) * 100);
  const { t, ready } = useTranslation('common');

  if (!step || !total || !ready) {
    return null;
  } 

  return (
    <div className="border text-gray-900 border-gray-300 rounded-lg py-2 px-4">
      <p className="mb-1 text-sm font-bold">{t('oscrat.ui.progress')}</p>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between">
        <p className="my-1 text-sm">
          {step}/{total} {t('oscrat.ui.questions')}
        </p>
        <p className="mb-1 text-sm">{progress}%</p>
      </div>
    </div>
  );
}

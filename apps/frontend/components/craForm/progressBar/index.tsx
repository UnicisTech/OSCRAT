import { ProgressBarProps } from '@oscrat/model';
import { useTranslation } from 'next-i18next';

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const progress = Math.round((step / total) * 100);
  const { t, ready } = useTranslation('common');

  if (!step || !total || !ready) {
    return null;
  }

  return (
    <div className="bg-surface text-content border-line rounded-card border px-6 py-3">
      <p className="mb-1 text-sm font-bold">{t('oscrat.ui.progress')}</p>
      <div className="bg-surface-muted h-2 w-full rounded-full">
        <div
          className="bg-primary h-full rounded-full"
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

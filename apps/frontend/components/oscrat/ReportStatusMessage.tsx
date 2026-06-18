import { useTranslation } from 'next-i18next';
import { WorkerJobStatus } from '@oscrat/model';
import { reportStyles } from '@/components/oscrat/reportStyles';

interface ReportStatusMessageProps {
  status: WorkerJobStatus | null | undefined;
}

export default function ReportStatusMessage({
  status,
}: ReportStatusMessageProps) {
  const { t } = useTranslation('common');

  if (!status) {
    return (
      <div className={reportStyles.errorContainer}>
        <p className={reportStyles.errorText}>
          {t('oscrat.ui.report-not-found')}
        </p>
      </div>
    );
  }

  if (status === WorkerJobStatus.COMPLETED) {
    return null;
  }

  // For any other status (pending, in progress, failed, cancelled)
  return (
    <div className={reportStyles.card}>
      <div className="py-12 text-center">
        <h2 className="text-content mb-2 text-xl font-semibold">
          {t('oscrat.ui.report-not-available')}
        </h2>
      </div>
    </div>
  );
}

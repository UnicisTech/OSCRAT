import { useTranslation } from 'next-i18next';
import { WorkerJobStatus } from '@oscrat/model';
import { reportStyles } from '@/components/oscrat/reportStyles';

interface ReportStatusMessageProps {
  status: WorkerJobStatus | null | undefined;
}

export default function ReportStatusMessage({ status }: ReportStatusMessageProps) {
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
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('oscrat.ui.report-not-available')}
        </h2>
      </div>
    </div>
  );
}

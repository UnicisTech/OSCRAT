import React from 'react';
import { useTranslation } from 'next-i18next';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import type { DocumentationSummary } from '@oscrat/model';

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  documentation: DocumentationSummary | null;
  onConfirm: () => void;
}

const DeleteDocumentationModal: React.FC<Props> = ({
  visible,
  setVisible,
  documentation,
  onConfirm,
}) => {
  const { t } = useTranslation('common');

  return (
    <ConfirmationDialog
      title={t('oscrat.ui.documentation.delete.title')}
      visible={visible}
      onConfirm={onConfirm}
      onCancel={() => setVisible(false)}
    >
      <p className="text-content-secondary">
        {t('oscrat.ui.documentation.delete.confirm', {
          title: documentation?.title,
        })}
      </p>
      <p className="text-content-muted mt-2 text-sm">
        {t('oscrat.ui.documentation.delete.warning')}
      </p>
    </ConfirmationDialog>
  );
};

export default DeleteDocumentationModal;

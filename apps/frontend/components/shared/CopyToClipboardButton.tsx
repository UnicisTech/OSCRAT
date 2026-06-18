import { copyToClipboard } from '@/lib/common';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-hot-toast';
import Button from '@/components/button';

interface CopyToClipboardProps {
  value: string;
}

const CopyToClipboardButton = ({ value }: CopyToClipboardProps) => {
  const { t } = useTranslation('common');

  const handleCopy = () => {
    copyToClipboard(value);
    toast.success(t('copied-to-clipboard'));
  };

  return (
    <Button
      variant="tertiary"
      size="s"
      className="tooltip"
      data-tip={t('copy-to-clipboard')}
      onClick={handleCopy}
      icon={<ClipboardDocumentIcon className="h-5 w-5" />}
    />
  );
};

export default CopyToClipboardButton;

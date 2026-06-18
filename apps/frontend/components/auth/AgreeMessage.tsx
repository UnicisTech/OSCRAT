import { useTranslation } from 'next-i18next';
import Link from 'next/link';

interface Props {
  text: string;
}

const AgreeMessage = ({ text }: Props) => {
  const { t } = useTranslation('common');

  return (
    <p className="text-b2 text-content text-center font-medium">
      {t('agree-message-part', { button: t(text) })}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/terms'}
        className="hover:text-primary-focus text-primary font-medium underline"
      >
        {t('terms')}
      </Link>{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/privacy'}
        className="hover:text-primary-focus text-primary font-medium underline"
      >
        {t('privacy')}
      </Link>{' '}
      {t('and')}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/security'}
        className="hover:text-primary-focus text-primary font-medium underline"
      >
        {t('security')}
      </Link>
    </p>
  );
};

export default AgreeMessage;

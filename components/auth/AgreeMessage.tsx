import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const AgreeMessage = ({ text }) => {
  const { t } = useTranslation('common');

  return (
    <p className="text-center text-sm">
      {t('agree-message-part', { button: t(text) })}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/terms'}
        className="hover:text-primary-focus text-primary font-medium"
      >
        {t('terms')}
      </Link>
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/privacy'}
        className="hover:text-primary-focus text-primary font-medium"
      >
        {t('privacy')}
      </Link>
      {t('and')}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/security'}
        className="hover:text-primary-focus text-primary font-medium"
      >
        {t('security')}
      </Link>
    </p>
  );
};

export default AgreeMessage;

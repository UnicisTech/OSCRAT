import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const HeroSection = () => {
  const { t } = useTranslation('common');
  return (
    <div className="hero py-52">
      <div className="hero-content text-center">
        <div className="max-w-7md">
          <h1 className="text-5xl font-bold"> {t('enterprise-saas-kit')}</h1>
          <p className="py-6 text-2xl font-normal">
            {t('kickstart-your-enterprise')}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/auth/join"
              className="bg-button-primary text-content-inverse hover:bg-button-primary-hover rounded-input inline-flex items-center justify-center px-8 py-2 font-medium no-underline transition-colors"
            >
              {t('get-started')}
            </Link>
            <Link
              href="https://github.com/boxyhq/saas-starter-kit"
              className="border-line text-content hover:bg-button-overlay rounded-input inline-flex items-center justify-center border px-8 py-2 font-medium no-underline transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

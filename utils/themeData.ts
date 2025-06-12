import { useTranslation } from 'next-i18next';

export const useThemeData = () => {
  const { t } = useTranslation('common');

  return [
    {
      id: 'system',
      name: t('system'),
    },
    {
      id: 'dark',
      name: t('dark'),
    },
    {
      id: 'light',
      name: t('light'),
    },
  ];
};

import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { Card } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useTheme } from "next-themes";
import { useThemeIcon } from '@/hooks/useThemeIcon';
import { useThemeData } from '@/utils/themeData';

const UpdateTheme = () => {
  const { theme, setTheme } = useTheme();
    const { getThemeComponent } = useThemeIcon();
    const themes = useThemeData();

    const { t } = useTranslation('common');

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('theme')}</Card.Title>
          <Card.Description>{t('change-theme')}</Card.Description>
        </Card.Header>
        <div className="dropdown w-60">
          <div
            tabIndex={0}
            className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            <div className="flex items-center gap-2">
              {theme && getThemeComponent(theme)}
            </div>
            <ChevronUpDownIcon className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            {themes.map((theme) => (
              <li key={theme.id}>
                <button
                  className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                  onClick={() => {
                    setTheme(theme.id);
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }}
                >
                  {theme.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UpdateTheme;

import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

import { Card } from "@/components/shared";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { useThemeIcon } from "@/hooks/useThemeIcon";
import { useThemeData } from "@/utils/themeData";

const UpdateTheme = () => {
  const { theme, setTheme } = useTheme();
  const { getThemeComponent } = useThemeIcon();
  const themes = useThemeData();

  const { t } = useTranslation("common");

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t("theme")}</Card.Title>
          <Card.Description>{t("change-theme")}</Card.Description>
        </Card.Header>
        <div className="dropdown w-60">
          <div
            tabIndex={0}
            className="flex h-10 cursor-pointer items-center justify-between rounded border border-gray-300 px-4 text-sm font-bold dark:border-gray-600"
          >
            <div className="flex items-center gap-2">
              {theme && getThemeComponent(theme)}
            </div>
            <ChevronUpDownIcon className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content w-full rounded border bg-base-100 p-2 px-2 shadow-md dark:border-gray-600"
          >
            {themes.map((theme) => (
              <li key={theme.id}>
                <button
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-medium hover:bg-gray-100 focus:bg-gray-100 focus:outline-none hover:dark:text-black"
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

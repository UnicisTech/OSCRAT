import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";

export const useThemeIcon = () => {
  const { t } = useTranslation("common");

  const themes = [
    {
      id: "system",
      name: t("system"),
      icon: ComputerDesktopIcon,
    },
    {
      id: "dark",
      name: t("dark"),
      icon: MoonIcon,
    },
    {
      id: "light",
      name: t("light"),
      icon: SunIcon,
    },
  ];

  const getThemeComponent = (themeId: string): JSX.Element => {
    const selectedTheme =
      themes.find((theme) => theme.id === themeId) || themes[0];
    const IconComponent = selectedTheme.icon;

    return (
      <>
        <IconComponent className="h-5 w-5" />
        {selectedTheme.name}
      </>
    );
  };

  return { themes, getThemeComponent };
};

import { useTheme } from 'next-themes';

export const useToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  // Toggles the class of the document html element from dark to light and vice versa, allowing tailwind theming using "dark" prefix
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { toggleTheme };
};

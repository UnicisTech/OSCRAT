import { useTheme } from "next-themes";

export const useToggleTheme = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return { toggleTheme };
};
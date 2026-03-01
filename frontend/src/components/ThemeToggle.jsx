import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-surface/50 border border-white/10 hover:bg-surface transition-colors duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
            ) : (
                <Moon className="w-5 h-5 text-blue-900" />
            )}
        </button>
    );
};

export default ThemeToggle;

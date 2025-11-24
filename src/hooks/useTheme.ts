import { useEffect } from 'react';

export interface ColorTheme {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
    };
}

export const colorThemes: Record<string, ColorTheme> = {
    default: {
        id: 'default',
        name: 'Emerald Ocean',
        colors: {
            primary: '#04d9d9',
            secondary: '#00a8a8',
            accent: '#34d399',
            background: '#002024',
            surface: '#003037'
        }
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Blaze',
        colors: {
            primary: '#f59e0b',
            secondary: '#ef4444',
            accent: '#f97316',
            background: '#1a0a00',
            surface: '#2d1400'
        }
    },
    purple: {
        id: 'purple',
        name: 'Purple Dream',
        colors: {
            primary: '#a855f7',
            secondary: '#7c3aed',
            accent: '#c084fc',
            background: '#1a0a2e',
            surface: '#2e1b4d'
        }
    },
    ocean: {
        id: 'ocean',
        name: 'Deep Ocean',
        colors: {
            primary: '#3b82f6',
            secondary: '#1d4ed8',
            accent: '#60a5fa',
            background: '#001529',
            surface: '#002d52'
        }
    },
    forest: {
        id: 'forest',
        name: 'Forest Green',
        colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#34d399',
            background: '#0a1f1a',
            surface: '#143d2e'
        }
    },
    rose: {
        id: 'rose',
        name: 'Rose Garden',
        colors: {
            primary: '#ec4899',
            secondary: '#db2777',
            accent: '#f472b6',
            background: '#1f0a14',
            surface: '#3d1429'
        }
    },
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        colors: {
            primary: '#06b6d4',
            secondary: '#d946ef',
            accent: '#22d3ee',
            background: '#0a0a14',
            surface: '#1a1a2e'
        }
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight Blue',
        colors: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            accent: '#818cf8',
            background: '#0f0a1f',
            surface: '#1e1533'
        }
    }
};

export const useTheme = (themeId: string = 'default') => {
    useEffect(() => {
        const theme = colorThemes[themeId] || colorThemes.default;

        // Apply theme colors to CSS variables
        document.documentElement.style.setProperty('--primary', theme.colors.primary);
        document.documentElement.style.setProperty('--primary-light', theme.colors.primary);
        document.documentElement.style.setProperty('--primary-dark', theme.colors.secondary);
        document.documentElement.style.setProperty('--secondary', theme.colors.secondary);
        document.documentElement.style.setProperty('--secondary-light', theme.colors.accent);
        document.documentElement.style.setProperty('--emerald', theme.colors.accent);
        document.documentElement.style.setProperty('--dark', theme.colors.background);
        document.documentElement.style.setProperty('--dark-light', theme.colors.surface);
        document.documentElement.style.setProperty('--glass', `${theme.colors.surface}b3`);

        // Update scrollbar color
        const style = document.createElement('style');
        style.id = 'dynamic-scrollbar';
        const existingStyle = document.getElementById('dynamic-scrollbar');
        if (existingStyle) {
            existingStyle.remove();
        }

        style.innerHTML = `
            ::-webkit-scrollbar-thumb {
                background: ${theme.colors.accent};
            }
            ::-webkit-scrollbar-thumb:hover {
                background: ${theme.colors.primary};
            }
            * {
                scrollbar-color: ${theme.colors.accent} transparent;
            }
        `;
        document.head.appendChild(style);

        // Save to localStorage
        localStorage.setItem('focus-ritual-theme', themeId);
    }, [themeId]);

    return colorThemes[themeId] || colorThemes.default;
};

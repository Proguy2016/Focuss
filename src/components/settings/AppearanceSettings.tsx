import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Check, Palette, Sparkles, Moon, Sun, Monitor } from 'lucide-react';

interface Appearance {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    backgroundAnimation: string;
    reducedMotion: boolean;
    compactMode: boolean;
    fontSize: string;
    highContrast: boolean;
    colorTheme?: string;
}

interface AppearanceSettingsProps {
    appearance: Appearance;
    onAppearanceChange: (key: keyof Appearance, value: any) => void;
}

interface ColorTheme {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
    };
    gradient: string;
    preview: string[];
}

const colorThemes: ColorTheme[] = [
    {
        id: 'default',
        name: 'Emerald Ocean',
        description: 'The classic teal theme',
        colors: {
            primary: '#04d9d9',
            secondary: '#00a8a8',
            accent: '#34d399',
            background: '#002024',
            surface: '#003037'
        },
        gradient: 'linear-gradient(135deg, #04d9d9 0%, #00a8a8 100%)',
        preview: ['#04d9d9', '#00a8a8', '#34d399']
    },
    {
        id: 'sunset',
        name: 'Sunset Blaze',
        description: 'Warm orange and pink vibes',
        colors: {
            primary: '#f59e0b',
            secondary: '#ef4444',
            accent: '#f97316',
            background: '#1a0a00',
            surface: '#2d1400'
        },
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        preview: ['#f59e0b', '#ef4444', '#f97316']
    },
    {
        id: 'purple',
        name: 'Purple Dream',
        description: 'Royal purple elegance',
        colors: {
            primary: '#a855f7',
            secondary: '#7c3aed',
            accent: '#c084fc',
            background: '#1a0a2e',
            surface: '#2e1b4d'
        },
        gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        preview: ['#a855f7', '#7c3aed', '#c084fc']
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        description: 'Calm blue waters',
        colors: {
            primary: '#3b82f6',
            secondary: '#1d4ed8',
            accent: '#60a5fa',
            background: '#001529',
            surface: '#002d52'
        },
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        preview: ['#3b82f6', '#1d4ed8', '#60a5fa']
    },
    {
        id: 'forest',
        name: 'Forest Green',
        description: 'Natural and calming',
        colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#34d399',
            background: '#0a1f1a',
            surface: '#143d2e'
        },
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        preview: ['#10b981', '#059669', '#34d399']
    },
    {
        id: 'rose',
        name: 'Rose Garden',
        description: 'Soft pink and magenta',
        colors: {
            primary: '#ec4899',
            secondary: '#db2777',
            accent: '#f472b6',
            background: '#1f0a14',
            surface: '#3d1429'
        },
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        preview: ['#ec4899', '#db2777', '#f472b6']
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        description: 'Electric cyan and magenta',
        colors: {
            primary: '#06b6d4',
            secondary: '#d946ef',
            accent: '#22d3ee',
            background: '#0a0a14',
            surface: '#1a1a2e'
        },
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #d946ef 100%)',
        preview: ['#06b6d4', '#d946ef', '#22d3ee']
    },
    {
        id: 'midnight',
        name: 'Midnight Blue',
        description: 'Deep midnight tones',
        colors: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            accent: '#818cf8',
            background: '#0f0a1f',
            surface: '#1e1533'
        },
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        preview: ['#6366f1', '#4f46e5', '#818cf8']
    }
];

const SettingRow: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/10">
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-white/60">{description}</p>
        </div>
        <div>{children}</div>
    </div>
);

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ appearance, onAppearanceChange }) => {
    const [selectedTheme, setSelectedTheme] = useState(appearance.colorTheme || 'default');
    const accentColors = ['#34D399', '#60A5FA', '#F87171', '#FBBF24', '#A78BFA'];

    const handleThemeSelect = (themeId: string) => {
        setSelectedTheme(themeId);
        onAppearanceChange('colorTheme', themeId);

        // Apply theme colors to CSS variables
        const theme = colorThemes.find(t => t.id === themeId);
        if (theme) {
            document.documentElement.style.setProperty('--primary', theme.colors.primary);
            document.documentElement.style.setProperty('--secondary', theme.colors.secondary);
            document.documentElement.style.setProperty('--emerald', theme.colors.accent);
            document.documentElement.style.setProperty('--dark', theme.colors.background);
            document.documentElement.style.setProperty('--glass', theme.colors.surface + 'b3');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                    <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Appearance</h2>
                    <p className="text-sm text-white/60 mt-1">Customize your visual experience</p>
                </div>
            </motion.div>

            {/* Theme Mode Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Display Mode</h3>
                </div>
                <p className="text-sm text-white/60 mb-4">Choose between light, dark, or automatic theme</p>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Monitor }
                    ].map((mode) => {
                        const Icon = mode.icon;
                        return (
                            <motion.button
                                key={mode.value}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAppearanceChange('theme', mode.value)}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${appearance.theme === mode.value
                                        ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-400/20'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                                style={{
                                    transform: appearance.theme === mode.value ? 'translateZ(10px)' : 'translateZ(0px)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <Icon className={`w-6 h-6 mx-auto mb-2 ${appearance.theme === mode.value ? 'text-emerald-400' : 'text-white/60'
                                    }`} />
                                <p className={`text-sm font-semibold ${appearance.theme === mode.value ? 'text-white' : 'text-white/60'
                                    }`}>
                                    {mode.label}
                                </p>
                                {appearance.theme === mode.value && (
                                    <motion.div
                                        layoutId="activeMode"
                                        className="absolute top-2 right-2 bg-emerald-400 rounded-full p-1"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Check className="w-3 h-3 text-black" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Color Themes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Color Themes</h3>
                </div>
                <p className="text-sm text-white/60 mb-6">Select a color theme that matches your style</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colorThemes.map((theme, index) => (
                        <motion.button
                            key={theme.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleThemeSelect(theme.id)}
                            className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${selectedTheme === theme.id
                                    ? 'border-white/30 bg-white/10 shadow-xl'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                            style={{
                                background: selectedTheme === theme.id
                                    ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.secondary}15 100%)`
                                    : undefined,
                                transform: selectedTheme === theme.id ? 'translateZ(10px)' : 'translateZ(0px)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* Theme Preview Gradient */}
                            <div
                                className="absolute top-0 left-0 w-full h-1 opacity-80"
                                style={{ background: theme.gradient }}
                            />

                            {/* Selected Indicator */}
                            {selectedTheme === theme.id && (
                                <motion.div
                                    layoutId="selectedTheme"
                                    className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-lg"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <Check className="w-4 h-4 text-gray-900" />
                                </motion.div>
                            )}

                            {/* Theme Content */}
                            <div className="relative z-10 mt-3">
                                <h4 className="text-lg font-bold text-white mb-1">{theme.name}</h4>
                                <p className="text-xs text-white/60 mb-4">{theme.description}</p>

                                {/* Color Preview Dots */}
                                <div className="flex items-center gap-2">
                                    {theme.preview.map((color, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.2 }}
                                            className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: `0 4px 12px ${color}40`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary}10 0%, transparent 70%)`
                                }}
                            />
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Accent Colors */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
            >
                <SettingRow title="Accent Color" description="Fine-tune your accent color preference">
                    <div className="flex items-center gap-3">
                        {accentColors.map(color => (
                            <motion.button
                                key={color}
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onAppearanceChange('accentColor', color)}
                                className={`relative w-10 h-10 rounded-2xl transition-all duration-300 ${appearance.accentColor === color
                                        ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white shadow-xl'
                                        : 'hover:shadow-lg'
                                    }`}
                                style={{
                                    backgroundColor: color,
                                    boxShadow: appearance.accentColor === color ? `0 8px 20px ${color}60` : `0 4px 12px ${color}40`,
                                    transform: appearance.accentColor === color ? 'translateZ(10px)' : 'translateZ(0px)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {appearance.accentColor === color && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </SettingRow>
            </motion.div>

            {/* Additional Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
            >
                <SettingRow title="Reduced Motion" description="Disable animations for a simpler experience">
                    <ToggleSwitch
                        label=""
                        checked={appearance.reducedMotion}
                        onChange={(checked: boolean) => onAppearanceChange('reducedMotion', checked)}
                    />
                </SettingRow>
            </motion.div>
        </div>
    );
}; 
import React from 'react';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Button } from '../common/Button';

interface Appearance {
    theme: 'light' | 'dark' | 'auto' | 'sunset' | 'oceanic';
    accentColor: string;
    backgroundAnimation: string;
    reducedMotion: boolean;
    compactMode: boolean;
    fontSize: string;
    highContrast: boolean;
}

interface AppearanceSettingsProps {
    appearance: Appearance;
    onAppearanceChange: (key: keyof Appearance, value: any) => void;
}

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
    const accentColors = ['#34D399', '#60A5FA', '#F87171', '#FBBF24', '#A78BFA'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Appearance</h2>

            <SettingRow title="Theme" description="Choose a light or dark theme, or sync with your system.">
                 <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                    <Button
                        variant={appearance.theme === 'light' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onAppearanceChange('theme', 'light')}
                    >
                        Light
                    </Button>
                    <Button
                        variant={appearance.theme === 'dark' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onAppearanceChange('theme', 'dark')}
                    >
                        Dark
                    </Button>
                     <Button
                        variant={appearance.theme === 'auto' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onAppearanceChange('theme', 'auto')}
                    >
                        Auto
                    </Button>
                    <Button
                        variant={appearance.theme === 'sunset' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onAppearanceChange('theme', 'sunset')}
                    >
                        Sunset
                    </Button>
                    <Button
                        variant={appearance.theme === 'oceanic' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onAppearanceChange('theme', 'oceanic')}
                    >
                        Oceanic
                    </Button>
                </div>
            </SettingRow>

            <SettingRow title="Accent Color" description="Select your preferred accent color.">
                <div className="flex items-center space-x-2">
                    {accentColors.map(color => (
                        <button
                            key={color}
                            onClick={() => onAppearanceChange('accentColor', color)}
                            className={`w-8 h-8 rounded-full transition-all ${appearance.accentColor === color ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </SettingRow>
            
            <SettingRow title="Reduced Motion" description="Disable animations for a simpler experience.">
                <ToggleSwitch
                    checked={appearance.reducedMotion}
                    onCheckedChange={(checked: boolean) => onAppearanceChange('reducedMotion', checked)}
                />
            </SettingRow>

        </div>
    );
}; 
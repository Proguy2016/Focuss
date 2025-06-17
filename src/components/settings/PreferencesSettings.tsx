import React from 'react';
import { ToggleSwitch } from '../common/ToggleSwitch';

interface PreferencesSettingsProps {
    preferences: {
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        sessionsUntilLongBreak: number;
        autoStartBreaks: boolean;
        autoStartWork: boolean;
        soundEnabled: boolean;
        ambientVolume: number;
        focusMusic: string;
        weekStartsOn: string;
        timeFormat: string;
        dateFormat: string;
    };
    onPreferenceChange: (key: string, value: any) => void;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
    preferences,
    onPreferenceChange,
}) => {
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            onPreferenceChange(key, value);
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, key: string) => {
        onPreferenceChange(key, e.target.value);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Timer Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Work Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={preferences.workDuration}
                            onChange={(e) => handleNumberChange(e, 'workDuration')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Short Break Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={preferences.shortBreakDuration}
                            onChange={(e) => handleNumberChange(e, 'shortBreakDuration')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Long Break Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="60"
                            value={preferences.longBreakDuration}
                            onChange={(e) => handleNumberChange(e, 'longBreakDuration')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Sessions Until Long Break
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={preferences.sessionsUntilLongBreak}
                            onChange={(e) => handleNumberChange(e, 'sessionsUntilLongBreak')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <ToggleSwitch
                        label="Auto-start Breaks"
                        checked={preferences.autoStartBreaks}
                        onChange={(checked) => onPreferenceChange('autoStartBreaks', checked)}
                    />
                    <ToggleSwitch
                        label="Auto-start Work Sessions"
                        checked={preferences.autoStartWork}
                        onChange={(checked) => onPreferenceChange('autoStartWork', checked)}
                    />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Sound Settings</h2>
                <ToggleSwitch
                    label="Enable Sounds"
                    checked={preferences.soundEnabled}
                    onChange={(checked) => onPreferenceChange('soundEnabled', checked)}
                />

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ambient Volume
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={preferences.ambientVolume}
                        onChange={(e) => handleNumberChange(e, 'ambientVolume')}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Focus Music
                    </label>
                    <select
                        value={preferences.focusMusic}
                        onChange={(e) => handleSelectChange(e, 'focusMusic')}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="nature">Nature Sounds</option>
                        <option value="lofi">Lo-Fi Beats</option>
                        <option value="ambient">Ambient</option>
                        <option value="white-noise">White Noise</option>
                        <option value="none">None</option>
                    </select>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Format Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Week Starts On
                        </label>
                        <select
                            value={preferences.weekStartsOn}
                            onChange={(e) => handleSelectChange(e, 'weekStartsOn')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="monday">Monday</option>
                            <option value="sunday">Sunday</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Time Format
                        </label>
                        <select
                            value={preferences.timeFormat}
                            onChange={(e) => handleSelectChange(e, 'timeFormat')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="12h">12-hour (AM/PM)</option>
                            <option value="24h">24-hour</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date Format
                        </label>
                        <select
                            value={preferences.dateFormat}
                            onChange={(e) => handleSelectChange(e, 'dateFormat')}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}; 
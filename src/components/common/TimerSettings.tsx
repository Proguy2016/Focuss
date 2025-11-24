import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

interface TimerSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: TimerSettingsData) => void;
    initialSettings: TimerSettingsData;
}

export interface TimerSettingsData {
    workDuration: number;
    shortBreak: number;
    longBreak: number;
    sessionsUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
}

export const TimerSettings: React.FC<TimerSettingsProps> = ({
    isOpen,
    onClose,
    onSave,
    initialSettings
}) => {
    const [settings, setSettings] = React.useState(initialSettings);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-hidden
                    bg-gradient-to-b from-dark to-darker border border-primary-dark
                    rounded-2xl shadow-2xl"
                style={{ opacity: 1, transform: 'none' }}
            >
                <div className="flex items-center justify-between p-6 border-b border-primary-dark">
                    <h2 className="text-xl font-semibold text-white">Timer Settings</h2>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                            text-white hover:bg-white/10 px-3 py-2 text-sm ml-auto"
                        onClick={onClose}
                        tabIndex={0}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] scrollbar-hide">
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-6">Timer Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">
                                    Work Duration (minutes)
                                </label>
                                <input
                                    aria-label="Work Duration (minutes)"
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={settings.workDuration}
                                    onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">
                                    Short Break (minutes)
                                </label>
                                <input
                                    aria-label="Short Break (minutes)"
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={settings.shortBreak}
                                    onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">
                                    Long Break (minutes)
                                </label>
                                <input
                                    aria-label="Long Break (minutes)"
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={settings.longBreak}
                                    onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">
                                    Sessions until Long Break
                                </label>
                                <input
                                    aria-label="Sessions until Long Break"
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={settings.sessionsUntilLongBreak}
                                    onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <label className="text-white/80">Auto-start Breaks</label>
                                <input
                                    type="checkbox"
                                    className="toggle-switch"
                                    checked={settings.autoStartBreaks}
                                    onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-white/80">Auto-start Work</label>
                                <input
                                    type="checkbox"
                                    className="toggle-switch"
                                    checked={settings.autoStartWork}
                                    onChange={(e) => setSettings({ ...settings, autoStartWork: e.target.checked })}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                                    glass text-white hover:bg-white/20 px-6 py-3 text-base"
                                onClick={onClose}
                                tabIndex={0}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
                                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                                    bg-gradient-to-r from-primary-500 via-emerald to-secondary-500 text-white shadow-lg
                                    hover:from-primary-400 hover:to-emerald focus:ring-2 focus:ring-primary-400 px-6 py-3 text-base"
                                onClick={() => onSave(settings)}
                                tabIndex={0}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

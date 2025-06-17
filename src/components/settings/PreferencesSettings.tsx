import React from 'react';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Slider } from '../common/Slider';

interface Preferences {
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
}

interface PreferencesSettingsProps {
    preferences: Preferences;
    onPreferenceChange: (key: keyof Preferences, value: any) => void;
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

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ preferences, onPreferenceChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Preferences</h2>
            
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Focus Timer Settings</h3>
                
                <SettingRow title="Work Duration" description="Length of a focus session in minutes.">
                    <Slider
                        defaultValue={[preferences.workDuration]}
                        max={60}
                        step={5}
                        onValueChange={(value: number[]) => onPreferenceChange('workDuration', value[0])}
                        className="w-48"
                    />
                </SettingRow>
                
                <SettingRow title="Short Break Duration" description="Length of short breaks in minutes.">
                    <Slider
                        defaultValue={[preferences.shortBreakDuration]}
                        max={20}
                        step={1}
                        onValueChange={(value: number[]) => onPreferenceChange('shortBreakDuration', value[0])}
                        className="w-48"
                    />
                </SettingRow>
                
                <SettingRow title="Long Break Duration" description="Length of long breaks in minutes.">
                    <Slider
                        defaultValue={[preferences.longBreakDuration]}
                        max={30}
                        step={5}
                        onValueChange={(value: number[]) => onPreferenceChange('longBreakDuration', value[0])}
                        className="w-48"
                    />
                </SettingRow>
                
                <SettingRow title="Sessions Until Long Break" description="Number of focus sessions before a long break.">
                    <Slider
                        defaultValue={[preferences.sessionsUntilLongBreak]}
                        min={1}
                        max={8}
                        step={1}
                        onValueChange={(value: number[]) => onPreferenceChange('sessionsUntilLongBreak', value[0])}
                        className="w-48"
                    />
                </SettingRow>
                
                <SettingRow title="Auto-start Breaks" description="Automatically start breaks after a focus session.">
                    <ToggleSwitch
                        checked={preferences.autoStartBreaks}
                        onCheckedChange={(checked: boolean) => onPreferenceChange('autoStartBreaks', checked)}
                    />
                </SettingRow>
                
                <SettingRow title="Auto-start Work" description="Automatically start work sessions after breaks.">
                    <ToggleSwitch
                        checked={preferences.autoStartWork}
                        onCheckedChange={(checked: boolean) => onPreferenceChange('autoStartWork', checked)}
                    />
                </SettingRow>
                
                <SettingRow title="Sound Enabled" description="Play sounds when sessions end.">
                    <ToggleSwitch
                        checked={preferences.soundEnabled}
                        onCheckedChange={(checked: boolean) => onPreferenceChange('soundEnabled', checked)}
                    />
                </SettingRow>
            </div>
            
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Sound Settings</h3>
                
                <SettingRow title="Ambient Volume" description="Set the volume for background sounds.">
                    <Slider
                        defaultValue={[preferences.ambientVolume]}
                        max={100}
                        step={1}
                        onValueChange={(value: number[]) => onPreferenceChange('ambientVolume', value[0])}
                        className="w-48"
                    />
                </SettingRow>
                
                <SettingRow title="Focus Music" description="Choose your default focus music.">
                    <select
                        value={preferences.focusMusic}
                        onChange={(e) => onPreferenceChange('focusMusic', e.target.value)}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white border border-white/20"
                    >
                        <option value="nature">Nature Sounds</option>
                        <option value="cafe">Cafe Ambience</option>
                        <option value="rain">Rain</option>
                        <option value="lofi">Lo-Fi Beats</option>
                        <option value="white-noise">White Noise</option>
                    </select>
                </SettingRow>
            </div>
            
            <div>
                <h3 className="text-xl font-semibold text-white mb-4">Display Settings</h3>
                
                <SettingRow title="Week Starts On" description="First day of the week in calendars.">
                    <select
                        value={preferences.weekStartsOn}
                        onChange={(e) => onPreferenceChange('weekStartsOn', e.target.value)}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white border border-white/20"
                    >
                        <option value="monday">Monday</option>
                        <option value="sunday">Sunday</option>
                    </select>
                </SettingRow>
                
                <SettingRow title="Time Format" description="12-hour or 24-hour time format.">
                    <select
                        value={preferences.timeFormat}
                        onChange={(e) => onPreferenceChange('timeFormat', e.target.value)}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white border border-white/20"
                    >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                    </select>
                </SettingRow>
                
                <SettingRow title="Date Format" description="How dates are displayed.">
                    <select
                        value={preferences.dateFormat}
                        onChange={(e) => onPreferenceChange('dateFormat', e.target.value)}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white border border-white/20"
                    >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </SettingRow>
            </div>
        </div>
    );
}; 
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, User, Bell, Palette, Shield,
    Download, Upload, Trash2, Save, Eye, EyeOff,
    Smartphone, Monitor, Volume2, Moon, Sun, Zap,
    Globe, Lock, Key, Database, HelpCircle, Loader
} from 'lucide-react';
import axios from 'axios';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useLocation } from 'react-router-dom';

type SettingsTab = 'profile' | 'preferences' | 'notifications' | 'appearance' | 'privacy' | 'data' | 'about';

// Types for component props
interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    timezone: string;
    language: string;
    avatar?: string | null;
}

interface ProfileSettingsProps {
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
    handleSaveProfile: () => void;
    setShowPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
}

const LOCAL_STORAGE_KEY = 'focus-ritual-profile';

// Utility function to get browser timezone
const getBrowserTimezone = (): string => {
    try {
        // Get timezone offset in minutes
        const offset = new Date().getTimezoneOffset();
        // Convert to hours (UTC+ or UTC-)
        const offsetHours = Math.abs(Math.floor(offset / 60));
        const sign = offset < 0 ? '+' : '-';
        return `UTC${sign}${offsetHours}`;
    } catch (error) {
        console.error('Error detecting timezone:', error);
        return 'UTC+0';
    }
};

// Utility function to get browser language
const getBrowserLanguage = (): string => {
    try {
        const fullLocale = navigator.language || 'en';
        return fullLocale.split('-')[0]; // Extract the language code (e.g., 'en' from 'en-US')
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en';
    }
};

// Helper function to adapt between API user format and AppContext user format
const adaptUserData = (userData: any, existingUser: any = null) => {
    // Create a new object with all existing user properties
    const adaptedUser = { ...existingUser };
    
    // Set name property using firstName and lastName
    if (userData.firstName || userData.lastName) {
        adaptedUser.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    
    // Copy common properties
    if (userData.email) adaptedUser.email = userData.email;
    if (userData.avatar) adaptedUser.avatar = userData.avatar;
    
    return adaptedUser;
};

const getInitialProfileData = (stateUser: any): ProfileData => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Basic check for backward compatibility
            if (parsed.name && !parsed.firstName) {
                const [firstName, ...lastName] = parsed.name.split(' ');
                return {
                    ...parsed,
                    firstName: firstName || '',
                    lastName: lastName.join(' ') || '',
                };
            }
            return parsed;
        } catch {
            // fallback to defaults
        }
    }

    // If we have a user in state but it uses the 'name' format instead of firstName/lastName
    let firstName = '';
    let lastName = '';
    
    if (stateUser) {
        if (stateUser.firstName) {
            firstName = stateUser.firstName;
            lastName = stateUser.lastName || '';
        } else if (stateUser.name) {
            const nameParts = stateUser.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
    }

    return {
        firstName: firstName || '',
        lastName: lastName || '',
        email: stateUser?.email || 'focus@ritual.com',
        bio: '',
        timezone: getBrowserTimezone(),
        language: getBrowserLanguage(),
        avatar: stateUser?.avatar || '',
    };
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profileData, setProfileData, handleSaveProfile, setShowPasswordModal, isLoading }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setProfileData(prev => ({ ...prev, avatar: (ev.target?.result as string) || '' }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemoveAvatar = () => {
        setProfileData(prev => ({ ...prev, avatar: '' }));
    };
    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-60">
                    <Loader className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                    <p className="text-white/70">Loading your profile information...</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border-2 border-border shadow-md bg-transparent">
                            {profileData.avatar ? (
                                <img
                                    src={profileData.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <AvatarFallback className="text-3xl">
                                    {profileData.firstName?.trim().charAt(0).toUpperCase()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex flex-row gap-2 items-center">
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Change Avatar</Button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <Button variant="danger" size="sm" onClick={handleRemoveAvatar}>Remove</Button>
                        </div>
                    </div>
                    <p className="text-white/60 text-sm mt-2">JPG, PNG or GIF. Max size 2MB.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/60 text-sm mb-2">First Name</label>
                            <input
                                type="text"
                                value={profileData.firstName}
                                onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                                style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                            />
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Last Name</label>
                            <input
                                type="text"
                                value={profileData.lastName}
                                onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                                style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                                style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">Bio</label>
                        <textarea
                            value={profileData.bio}
                            onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            className="w-full h-20 resize-none rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-2"
                            style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Timezone (Auto-detected)</label>
                            <div className="relative w-full">
                                <select
                                    value={profileData.timezone}
                                    onChange={e => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                                    className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                                    style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                                >
                                    <option value="UTC-12">International Date Line West (UTC-12)</option>
                                    <option value="UTC-11">Samoa Standard Time (UTC-11)</option>
                                    <option value="UTC-10">Hawaii Standard Time (UTC-10)</option>
                                    <option value="UTC-9">Alaska Standard Time (UTC-9)</option>
                                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                                    <option value="UTC-6">Central Time (UTC-6)</option>
                                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                                    <option value="UTC-4">Atlantic Time (UTC-4)</option>
                                    <option value="UTC-3">Brasilia Time (UTC-3)</option>
                                    <option value="UTC-2">Mid-Atlantic (UTC-2)</option>
                                    <option value="UTC-1">Azores Time (UTC-1)</option>
                                    <option value="UTC+0">UTC</option>
                                    <option value="UTC+1">Central European Time (UTC+1)</option>
                                    <option value="UTC+2">Eastern European Time (UTC+2)</option>
                                    <option value="UTC+3">Moscow Time (UTC+3)</option>
                                    <option value="UTC+4">Dubai Time (UTC+4)</option>
                                    <option value="UTC+5">Pakistan Time (UTC+5)</option>
                                    <option value="UTC+6">Bangladesh Time (UTC+6)</option>
                                    <option value="UTC+7">Indonesia Time (UTC+7)</option>
                                    <option value="UTC+8">China Time (UTC+8)</option>
                                    <option value="UTC+9">Japan Time (UTC+9)</option>
                                    <option value="UTC+10">Australia Eastern Time (UTC+10)</option>
                                    <option value="UTC+11">Solomon Islands Time (UTC+11)</option>
                                    <option value="UTC+12">New Zealand Time (UTC+12)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Language (Auto-detected)</label>
                            <div className="relative w-full">
                                <select
                                    value={profileData.language}
                                    onChange={e => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                                    style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="zh">Chinese</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="ar">Arabic</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="primary" onClick={handleSaveProfile}>
                            Save Changes
                        </Button>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
                            Change Password
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

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
    setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ preferences, setPreferences }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Focus Timer</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-white/60 text-sm mb-2">Work Duration (min)</label>
                    <input
                        type="number"
                        value={preferences.workDuration}
                        onChange={e => setPreferences(prev => ({ ...prev, workDuration: parseInt(e.target.value) }))}
                        className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                        min="1"
                        max="120"
                        style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                    />
                </div>
                <div>
                    <label className="block text-white/60 text-sm mb-2">Short Break (min)</label>
                    <input
                        type="number"
                        value={preferences.shortBreakDuration}
                        onChange={e => setPreferences(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) }))}
                        className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                        min="1"
                        max="30"
                        style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                    />
                </div>
                <div>
                    <label className="block text-white/60 text-sm mb-2">Long Break (min)</label>
                    <input
                        type="number"
                        value={preferences.longBreakDuration}
                        onChange={e => setPreferences(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                        className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                        min="1"
                        max="60"
                        style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                    />
                </div>
                <div>
                    <label className="block text-white/60 text-sm mb-2">Sessions Until Long Break</label>
                    <input
                        type="number"
                        value={preferences.sessionsUntilLongBreak}
                        onChange={e => setPreferences(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) }))}
                        className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                        min="2"
                        max="10"
                        style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                    />
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Auto-start</h3>
            <div className="space-y-3">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences.autoStartBreaks}
                        onChange={(e) => setPreferences(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                        className="w-4 h-4"
                    />
                    <span className="text-white/80">Auto-start breaks</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences.autoStartWork}
                        onChange={(e) => setPreferences(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                        className="w-4 h-4"
                    />
                    <span className="text-white/80">Auto-start work sessions</span>
                </label>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Audio</h3>
            <div className="space-y-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences.soundEnabled}
                        onChange={(e) => setPreferences(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                        className="w-4 h-4"
                    />
                    <span className="text-white/80">Enable sounds</span>
                </label>

                <div>
                    <label className="block text-white/60 text-sm mb-2">
                        Ambient Volume: {preferences.ambientVolume}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={preferences.ambientVolume}
                        onChange={(e) => setPreferences(prev => ({ ...prev, ambientVolume: parseInt(e.target.value) }))}
                        className="w-full"
                        style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                    />
                </div>

                <div>
                    <label className="block text-white/60 text-sm mb-2">Default Focus Music</label>
                    <div className="relative w-full">
                        <select
                            value={preferences.focusMusic}
                            onChange={(e) => setPreferences(prev => ({ ...prev, focusMusic: e.target.value }))}
                            className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                            style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                        >
                            <option value="nature">Nature Sounds</option>
                            <option value="rain">Rain</option>
                            <option value="ocean">Ocean Waves</option>
                            <option value="coffee">Coffee Shop</option>
                            <option value="silence">Silence</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-white/60 text-sm mb-2">Week Starts On</label>
                    <div className="relative w-full">
                        <select
                            value={preferences.weekStartsOn}
                            onChange={(e) => setPreferences(prev => ({ ...prev, weekStartsOn: e.target.value }))}
                            className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                            style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                        >
                            <option value="sunday">Sunday</option>
                            <option value="monday">Monday</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-white/60 text-sm mb-2">Time Format</label>
                    <div className="relative w-full">
                        <select
                            value={preferences.timeFormat}
                            onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value }))}
                            className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                            style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                        >
                            <option value="12h">12 Hour</option>
                            <option value="24h">24 Hour</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-white/60 text-sm mb-2">Date Format</label>
                    <div className="relative w-full">
                        <select
                            value={preferences.dateFormat}
                            onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                            className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                            style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                        >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

interface Notifications {
    pushEnabled: boolean;
    emailEnabled: boolean;
    sessionReminders: boolean;
    habitReminders: boolean;
    goalDeadlines: boolean;
    weeklyReports: boolean;
    achievementUnlocks: boolean;
    socialUpdates: boolean;
    marketingEmails: boolean;
    reminderSound: string;
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
}

interface NotificationSettingsProps {
    notifications: Notifications;
    setNotifications: React.Dispatch<React.SetStateAction<Notifications>>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notifications, setNotifications }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">General</h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Push notifications</span>
                    <input
                        type="checkbox"
                        checked={notifications.pushEnabled}
                        onChange={(e) => setNotifications(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Email notifications</span>
                    <input
                        type="checkbox"
                        checked={notifications.emailEnabled}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Reminders</h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Focus session reminders</span>
                    <input
                        type="checkbox"
                        checked={notifications.sessionReminders}
                        onChange={(e) => setNotifications(prev => ({ ...prev, sessionReminders: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Habit reminders</span>
                    <input
                        type="checkbox"
                        checked={notifications.habitReminders}
                        onChange={(e) => setNotifications(prev => ({ ...prev, habitReminders: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Goal deadlines</span>
                    <input
                        type="checkbox"
                        checked={notifications.goalDeadlines}
                        onChange={(e) => setNotifications(prev => ({ ...prev, goalDeadlines: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Updates</h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Weekly progress reports</span>
                    <input
                        type="checkbox"
                        checked={notifications.weeklyReports}
                        onChange={(e) => setNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Achievement unlocks</span>
                    <input
                        type="checkbox"
                        checked={notifications.achievementUnlocks}
                        onChange={(e) => setNotifications(prev => ({ ...prev, achievementUnlocks: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Social updates</span>
                    <input
                        type="checkbox"
                        checked={notifications.socialUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, socialUpdates: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Marketing emails</span>
                    <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) => setNotifications(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quiet Hours</h3>
            <div className="space-y-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={notifications.quietHours.enabled}
                        onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, enabled: e.target.checked }
                        }))}
                        className="w-4 h-4"
                    />
                    <span className="text-white/80">Enable quiet hours</span>
                </label>

                {notifications.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Start Time</label>
                            <input
                                type="time"
                                value={notifications.quietHours.start}
                                onChange={(e) => setNotifications(prev => ({
                                    ...prev,
                                    quietHours: { ...prev.quietHours, start: e.target.value }
                                }))}
                                className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                                style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                            />
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm mb-2">End Time</label>
                            <input
                                type="time"
                                value={notifications.quietHours.end}
                                onChange={(e) => setNotifications(prev => ({
                                    ...prev,
                                    quietHours: { ...prev.quietHours, end: e.target.value }
                                }))}
                                className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                                style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

interface Appearance {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    backgroundAnimation: string;
    reducedMotion: boolean;
    compactMode: boolean;
    fontSize: string;
    highContrast: boolean;
}

interface AppearanceSettingsProps {
    appearance: Appearance;
    setAppearance: React.Dispatch<React.SetStateAction<Appearance>>;
    dispatch: React.Dispatch<any>;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ appearance, setAppearance, dispatch }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'auto'].map(theme => (
                    <button
                        key={theme}
                        onClick={() => {
                            setAppearance(prev => ({ ...prev, theme: theme as any }));
                            dispatch({ type: 'SET_THEME', payload: theme as any });
                        }}
                        className={`p-4 rounded-lg border-2 transition-colors capitalize ${appearance.theme === theme
                            ? 'border-primary-500 bg-primary-500/20'
                            : 'border-white/20 hover:border-white/40'
                            }`}
                    >
                        {theme === 'light' && <Sun className="w-6 h-6 mx-auto mb-2" />}
                        {theme === 'dark' && <Moon className="w-6 h-6 mx-auto mb-2" />}
                        {theme === 'auto' && <Monitor className="w-6 h-6 mx-auto mb-2" />}
                        <div className="text-white text-sm">{theme}</div>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
            <div className="grid grid-cols-6 gap-3">
                {[
                    { name: 'purple', color: '#8B5CF6' },
                    { name: 'blue', color: '#3B82F6' },
                    { name: 'green', color: '#10B981' },
                    { name: 'yellow', color: '#F59E0B' },
                    { name: 'red', color: '#EF4444' },
                    { name: 'pink', color: '#EC4899' },
                ].map(color => (
                    <button
                        key={color.name}
                        onClick={() => setAppearance(prev => ({ ...prev, accentColor: color.name }))}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${appearance.accentColor === color.name
                            ? 'border-white scale-110'
                            : 'border-white/20 hover:border-white/40'
                            }`}
                        style={{ backgroundColor: color.color }}
                    />
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Background Animation</h3>
            <div className="relative w-full">
                <select
                    value={appearance.backgroundAnimation}
                    onChange={(e) => setAppearance(prev => ({ ...prev, backgroundAnimation: e.target.value }))}
                    className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                    style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                >
                    <option value="particles">Particles</option>
                    <option value="waves">Waves</option>
                    <option value="gradient">Gradient</option>
                    <option value="none">None</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Accessibility</h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Reduced motion</span>
                    <input
                        type="checkbox"
                        checked={appearance.reducedMotion}
                        onChange={(e) => setAppearance(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">High contrast</span>
                    <input
                        type="checkbox"
                        checked={appearance.highContrast}
                        onChange={(e) => setAppearance(prev => ({ ...prev, highContrast: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Compact mode</span>
                    <input
                        type="checkbox"
                        checked={appearance.compactMode}
                        onChange={(e) => setAppearance(prev => ({ ...prev, compactMode: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Font Size</h3>
            <div className="relative w-full">
                <select
                    value={appearance.fontSize}
                    onChange={(e) => setAppearance(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                    style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
);

interface Privacy {
    profileVisibility: string;
    activityVisibility: string;
    allowFriendRequests: boolean;
    showOnlineStatus: boolean;
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
}

interface PrivacySettingsProps {
    privacy: Privacy;
    setPrivacy: React.Dispatch<React.SetStateAction<Privacy>>;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ privacy, setPrivacy }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Profile Visibility</h3>
            <div className="relative w-full">
                <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                    style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Activity Visibility</h3>
            <div className="relative w-full">
                <select
                    value={privacy.activityVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, activityVisibility: e.target.value }))}
                    className="w-full h-9 rounded-md border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1 pr-8 appearance-none"
                    style={{ background: 'linear-gradient(180deg, var(--dark), var(--slate-dark))' }}
                >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Social Features</h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Allow friend requests</span>
                    <input
                        type="checkbox"
                        checked={privacy.allowFriendRequests}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, allowFriendRequests: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <span className="text-white/80">Show online status</span>
                    <input
                        type="checkbox"
                        checked={privacy.showOnlineStatus}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Data Collection</h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between">
                    <div>
                        <span className="text-white/80">Usage analytics</span>
                        <p className="text-white/60 text-sm">Help improve the app with anonymous usage data</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={privacy.analytics}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between">
                    <div>
                        <span className="text-white/80">Crash reports</span>
                        <p className="text-white/60 text-sm">Automatically send crash reports to help fix bugs</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={privacy.crashReports}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, crashReports: e.target.checked }))}
                        className="w-4 h-4"
                    />
                </label>
            </div>
        </div>
    </div>
);

interface DataSettingsProps {
    setShowExportModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataSettings: React.FC<DataSettingsProps> = ({ setShowExportModal, setShowDeleteModal }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
            <p className="text-white/60 mb-4">
                Download a copy of all your data including focus sessions, habits, tasks, and notes.
            </p>
            <Button
                variant="secondary"
                icon={Download}
                onClick={() => setShowExportModal(true)}
            >
                Export All Data
            </Button>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Import Data</h3>
            <p className="text-white/60 mb-4">
                Import data from a previous export or another productivity app.
            </p>
            <Button variant="secondary" icon={Upload}>
                Import Data
            </Button>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Storage Usage</h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-white/80">Focus sessions</span>
                    <span className="text-white/60">2.3 MB</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/80">Notes & documents</span>
                    <span className="text-white/60">1.8 MB</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/80">Audio files</span>
                    <span className="text-white/60">15.2 MB</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white">19.3 MB</span>
                </div>
            </div>
        </div>

        <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-error-400 mb-4">Danger Zone</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-white mb-2">Clear All Data</h4>
                    <p className="text-white/60 text-sm mb-3">
                        Permanently delete all your data. This action cannot be undone.
                    </p>
                    <Button variant="danger" size="sm">
                        Clear All Data
                    </Button>
                </div>

                <div>
                    <h4 className="font-medium text-white mb-2">Delete Account</h4>
                    <p className="text-white/60 text-sm mb-3">
                        Permanently delete your account and all associated data.
                    </p>
                    <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Delete Account
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

const AboutSettings = () => (
    <div className="space-y-6">
        <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Focus Ritual</h2>
            <p className="text-white/60">Version 1.0.0</p>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between">
                <span className="text-white/80">Last Updated</span>
                <span className="text-white/60">February 10, 2024</span>
            </div>
            <div className="flex justify-between">
                <span className="text-white/80">Build</span>
                <span className="text-white/60">2024.02.10.1</span>
            </div>
            <div className="flex justify-between">
                <span className="text-white/80">Platform</span>
                <span className="text-white/60">Web</span>
            </div>
        </div>

        <div className="space-y-3">
            <Button variant="secondary" fullWidth>

                Check for Updates
            </Button>
            <Button variant="ghost" fullWidth>
                Release Notes
            </Button>
            <Button variant="ghost" fullWidth>
                Privacy Policy
            </Button>
            <Button variant="ghost" fullWidth>
                Terms of Service
            </Button>
            <Button variant="ghost" fullWidth>
                Contact Support
            </Button>
        </div>

        <div className="text-center text-white/60 text-sm">
            <p>Made with ❤️ for productivity enthusiasts</p>
            <p className="mt-2">©️ 2024 Focus Ritual. All rights reserved.</p>
        </div>
    </div>
);

export const Settings: React.FC = () => {
    const { state, dispatch } = useApp();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profileData, setProfileData] = useState<ProfileData>(() => getInitialProfileData(state.user));

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['profile', 'preferences', 'notifications', 'appearance', 'privacy', 'data', 'about'].includes(tab)) {
            setActiveTab(tab as SettingsTab);
        }
    }, [location.search]);

    useEffect(() => {
        // Fetch user data from backend API when the component mounts
        fetchUserData();
        // eslint-disable-next-line
    }, []);

    const LOCAL_STORAGE_PREFS_KEY = 'focus-ritual-preferences';
    const getInitialPreferences = () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_PREFS_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // fallback to defaults
            }
        }
        return {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartWork: false,
            soundEnabled: true,
            ambientVolume: 60,
            focusMusic: 'nature',
            weekStartsOn: 'monday',
            timeFormat: '24h',
            dateFormat: 'MM/DD/YYYY',
        };
    };
    const [preferences, setPreferences] = useState<Preferences>(getInitialPreferences);
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_PREFS_KEY, JSON.stringify(preferences));
    }, [preferences]);

    const [notifications, setNotifications] = useState({
        pushEnabled: true,
        emailEnabled: true,
        sessionReminders: true,
        habitReminders: true,
        goalDeadlines: true,
        weeklyReports: true,
        achievementUnlocks: true,
        socialUpdates: false,
        marketingEmails: false,
        reminderSound: 'gentle',
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
        },
    });

    const [appearance, setAppearance] = useState({
        theme: state.theme,
        accentColor: 'purple',
        backgroundAnimation: 'particles',
        reducedMotion: false,
        compactMode: false,
        fontSize: 'medium',
        highContrast: false,
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: 'friends',
        activityVisibility: 'private',
        allowFriendRequests: true,
        showOnlineStatus: true,
        dataCollection: true,
        analytics: true,
        crashReports: true,
    });

    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Updating the endpoint with the correct path
            const response = await axios.get('auth/me', {
                withCredentials: true, // This ensures cookies are sent with the request
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            const userData = response.data;
            
            // Update profile data with fetched user data
            setProfileData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                bio: userData.bio || '',
                // Use browser detected timezone and language if not provided by API
                timezone: userData.timezone || getBrowserTimezone(),
                language: userData.language || getBrowserLanguage(),
                avatar: userData.avatar || null
            });
            
            // Also update the global state if needed
            if (state.user) {
                dispatch({
                    type: 'SET_USER',
                    payload: adaptUserData(userData, state.user)
                });
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user data. Please try again later.');
            
            // Fallback to local storage or state
            setProfileData(getInitialProfileData(state.user));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // We'll make separate API calls for each field that needs updating
            const updatePromises = [];
            
            // Update name (first name and last name)
            updatePromises.push(
                axios.put('update/name', {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                })
            );
            
            // Update bio
            updatePromises.push(
                axios.put('update/bio', {
                    bio: profileData.bio,
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                })
            );
            
            // Update profile picture if it has changed
            if (profileData.avatar) {
                updatePromises.push(
                    axios.put('update/pfp', {
                        avatar: profileData.avatar,
                    }, {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    })
                );
            }
            
            // Wait for all update requests to complete
            await Promise.all(updatePromises);
            
            // Save to localStorage as backup
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profileData));
            
            // Update global state
            if (state.user) {
                dispatch({
                    type: 'SET_USER',
                    payload: adaptUserData({
                        firstName: profileData.firstName,
                        lastName: profileData.lastName,
                        email: profileData.email,
                        avatar: profileData.avatar || '',
                    }, state.user)
                });
            }
            
            // Show success message
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile. Please try again.');
            alert('Error saving profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = () => {
        console.log('Exporting data...');
        // In a real app, this would generate and download user data
        setShowExportModal(false);
    };

    const handleDeleteAccount = () => {
        console.log('Deleting account...');
        // In a real app, this would delete the user account
        setShowDeleteModal(false);
    };

    const handlePreferenceChange = (key: keyof Preferences, value: any) => {
        setPreferences((prevPreferences: any) => {
            const updated = { ...prevPreferences, [key]: value };
            
            // Update user preferences in global state if needed
            if (state.user && state.user.preferences) {
                dispatch({
                    type: 'SET_USER',
                    payload: {
                        ...state.user,
                        preferences: {
                            ...state.user.preferences,
                            [key]: value
                        }
                    }
                });
            }
            
            return updated;
        });
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'data', label: 'Data', icon: Database },
        { id: 'about', label: 'About', icon: HelpCircle },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings
                profileData={profileData}
                setProfileData={setProfileData}
                handleSaveProfile={handleSaveProfile}
                setShowPasswordModal={setShowPasswordModal}
                isLoading={isLoading}
            />;
            case 'preferences': return <PreferencesSettings preferences={preferences} setPreferences={setPreferences} />;
            case 'notifications': return <NotificationSettings notifications={notifications} setNotifications={setNotifications} />;
            case 'appearance': return <AppearanceSettings appearance={appearance} setAppearance={setAppearance} dispatch={dispatch} />;
            case 'privacy': return <PrivacySettings privacy={privacy} setPrivacy={setPrivacy} />;
            case 'data': return <DataSettings setShowExportModal={setShowExportModal} setShowDeleteModal={setShowDeleteModal} />;
            case 'about': return <AboutSettings />;
            default: return <ProfileSettings
                profileData={profileData}
                setProfileData={setProfileData}
                handleSaveProfile={handleSaveProfile}
                setShowPasswordModal={setShowPasswordModal}
                isLoading={isLoading}
            />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">Settings</h1>
                    <p className="text-white/60">
                        Customize your Focus Ritual experience
                    </p>
                </div>
            </motion.div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card variant="glass" className="p-4">
                        <nav className="space-y-1">
                            {tabs.map(tab => {
                                const IconComponent = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors relative ${isActive
                                            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                                            : 'text-white/70 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        <span className="font-medium relative">
                                            {tab.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="settings-underline"
                                                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                                                />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <Card variant="glass" className="p-6">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderTabContent()}
                        </motion.div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-white/80">
                        Are you sure you want to delete your account? This action cannot be undone and will permanently delete:
                    </p>
                    <ul className="list-disc list-inside text-white/70 space-y-1">
                        <li>All your focus sessions and statistics</li>
                        <li>Your habits and progress tracking</li>
                        <li>All tasks and notes</li>
                        <li>Your achievements and badges</li>
                        <li>Your profile and social connections</li>
                    </ul>
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            fullWidth
                        >
                            Yes, Delete My Account
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Export Data"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-white/80">
                        Your data will be exported as a JSON file containing all your information. This may take a few moments.
                    </p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-white/80">Focus sessions and statistics</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-white/80">Habits and progress</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-white/80">Tasks and notes</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-white/80">Achievements and badges</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="primary"
                            onClick={handleExportData}
                            fullWidth
                        >
                            Export Data
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowExportModal(false)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-white/60 text-sm mb-2">Current Password</label>
                        <input
                            type="password"
                            className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className="block text-white/60 text-sm mb-2">New Password</label>
                        <input
                            type="password"
                            className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-white/60 text-sm mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            className="w-full h-9 rounded-md border border-slate-800 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="primary"
                            onClick={() => setShowPasswordModal(false)}
                            fullWidth
                        >
                            Update Password
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowPasswordModal(false)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
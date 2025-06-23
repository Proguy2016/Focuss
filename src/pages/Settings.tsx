import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, User, Bell, Palette, Shield,
} from 'lucide-react';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { PreferencesSettings } from '../components/settings/PreferencesSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { DataSettings } from '../components/settings/DataSettings';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext'; // Import useApp

type SettingsTab = 'profile' | 'preferences' | 'notifications' | 'appearance' | 'data';

const SETTINGS_TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
];

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const { state: appState, dispatch } = useApp(); // Use AppContext
    const LOCAL_STORAGE_PREFS_KEY = `focus-ritual-preferences-${user?.id || 'default'}`;
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    // Preferences and Notifications can remain local to this component or be moved to context if needed elsewhere
    const [preferences, setPreferences] = useState({
        workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, sessionsUntilLongBreak: 4,
        autoStartBreaks: false, autoStartWork: false, soundEnabled: true, ambientVolume: 50,
        focusMusic: 'nature', weekStartsOn: 'monday', timeFormat: '24h', dateFormat: 'MM/DD/YYYY',
    });
    const [notifications, setNotifications] = useState({
        pushEnabled: true, emailEnabled: false, sessionReminders: true, habitReminders: true,
        goalDeadlines: true, weeklyReports: false, achievementUnlocks: true, socialUpdates: false,
        marketingEmails: false, reminderSound: 'default', quietHours: { enabled: false, start: '22:00', end: '07:00' }
    });
    // Appearance settings are now read from AppContext
    const appearanceSettings = {
        theme: appState.theme,
        accentColor: appState.accentColor,
        backgroundAnimation: appState.backgroundAnimation,
        reducedMotion: appState.reducedMotion,
        compactMode: appState.compactMode,
        fontSize: appState.fontSize,
        highContrast: appState.highContrast,
        isPremiumFeaturesEnabled: appState.isPremiumFeaturesEnabled,
        premiumBackground: appState.premiumBackground,
    };

    useEffect(() => {
        const savedPrefs = localStorage.getItem(LOCAL_STORAGE_PREFS_KEY);
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
    }, [user?.id]);

    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && SETTINGS_TABS.find(t => t.id === tab)) {
            setActiveTab(tab as SettingsTab);
        }
    }, [location]);

    const handlePreferenceChange = (key: any, value: any) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        localStorage.setItem(LOCAL_STORAGE_PREFS_KEY, JSON.stringify(newPrefs));
    };
    const handleNotificationChange = (key: any, value: any) => setNotifications(prev => ({ ...prev, [key]: value }));
    
    // Update handleAppearanceChange to dispatch to AppContext
    const handleAppearanceChange = (key: keyof typeof appearanceSettings, value: any) => {
        dispatch({ type: 'UPDATE_APPEARANCE_SETTING', payload: { key, value } });
    };

    const handleExport = () => alert("Exporting data...");
    const handleDelete = () => confirm("Are you sure you want to delete your account?") && alert("Account deleted.");

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings />;
            case 'preferences':
                return <PreferencesSettings preferences={preferences} onPreferenceChange={handlePreferenceChange} />;
            case 'notifications':
                return <NotificationSettings notifications={notifications} onNotificationChange={handleNotificationChange} />;
            case 'appearance':
                return <AppearanceSettings appearance={appearanceSettings} onAppearanceChange={handleAppearanceChange as any} />;
            case 'data':
                return <DataSettings onExport={handleExport} onDelete={handleDelete} />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="p-6 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gradient">Settings</h1>
                <p className="text-white/60">Manage your account and application preferences.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass p-4 rounded-xl">
                        <nav className="space-y-2">
                            {SETTINGS_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${activeTab === tab.id
                                        ? 'bg-primary-500/20 text-primary-300'
                                        : 'text-white/70 hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-semibold">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="glass p-8 rounded-xl"
                    >
                        {renderTabContent()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
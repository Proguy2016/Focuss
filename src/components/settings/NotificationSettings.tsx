import React from 'react';
import { ToggleSwitch } from '../common/ToggleSwitch';

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
    onNotificationChange: (key: keyof Notifications, value: any) => void;
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

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notifications, onNotificationChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            
            <SettingRow title="Enable Push Notifications" description="Receive updates directly on your device.">
                <ToggleSwitch
                    checked={notifications.pushEnabled}
                    onCheckedChange={(checked: boolean) => onNotificationChange('pushEnabled', checked)}
                />
            </SettingRow>

            <SettingRow title="Enable Email Notifications" description="Get important updates sent to your inbox.">
                <ToggleSwitch
                    checked={notifications.emailEnabled}
                    onCheckedChange={(checked: boolean) => onNotificationChange('emailEnabled', checked)}
                />
            </SettingRow>

             <SettingRow title="Weekly Reports" description="Receive a summary of your productivity each week.">
                <ToggleSwitch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked: boolean) => onNotificationChange('weeklyReports', checked)}
                />
            </SettingRow>

            {/* Add more settings here */}

        </div>
    );
}; 
import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { UserProfile } from '../../services/AuthService';
import { Loader } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
    const { user, setUser, updateName, updateBio, updatePfp } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleProfileChange = (field: keyof UserProfile, value: string) => {
        if (user) {
            setUser({ ...user, [field]: value });
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File size should be less than 2MB');
            return;
        }

        const formData = new FormData();
        formData.append('pfp', file);

        try {
            await updatePfp(formData);
            console.log('Profile picture updated successfully');
        } catch (error: any) {
            console.error("Failed to upload new avatar", error);
            alert(`Failed to upload avatar: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
    };

    const handleRemoveAvatar = async () => {
        // Requires backend endpoint to set avatar to null
        console.log("Remove avatar clicked");
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateName({
                firstName: user.firstName,
                lastName: user.lastName,
            });
            await updateBio({
                bio: user.bio || '',
            });
            alert('Profile saved successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-60">
                <Loader className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                <p className="text-white/70">Loading your profile information...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-2 border-slate-700 shadow-md">
                        {user.profilePicture ? (
                            <AvatarImage src={user.profilePicture} alt="Avatar" />
                        ) : (
                            <AvatarFallback className="text-3xl bg-slate-800">
                                {user.firstName?.trim().charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Change Avatar</Button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                    <Button variant="ghost" size="sm" onClick={handleRemoveAvatar}>Remove</Button>
                </div>
            </div>
            <p className="text-white/60 text-sm mt-2">JPG, PNG or GIF. Max size 2MB.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-white/60 text-sm mb-2">First Name</label>
                    <input
                        type="text"
                        value={user.firstName}
                        onChange={e => handleProfileChange('firstName', e.target.value)}
                        className="input-field w-full"
                    />
                </div>
                <div>
                    <label className="block text-white/60 text-sm mb-2">Last Name</label>
                    <input
                        type="text"
                        value={user.lastName}
                        onChange={e => handleProfileChange('lastName', e.target.value)}
                        className="input-field w-full"
                    />
                </div>
            </div>

            <div>
                <label className="block text-white/60 text-sm mb-2">Email</label>
                <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="input-field w-full bg-slate-900/50 cursor-not-allowed"
                />
            </div>

            <div>
                <label className="block text-white/60 text-sm mb-2">Bio</label>
                <textarea
                    value={user.bio || ''}
                    onChange={e => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="input-field w-full h-24"
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button onClick={handleSaveProfile} disabled={isSaving} variant="primary">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}; 
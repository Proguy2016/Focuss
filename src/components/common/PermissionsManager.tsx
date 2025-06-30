import React, { useState } from 'react';
import { Shield, Users, Settings, Crown, Star, Eye, User } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePermissions, Role } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface PermissionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
}

export function PermissionsManager({ isOpen, onClose, participants }: PermissionsManagerProps) {
  const { userPermissions, hasPermission, updateUserRole, getCurrentUserPermissions } = usePermissions();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const currentUser = getCurrentUserPermissions();
  const canManagePermissions = hasPermission(currentUser.userId, 'manage_participants');

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-theme-yellow" />;
      case 'admin': return <Star className="w-4 h-4 text-theme-red" />;
      case 'moderator': return <Shield className="w-4 h-4 text-theme-primary" />;
      case 'member': return <User className="w-4 h-4 text-theme-emerald" />;
      case 'viewer': return <Eye className="w-4 h-4 text-theme-gray" />;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'owner': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'admin': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'moderator': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'member': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      case 'viewer': return 'bg-theme-gray/10 text-theme-gray border-theme-gray/30';
    }
  };

  const getPermissionDescription = (role: Role) => {
    switch (role) {
      case 'owner': return 'Full access to all features and settings';
      case 'admin': return 'Manage participants, tasks, and room settings';
      case 'moderator': return 'Create tasks, upload files, and moderate discussions';
      case 'member': return 'Participate in discussions and create tasks';
      case 'viewer': return 'View-only access to room content';
    }
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    if (!canManagePermissions) return;
    updateUserRole(userId, newRole);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 bg-white border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">Permissions Manager</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Manage user roles and access levels</p>
            </div>
          </div>
          {!canManagePermissions && (
            <Badge variant="secondary" className="bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30">
              View Only
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-auto max-h-[calc(80vh-120px)]">
          {/* Role Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['owner', 'admin', 'moderator', 'member', 'viewer'] as Role[]).map((role) => (
              <div key={role} className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex items-center gap-2 mb-2">
                  {getRoleIcon(role)}
                  <span className="font-semibold text-theme-dark capitalize">{role}</span>
                </div>
                <p className="text-xs text-theme-gray-dark leading-relaxed">
                  {getPermissionDescription(role)}
                </p>
              </div>
            ))}
          </div>

          {/* Participants List */}
          <div className="space-y-4">
            <h4 className="font-bold text-theme-dark">Participants ({participants.length})</h4>
            <div className="space-y-3">
              {participants.map((participant) => {
                const userPerm = userPermissions[participant.id] || { role: 'member' as Role };
                return (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50 hover:bg-theme-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-theme-primary/20 shadow-custom">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-secondary text-white font-bold">
                          {participant.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-theme-dark">{participant.name}</div>
                        <div className="text-sm text-theme-gray-dark">
                          {participant.status === 'online' ? 'Active now' : `Last seen ${Math.floor(Math.random() * 30)} minutes ago`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={cn("gap-2", getRoleColor(userPerm.role))}>
                        {getRoleIcon(userPerm.role)}
                        <span className="capitalize">{userPerm.role}</span>
                      </Badge>
                      
                      {canManagePermissions && userPerm.role !== 'owner' && (
                        <Select
                          value={userPerm.role}
                          onValueChange={(value: Role) => handleRoleChange(participant.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="space-y-4">
            <h4 className="font-bold text-theme-dark">Permission Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200/60 rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-theme-primary/10 to-theme-secondary/5">
                  <tr>
                    <th className="text-left p-3 font-semibold text-theme-dark">Permission</th>
                    <th className="text-center p-3 font-semibold text-theme-dark">Owner</th>
                    <th className="text-center p-3 font-semibold text-theme-dark">Admin</th>
                    <th className="text-center p-3 font-semibold text-theme-dark">Moderator</th>
                    <th className="text-center p-3 font-semibold text-theme-dark">Member</th>
                    <th className="text-center p-3 font-semibold text-theme-dark">Viewer</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'view_room', label: 'View Room' },
                    { key: 'send_messages', label: 'Send Messages' },
                    { key: 'upload_files', label: 'Upload Files' },
                    { key: 'create_tasks', label: 'Create Tasks' },
                    { key: 'edit_tasks', label: 'Edit Tasks' },
                    { key: 'manage_participants', label: 'Manage Participants' },
                    { key: 'record_session', label: 'Record Session' },
                    { key: 'admin_settings', label: 'Admin Settings' },
                  ].map((permission, index) => (
                    <tr key={permission.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="p-3 text-theme-dark">{permission.label}</td>
                      <td className="text-center p-3">
                        <div className="w-4 h-4 bg-theme-emerald rounded-full mx-auto" />
                      </td>
                      <td className="text-center p-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full mx-auto",
                          ['view_room', 'send_messages', 'upload_files', 'create_tasks', 'edit_tasks', 'manage_participants', 'record_session'].includes(permission.key)
                            ? 'bg-theme-emerald' : 'bg-theme-gray/30'
                        )} />
                      </td>
                      <td className="text-center p-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full mx-auto",
                          ['view_room', 'send_messages', 'upload_files', 'create_tasks', 'edit_tasks', 'record_session'].includes(permission.key)
                            ? 'bg-theme-emerald' : 'bg-theme-gray/30'
                        )} />
                      </td>
                      <td className="text-center p-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full mx-auto",
                          ['view_room', 'send_messages', 'upload_files', 'create_tasks'].includes(permission.key)
                            ? 'bg-theme-emerald' : 'bg-theme-gray/30'
                        )} />
                      </td>
                      <td className="text-center p-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full mx-auto",
                          permission.key === 'view_room' ? 'bg-theme-emerald' : 'bg-theme-gray/30'
                        )} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
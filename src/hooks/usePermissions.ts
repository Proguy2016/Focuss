import { useState, useCallback } from 'react';

export type Permission = 
  | 'view_room'
  | 'send_messages'
  | 'upload_files'
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'manage_participants'
  | 'record_session'
  | 'export_data'
  | 'admin_settings';

export type Role = 'owner' | 'admin' | 'moderator' | 'member' | 'viewer';

export interface UserPermissions {
  userId: string;
  role: Role;
  permissions: Permission[];
  customPermissions?: Permission[];
}

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    'view_room', 'send_messages', 'upload_files', 'create_tasks', 'edit_tasks', 
    'delete_tasks', 'manage_participants', 'record_session', 'export_data', 'admin_settings'
  ],
  admin: [
    'view_room', 'send_messages', 'upload_files', 'create_tasks', 'edit_tasks', 
    'delete_tasks', 'manage_participants', 'record_session', 'export_data'
  ],
  moderator: [
    'view_room', 'send_messages', 'upload_files', 'create_tasks', 'edit_tasks', 
    'record_session'
  ],
  member: [
    'view_room', 'send_messages', 'upload_files', 'create_tasks'
  ],
  viewer: [
    'view_room'
  ],
};

export function usePermissions() {
  const [userPermissions, setUserPermissions] = useState<Record<string, UserPermissions>>({
    'current': { userId: 'current', role: 'owner', permissions: rolePermissions.owner },
    '1': { userId: '1', role: 'admin', permissions: rolePermissions.admin },
    '2': { userId: '2', role: 'member', permissions: rolePermissions.member },
    '3': { userId: '3', role: 'moderator', permissions: rolePermissions.moderator },
    '4': { userId: '4', role: 'member', permissions: rolePermissions.member },
    '5': { userId: '5', role: 'viewer', permissions: rolePermissions.viewer },
  });

  const hasPermission = useCallback((userId: string, permission: Permission): boolean => {
    const user = userPermissions[userId];
    if (!user) return false;
    
    return user.permissions.includes(permission) || 
           (user.customPermissions && user.customPermissions.includes(permission));
  }, [userPermissions]);

  const updateUserRole = useCallback((userId: string, newRole: Role) => {
    setUserPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        role: newRole,
        permissions: rolePermissions[newRole],
      }
    }));
  }, []);

  const addCustomPermission = useCallback((userId: string, permission: Permission) => {
    setUserPermissions(prev => {
      const user = prev[userId];
      if (!user) return prev;
      
      const customPermissions = user.customPermissions || [];
      if (customPermissions.includes(permission)) return prev;
      
      return {
        ...prev,
        [userId]: {
          ...user,
          customPermissions: [...customPermissions, permission],
        }
      };
    });
  }, []);

  const removeCustomPermission = useCallback((userId: string, permission: Permission) => {
    setUserPermissions(prev => {
      const user = prev[userId];
      if (!user || !user.customPermissions) return prev;
      
      return {
        ...prev,
        [userId]: {
          ...user,
          customPermissions: user.customPermissions.filter(p => p !== permission),
        }
      };
    });
  }, []);

  const getCurrentUserPermissions = useCallback(() => {
    return userPermissions['current'] || { userId: 'current', role: 'viewer', permissions: rolePermissions.viewer };
  }, [userPermissions]);

  return {
    userPermissions,
    hasPermission,
    updateUserRole,
    addCustomPermission,
    removeCustomPermission,
    getCurrentUserPermissions,
  };
}
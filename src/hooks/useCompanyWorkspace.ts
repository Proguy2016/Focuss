import { useState, useEffect } from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  dueDate?: Date;
  progress: number;
  teamMembers: string[];
  tags: string[];
  budget?: number;
  client?: string;
  color: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  members: string[];
  projects: string[];
  budget: number;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  skills: string[];
  status: 'online' | 'away' | 'busy' | 'offline';
  currentProject?: string;
  workload: number; // 0-100%
  joinDate: Date;
  timezone: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  projectId?: string;
  type: 'standup' | 'review' | 'planning' | 'client' | 'all-hands' | 'one-on-one';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  recordingUrl?: string;
  agenda: string[];
  notes?: string;
}

export interface SharedResource {
  id: string;
  name: string;
  type: 'equipment' | 'software' | 'room' | 'license' | 'document';
  description: string;
  availability: 'available' | 'in-use' | 'maintenance' | 'reserved';
  currentUser?: string;
  bookings: {
    userId: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
  }[];
  cost?: number;
  location?: string;
}

export function useCompanyWorkspace() {
  const [currentProject, setCurrentProject] = useState<string>('proj-1');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'Design System 2.0',
      description: 'Complete overhaul of the company design system',
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-03-30'),
      progress: 65,
      teamMembers: ['1', '2', '3'],
      tags: ['design', 'frontend', 'ui/ux'],
      budget: 50000,
      client: 'Internal',
      color: '#04d9d9',
    },
    {
      id: 'proj-2',
      name: 'Mobile App Development',
      description: 'Native mobile app for iOS and Android',
      status: 'active',
      priority: 'critical',
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-06-15'),
      progress: 30,
      teamMembers: ['4', '5', '6'],
      tags: ['mobile', 'react-native', 'backend'],
      budget: 120000,
      client: 'TechCorp Inc.',
      color: '#f59e0b',
    },
    {
      id: 'proj-3',
      name: 'AI Integration Platform',
      description: 'Integrate AI capabilities across all products',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-05-01'),
      progress: 45,
      teamMembers: ['7', '8', '9'],
      tags: ['ai', 'machine-learning', 'backend'],
      budget: 80000,
      client: 'Internal',
      color: '#8b5cf6',
    },
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 'dept-1',
      name: 'Engineering',
      description: 'Software development and technical infrastructure',
      head: '1',
      members: ['1', '2', '4', '5', '7', '8'],
      projects: ['proj-1', 'proj-2', 'proj-3'],
      budget: 500000,
      color: '#04d9d9',
    },
    {
      id: 'dept-2',
      name: 'Design',
      description: 'User experience and visual design',
      head: '3',
      members: ['3', '6'],
      projects: ['proj-1', 'proj-2'],
      budget: 200000,
      color: '#ec4899',
    },
    {
      id: 'dept-3',
      name: 'Product',
      description: 'Product strategy and management',
      head: '9',
      members: ['9', '10'],
      projects: ['proj-1', 'proj-2', 'proj-3'],
      budget: 150000,
      color: '#34d399',
    },
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      role: 'Senior Frontend Developer',
      department: 'dept-1',
      skills: ['React', 'TypeScript', 'Design Systems'],
      status: 'online',
      currentProject: 'proj-1',
      workload: 85,
      joinDate: new Date('2022-03-15'),
      timezone: 'PST',
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      email: 'marcus@company.com',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      role: 'Backend Developer',
      department: 'dept-1',
      skills: ['Node.js', 'Python', 'AWS'],
      status: 'online',
      currentProject: 'proj-1',
      workload: 70,
      joinDate: new Date('2021-11-20'),
      timezone: 'EST',
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      email: 'elena@company.com',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      role: 'UX Designer',
      department: 'dept-2',
      skills: ['Figma', 'User Research', 'Prototyping'],
      status: 'away',
      currentProject: 'proj-1',
      workload: 60,
      joinDate: new Date('2023-01-10'),
      timezone: 'CET',
    },
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'meet-1',
      title: 'Daily Standup - Design System',
      startTime: new Date(Date.now() + 30 * 60 * 1000),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      participants: ['1', '2', '3'],
      projectId: 'proj-1',
      type: 'standup',
      status: 'scheduled',
      agenda: ['Yesterday\'s progress', 'Today\'s goals', 'Blockers'],
    },
    {
      id: 'meet-2',
      title: 'Client Review - Mobile App',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      participants: ['4', '5', '6', '9'],
      projectId: 'proj-2',
      type: 'client',
      status: 'scheduled',
      agenda: ['Demo latest features', 'Feedback collection', 'Next sprint planning'],
    },
  ]);

  const [sharedResources, setSharedResources] = useState<SharedResource[]>([
    {
      id: 'res-1',
      name: 'Conference Room A',
      type: 'room',
      description: '12-person conference room with video conferencing',
      availability: 'available',
      bookings: [],
      location: 'Floor 3, East Wing',
    },
    {
      id: 'res-2',
      name: 'Figma Pro License',
      type: 'software',
      description: 'Professional design tool license',
      availability: 'in-use',
      currentUser: '3',
      bookings: [],
      cost: 144,
    },
    {
      id: 'res-3',
      name: 'MacBook Pro M3',
      type: 'equipment',
      description: 'High-performance laptop for development',
      availability: 'available',
      bookings: [],
      cost: 2500,
      location: 'Equipment Storage',
    },
  ]);

  const switchProject = (projectId: string) => {
    setCurrentProject(projectId);
  };

  const getCurrentProject = () => {
    return projects.find(p => p.id === currentProject);
  };

  const getProjectTeam = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    return employees.filter(emp => project.teamMembers.includes(emp.id));
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings
      .filter(m => m.startTime > now && m.status === 'scheduled')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  };

  const getAvailableResources = () => {
    return sharedResources.filter(r => r.availability === 'available');
  };

  const getDepartmentProjects = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return [];
    return projects.filter(p => dept.projects.includes(p.id));
  };

  return {
    currentProject,
    projects,
    departments,
    employees,
    meetings,
    sharedResources,
    switchProject,
    getCurrentProject,
    getProjectTeam,
    getUpcomingMeetings,
    getAvailableResources,
    getDepartmentProjects,
  };
}
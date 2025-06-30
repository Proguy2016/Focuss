import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Video, X, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UpcomingMeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: any[];
  canManage: boolean;
}

export function UpcomingMeetingsModal({ isOpen, onClose, meetings, canManage }: UpcomingMeetingsModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    type: 'standup',
    date: '',
    time: '',
    duration: '30',
    participants: [] as string[],
  });

  const meetingTypes = [
    { id: 'standup', label: 'Daily Standup', color: 'bg-theme-primary/10 text-theme-primary' },
    { id: 'review', label: 'Review Meeting', color: 'bg-theme-emerald/10 text-theme-emerald' },
    { id: 'planning', label: 'Planning Session', color: 'bg-theme-yellow/10 text-theme-yellow' },
    { id: 'client', label: 'Client Meeting', color: 'bg-theme-red/10 text-theme-red' },
    { id: 'all-hands', label: 'All Hands', color: 'bg-theme-secondary/10 text-theme-secondary' },
    { id: 'one-on-one', label: 'One-on-One', color: 'bg-theme-gray/10 text-theme-gray-dark' },
  ];

  const participants = [
    { id: '1', name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    { id: '2', name: 'Marcus Johnson', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    { id: '3', name: 'Elena Rodriguez', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingData.title || !meetingData.date || !meetingData.time) return;

    console.log('Creating meeting:', meetingData);
    
    // Reset form
    setMeetingData({
      title: '',
      description: '',
      type: 'standup',
      date: '',
      time: '',
      duration: '30',
      participants: [],
    });
    setShowAddForm(false);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getTypeInfo = (type: string) => {
    return meetingTypes.find(t => t.id === type) || meetingTypes[0];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white border-theme-primary/20 shadow-custom-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">Upcoming Meetings</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Manage scheduled meetings and create new ones</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && !showAddForm && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
              >
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Add Meeting Form */}
          {showAddForm && canManage && (
            <div className="p-6 bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5 rounded-xl border border-theme-primary/20">
              <h3 className="font-bold text-theme-dark mb-4">Schedule New Meeting</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-theme-dark">
                      Meeting Title *
                    </Label>
                    <Input
                      id="title"
                      value={meetingData.title}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter meeting title..."
                      className="border-theme-primary/30 focus:border-theme-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-theme-dark">
                      Meeting Type
                    </Label>
                    <Select 
                      value={meetingData.type} 
                      onValueChange={(value) => setMeetingData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meetingTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${type.color.includes('primary') ? 'bg-theme-primary' : 
                                type.color.includes('emerald') ? 'bg-theme-emerald' :
                                type.color.includes('yellow') ? 'bg-theme-yellow' :
                                type.color.includes('red') ? 'bg-theme-red' :
                                type.color.includes('secondary') ? 'bg-theme-secondary' : 'bg-theme-gray'}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-theme-dark">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={meetingData.description}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Meeting agenda and details..."
                    className="border-theme-primary/30 focus:border-theme-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-theme-dark">
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={meetingData.date}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                      className="border-theme-primary/30 focus:border-theme-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium text-theme-dark">
                      Time *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={meetingData.time}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
                      className="border-theme-primary/30 focus:border-theme-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium text-theme-dark">
                      Duration (minutes)
                    </Label>
                    <Select 
                      value={meetingData.duration} 
                      onValueChange={(value) => setMeetingData(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Meeting
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Meetings List */}
          <div className="space-y-4">
            <h3 className="font-bold text-theme-dark">Scheduled Meetings ({meetings.length})</h3>
            
            {meetings.map((meeting) => {
              const typeInfo = getTypeInfo(meeting.type);
              
              return (
                <div key={meeting.id} className="p-5 border border-gray-200/60 rounded-xl hover:shadow-custom transition-all duration-200 bg-white/80 backdrop-blur-glass">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg">
                        <Video className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-theme-dark">{meeting.title}</h4>
                        <p className="text-sm text-theme-gray-dark">{meeting.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      <Badge variant="secondary" className={`${meeting.status === 'scheduled' ? 'bg-theme-emerald/10 text-theme-emerald' : 'bg-theme-gray/10 text-theme-gray-dark'}`}>
                        {meeting.status}
                      </Badge>
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-theme-red hover:text-theme-red">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-theme-gray-dark">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(meeting.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-theme-gray-dark">
                      <Clock className="w-4 h-4" />
                      <span>{Math.round((meeting.endTime - meeting.startTime) / (1000 * 60))} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-theme-gray-dark">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participants.length} participants</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {meeting.participants.slice(0, 5).map((participantId: string) => {
                        const participant = participants.find(p => p.id === participantId);
                        return participant ? (
                          <Avatar key={participant.id} className="w-8 h-8 border-2 border-white ring-1 ring-theme-primary/20">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                              {getInitials(participant.name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : null;
                      })}
                      {meeting.participants.length > 5 && (
                        <div className="w-8 h-8 bg-theme-gray/20 border-2 border-white rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-theme-gray-dark">+{meeting.participants.length - 5}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {meeting.agenda && meeting.agenda.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {meeting.agenda.length} agenda items
                        </Badge>
                      )}
                      <Button 
                        size="sm" 
                        className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {meetings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-theme-gray" />
                <h3 className="font-semibold text-theme-dark mb-2">No upcoming meetings</h3>
                <p className="text-theme-gray-dark mb-6">
                  {canManage ? 'Schedule your first meeting to get started' : 'No meetings have been scheduled yet'}
                </p>
                {canManage && (
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="gap-2 bg-theme-primary hover:bg-theme-primary-dark text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule Meeting
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
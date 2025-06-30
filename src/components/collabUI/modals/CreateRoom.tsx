import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, X } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar: string;
}

interface CreateRoomProps {
  onCreateRoom: (roomDetails: { name: string; description: string; type: string; members: Member[] }) => void;
  onCancel: () => void;
}

export function CreateRoom({ onCreateRoom, onCancel }: CreateRoomProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('private');
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAddMember = () => {
    if (newMemberEmail && !members.find(m => m.id === newMemberEmail)) {
      // In a real app, you'd fetch user details by email
      setMembers([...members, { id: newMemberEmail, name: newMemberEmail.split('@')[0], avatar: `https://avatar.vercel.sh/${newMemberEmail}` }]);
      setNewMemberEmail('');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({ name, description, type, members });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-dark border-white/10 text-white">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a New Collaboration Room</CardTitle>
            <CardDescription>Fill in the details to start a new collaborative session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="room-name" className="text-sm font-medium">Room Name</label>
              <Input
                id="room-name"
                placeholder="e.g., Q4 Marketing Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="room-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="room-description"
                placeholder="A brief description of the room's purpose."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="room-type" className="text-sm font-medium">Room Type</label>
              <Select onValueChange={setType} defaultValue={type}>
                <SelectTrigger id="room-type" className="w-full bg-dark-light border-white/20">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent className="bg-dark border-white/20 text-white">
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="invite-only">Invite-Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Add Members (by email)</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button type="button" onClick={handleAddMember} variant="secondary" className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-dark-light rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="text-white border-gray-600 bg-transparent hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-theme-primary hover:bg-theme-primary-dark">Create Room</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 
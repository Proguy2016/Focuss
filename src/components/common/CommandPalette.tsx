import React, { useState } from 'react';
import { Search, FileText, MessageSquare, CheckSquare, Folder, Users, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (destination: string) => void;
}

const commands = [
  { id: 'chat', label: 'Go to Team Chat', icon: MessageSquare, group: 'Navigation' },
  { id: 'ai-chat', label: 'Go to Shared AI Chat', icon: Brain, group: 'Navigation' },
  { id: 'whiteboard', label: 'Go to Whiteboard', icon: FileText, group: 'Navigation' },
  { id: 'tasks', label: 'Go to Tasks & Milestones', icon: CheckSquare, group: 'Navigation' },
  { id: 'library', label: 'Go to Shared Library', icon: Folder, group: 'Navigation' },
  { id: 'tracker', label: 'Go to Project Tracker', icon: FileText, group: 'Navigation' },
  { id: 'participants', label: 'View Participants', icon: Users, group: 'Actions' },
];

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = [];
    }
    acc[command.group].push(command);
    return acc;
  }, {} as Record<string, typeof commands>);

  const handleSelect = (commandId: string) => {
    onNavigate(commandId);
    onClose();
    setSearch('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl bg-white/95 backdrop-blur-glass border-theme-primary/20 shadow-custom-lg">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-gray-200/60 px-4">
            <Search className="mr-3 h-4 w-4 shrink-0 text-theme-primary" />
            <CommandInput
              placeholder="Search for pages, people, and more..."
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0 bg-transparent placeholder:text-theme-gray-dark text-theme-dark"
            />
          </div>
          <CommandList className="max-h-96">
            <CommandEmpty className="py-6 text-center text-theme-gray-dark">
              No results found.
            </CommandEmpty>
            {Object.entries(groupedCommands).map(([group, commands]) => (
              <CommandGroup key={group} heading={group} className="px-2 py-2">
                {commands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => handleSelect(command.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-theme-primary/10 cursor-pointer transition-colors"
                  >
                    <command.icon className="w-4 h-4 text-theme-primary" />
                    <span className="text-theme-dark font-medium">{command.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
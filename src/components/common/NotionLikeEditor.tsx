import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Hash, List, CheckSquare, Quote, Code, Image, Link, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered' | 'todo' | 'quote' | 'code' | 'divider';
  content: string;
  completed?: boolean;
  level?: number;
}

interface NotionLikeEditorProps {
  initialContent?: Block[];
  onChange?: (blocks: Block[]) => void;
  placeholder?: string;
  className?: string;
}

export function NotionLikeEditor({ 
  initialContent = [], 
  onChange, 
  placeholder = "Type '/' for commands...",
  className 
}: NotionLikeEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialContent.length > 0 ? initialContent : [
    { id: '1', type: 'paragraph', content: '' }
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const commands = [
    { id: 'paragraph', label: 'Text', icon: Type, description: 'Just start writing with plain text.' },
    { id: 'heading1', label: 'Heading 1', icon: Hash, description: 'Big section heading.' },
    { id: 'heading2', label: 'Heading 2', icon: Hash, description: 'Medium section heading.' },
    { id: 'heading3', label: 'Heading 3', icon: Hash, description: 'Small section heading.' },
    { id: 'bullet', label: 'Bulleted list', icon: List, description: 'Create a simple bulleted list.' },
    { id: 'numbered', label: 'Numbered list', icon: List, description: 'Create a list with numbering.' },
    { id: 'todo', label: 'To-do list', icon: CheckSquare, description: 'Track tasks with a to-do list.' },
    { id: 'quote', label: 'Quote', icon: Quote, description: 'Capture a quote.' },
    { id: 'code', label: 'Code', icon: Code, description: 'Capture a code snippet.' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const addBlock = (afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: '',
    };

    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === afterId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });

    return newBlock.id;
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return;
    
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = addBlock(blockId);
      const timeout = setTimeout(() => {
        const newElement = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement;
        newElement?.focus();
      }, 0);
      timeoutsRef.current.push(timeout);
    }

    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      deleteBlock(blockId);
    }

    if (e.key === '/' && block.content === '') {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      setCommandPosition({ x: rect.left, y: rect.bottom });
      setShowCommands(true);
      setSearchTerm('');
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>, blockId: string) => {
    const content = e.currentTarget.textContent || '';
    updateBlock(blockId, { content });

    if (content.startsWith('/')) {
      setSearchTerm(content.slice(1));
      if (!showCommands) {
        const rect = e.currentTarget.getBoundingClientRect();
        setCommandPosition({ x: rect.left, y: rect.bottom });
        setShowCommands(true);
      }
    } else if (showCommands) {
      setShowCommands(false);
    }
  };

  const applyCommand = (commandId: string, blockId: string) => {
    updateBlock(blockId, { type: commandId as Block['type'], content: '' });
    setShowCommands(false);
    setSearchTerm('');
    const timeout = setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
      element?.focus();
    }, 0);
    timeoutsRef.current.push(timeout);
  };

  const toggleTodo = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && block.type === 'todo') {
      updateBlock(blockId, { completed: !block.completed });
    }
  };

  const getBlockPlaceholder = (type: Block['type']) => {
    switch (type) {
      case 'heading1': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'heading3': return 'Heading 3';
      case 'bullet': return 'List item';
      case 'numbered': return 'List item';
      case 'todo': return 'To-do';
      case 'quote': return 'Quote';
      case 'code': return 'Code';
      default: return placeholder;
    }
  };

  const getBlockClassName = (type: Block['type']) => {
    const base = "outline-none w-full bg-transparent resize-none overflow-hidden";
    
    switch (type) {
      case 'heading1': return `${base} text-2xl font-bold text-theme-dark`;
      case 'heading2': return `${base} text-xl font-bold text-theme-dark`;
      case 'heading3': return `${base} text-lg font-bold text-theme-dark`;
      case 'quote': return `${base} text-theme-gray-dark italic border-l-4 border-theme-primary pl-4`;
      case 'code': return `${base} font-mono text-sm bg-theme-slate-dark text-theme-light p-3 rounded-lg`;
      default: return `${base} text-theme-dark`;
    }
  };

  const renderBlockPrefix = (block: Block, index: number) => {
    switch (block.type) {
      case 'bullet':
        return <span className="text-theme-primary mr-2">•</span>;
      case 'numbered':
        return <span className="text-theme-primary mr-2">{index + 1}.</span>;
      case 'todo':
        return (
          <button
            onClick={() => toggleTodo(block.id)}
            className={cn(
              "w-4 h-4 mr-2 mt-1 border-2 rounded flex-shrink-0 flex items-center justify-center transition-colors",
              block.completed 
                ? "bg-theme-primary border-theme-primary text-white" 
                : "border-theme-gray hover:border-theme-primary"
            )}
          >
            {block.completed && <CheckSquare className="w-3 h-3" />}
          </button>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={editorRef}>
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div key={block.id} className="flex items-start group notion-fade-in">
            {renderBlockPrefix(block, index)}
            <div
              data-block-id={block.id}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                getBlockClassName(block.type),
                block.completed && "line-through text-theme-gray"
              )}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              onInput={(e) => handleInput(e, block.id)}
              onFocus={() => setActiveBlockId(block.id)}
              onBlur={() => setActiveBlockId(null)}
            >
              {block.content}
            </div>
            
            {/* Block Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-theme-primary/10">
                    <Plus className="w-3 h-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-3 border-b border-gray-200/60">
                    <h4 className="font-semibold text-theme-dark">Add a block</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {commands.map((command) => (
                      <button
                        key={command.id}
                        onClick={() => applyCommand(command.id, block.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-theme-primary/5 transition-colors text-left"
                      >
                        <div className="p-2 bg-theme-primary/10 rounded-lg">
                          <command.icon className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-theme-dark">{command.label}</div>
                          <div className="text-sm text-theme-gray-dark">{command.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ))}
      </div>

      {/* Command Palette */}
      {showCommands && (
        <div 
          className="absolute z-50 w-80 bg-white border border-gray-200/60 rounded-xl shadow-custom-lg notion-fade-in"
          style={{ left: commandPosition.x, top: commandPosition.y + 8 }}
        >
          <div className="p-3 border-b border-gray-200/60">
            <h4 className="font-semibold text-theme-dark">Add a block</h4>
            <p className="text-sm text-theme-gray-dark">Type to filter...</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => applyCommand(command.id, activeBlockId!)}
                className="w-full flex items-center gap-3 p-3 hover:bg-theme-primary/5 transition-colors text-left"
              >
                <div className="p-2 bg-theme-primary/10 rounded-lg">
                  <command.icon className="w-4 h-4 text-theme-primary" />
                </div>
                <div>
                  <div className="font-medium text-theme-dark">{command.label}</div>
                  <div className="text-sm text-theme-gray-dark">{command.description}</div>
                </div>
              </button>
            ))}
            {filteredCommands.length === 0 && (
              <div className="p-6 text-center text-theme-gray-dark">
                No matching blocks found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
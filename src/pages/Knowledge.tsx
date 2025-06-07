import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, BookOpen, FileText, Brain, Lightbulb, 
  Tag, Calendar, Clock, Star, MoreHorizontal, Edit, 
  Trash2, Share2, Download, Filter, Grid, List,
  Zap, Target, Eye, Archive, Bookmark
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'mindMap' | 'flashcard';
  tags: string[];
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  isArchived: boolean;
  wordCount: number;
  readTime: number; // minutes
}

interface Flashcard {
  id: string;
  noteId: string;
  front: string;
  back: string;
  difficulty: number; // 1-5
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'notes' | 'mindMaps' | 'flashcards' | 'favorites' | 'recent';

export const Knowledge: React.FC = () => {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFlashcardReview, setShowFlashcardReview] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'note' as const,
    tags: [] as string[],
    tagInput: '',
  });

  // Mock data
  const notes: Note[] = [
    {
      id: '1',
      title: 'Deep Work Principles',
      content: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It\'s a skill that allows you to quickly master complicated information and produce better results in less time.',
      type: 'note',
      tags: ['productivity', 'focus', 'work'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      isFavorite: true,
      isArchived: false,
      wordCount: 156,
      readTime: 2,
    },
    {
      id: '2',
      title: 'Pomodoro Technique',
      content: 'The Pomodoro Technique is a time management method that uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks.',
      type: 'note',
      tags: ['time-management', 'technique'],
      sessionId: 'session-1',
      createdAt: new Date('2024-02-02'),
      updatedAt: new Date('2024-02-02'),
      isFavorite: false,
      isArchived: false,
      wordCount: 89,
      readTime: 1,
    },
    {
      id: '3',
      title: 'Habit Formation',
      content: 'Habits are formed through a neurological loop consisting of a cue, routine, and reward. Understanding this loop is key to building good habits and breaking bad ones.',
      type: 'mindMap',
      tags: ['habits', 'psychology', 'behavior'],
      createdAt: new Date('2024-02-03'),
      updatedAt: new Date('2024-02-03'),
      isFavorite: true,
      isArchived: false,
      wordCount: 67,
      readTime: 1,
    },
  ];

  const flashcards: Flashcard[] = [
    {
      id: '1',
      noteId: '1',
      front: 'What is Deep Work?',
      back: 'The ability to focus without distraction on a cognitively demanding task',
      difficulty: 3,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reviewCount: 5,
      correctCount: 3,
    },
    {
      id: '2',
      noteId: '2',
      front: 'How long is a traditional Pomodoro interval?',
      back: '25 minutes',
      difficulty: 2,
      nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000),
      reviewCount: 8,
      correctCount: 7,
    },
    {
      id: '3',
      noteId: '3',
      front: 'What are the three components of the habit loop?',
      back: 'Cue, Routine, and Reward',
      difficulty: 4,
      nextReview: new Date(Date.now() + 6 * 60 * 60 * 1000),
      reviewCount: 3,
      correctCount: 1,
    },
  ];

  const filteredNotes = notes.filter(note => {
    // Search filter
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // Type filter
    switch (filterType) {
      case 'notes':
        return note.type === 'note';
      case 'mindMaps':
        return note.type === 'mindMap';
      case 'flashcards':
        return note.type === 'flashcard';
      case 'favorites':
        return note.isFavorite;
      case 'recent':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return note.updatedAt > weekAgo;
      default:
        return !note.isArchived;
    }
  });

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      tags: newNote.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false,
      isArchived: false,
      wordCount: newNote.content.split(' ').length,
      readTime: Math.ceil(newNote.content.split(' ').length / 200), // 200 WPM
    };

    console.log('Creating note:', note);
    setShowCreateModal(false);
    setNewNote({
      title: '',
      content: '',
      type: 'note',
      tags: [],
      tagInput: '',
    });
  };

  const addTag = () => {
    if (newNote.tagInput.trim() && !newNote.tags.includes(newNote.tagInput.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return FileText;
      case 'mindMap': return Brain;
      case 'flashcard': return Zap;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'text-primary-400';
      case 'mindMap': return 'text-secondary-400';
      case 'flashcard': return 'text-accent-400';
      default: return 'text-primary-400';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const NoteCard: React.FC<{ note: Note; index: number }> = ({ note, index }) => {
    const TypeIcon = getTypeIcon(note.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Card 
          variant="glass" 
          hover 
          className="p-6 cursor-pointer h-full"
          onClick={() => setSelectedNote(note)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <TypeIcon className={`w-5 h-5 ${getTypeColor(note.type)}`} />
              {note.isFavorite && <Star className="w-4 h-4 text-warning-400 fill-current" />}
              {note.sessionId && <Target className="w-4 h-4 text-success-400" />}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" icon={Edit} />
              <Button variant="ghost" size="sm" icon={Share2} />
              <Button variant="ghost" size="sm" icon={MoreHorizontal} />
            </div>
          </div>
          
          <h3 className="font-semibold text-white mb-2 line-clamp-2">{note.title}</h3>
          <p className="text-white/70 text-sm mb-4 line-clamp-3">{note.content}</p>
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {note.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-white/60 text-xs">+{note.tags.length - 3}</span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-3">
              <span>{note.wordCount} words</span>
              <span>{note.readTime} min read</span>
            </div>
            <span>{formatDate(note.updatedAt)}</span>
          </div>
        </Card>
      </motion.div>
    );
  };

  const FlashcardReview: React.FC = () => {
    const card = flashcards[currentFlashcard];
    if (!card) return null;

    const handleAnswer = (correct: boolean) => {
      console.log('Flashcard answer:', correct);
      setShowAnswer(false);
      
      if (currentFlashcard < flashcards.length - 1) {
        setCurrentFlashcard(prev => prev + 1);
      } else {
        setShowFlashcardReview(false);
        setCurrentFlashcard(0);
      }
    };

    return (
      <Modal
        isOpen={showFlashcardReview}
        onClose={() => setShowFlashcardReview(false)}
        title={`Flashcard Review (${currentFlashcard + 1}/${flashcards.length})`}
        size="lg"
      >
        <div className="text-center space-y-6">
          <div className="glass p-8 rounded-xl min-h-48 flex items-center justify-center">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {showAnswer ? 'Answer' : 'Question'}
              </h3>
              <p className="text-white/80 text-lg">
                {showAnswer ? card.back : card.front}
              </p>
            </div>
          </div>
          
          {!showAnswer ? (
            <Button
              variant="primary"
              onClick={() => setShowAnswer(true)}
              fullWidth
            >
              Show Answer
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={() => handleAnswer(false)}
                fullWidth
              >
                Incorrect
              </Button>
              <Button
                variant="success"
                onClick={() => handleAnswer(true)}
                fullWidth
              >
                Correct
              </Button>
            </div>
          )}
          
          <div className="text-white/60 text-sm">
            Difficulty: {card.difficulty}/5 | 
            Success Rate: {Math.round((card.correctCount / card.reviewCount) * 100)}%
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Knowledge Base</h1>
          <p className="text-white/60">
            Capture ideas, create mind maps, and review with flashcards
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Zap}
            onClick={() => setShowFlashcardReview(true)}
            disabled={flashcards.length === 0}
          >
            Review Cards
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            New Note
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">{notes.length}</div>
          <div className="text-white/60 text-sm">Total Notes</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-secondary-400 mb-2">{flashcards.length}</div>
          <div className="text-white/60 text-sm">Flashcards</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-accent-400 mb-2">
            {notes.filter(n => n.isFavorite).length}
          </div>
          <div className="text-white/60 text-sm">Favorites</div>
        </Card>
        
        <Card variant="glass" className="p-6 text-center">
          <div className="text-3xl font-bold text-success-400 mb-2">
            {notes.reduce((sum, note) => sum + note.wordCount, 0)}
          </div>
          <div className="text-white/60 text-sm">Total Words</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search notes, content, and tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="glass px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Items</option>
              <option value="notes">Notes</option>
              <option value="mindMaps">Mind Maps</option>
              <option value="flashcards">Flashcards</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent</option>
            </select>

            {/* View Mode */}
            <div className="flex glass rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                icon={Grid}
                onClick={() => setViewMode('grid')}
              />
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                icon={List}
                onClick={() => setViewMode('list')}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notes Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredNotes.map((note, index) => (
            <NoteCard key={note.id} note={note} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">No notes found</h3>
          <p className="text-white/40">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first note to get started'}
          </p>
        </motion.div>
      )}

      {/* Create Note Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Note"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Title *</label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter note title..."
              className="input-field w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Type</label>
            <select
              value={newNote.type}
              onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as any }))}
              className="input-field w-full"
            >
              <option value="note">Note</option>
              <option value="mindMap">Mind Map</option>
              <option value="flashcard">Flashcard</option>
            </select>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Content</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note content..."
              className="input-field w-full h-32 resize-none"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newNote.tagInput}
                onChange={(e) => setNewNote(prev => ({ ...prev, tagInput: e.target.value }))}
                placeholder="Add a tag..."
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            
            {newNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newNote.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-sm flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-primary-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleCreateNote}
              fullWidth
              disabled={!newNote.title.trim()}
            >
              Create Note
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Note Detail Modal */}
      {selectedNote && (
        <Modal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          title={selectedNote.title}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                {React.createElement(getTypeIcon(selectedNote.type), { 
                  className: `w-4 h-4 ${getTypeColor(selectedNote.type)}` 
                })}
                <span className="capitalize">{selectedNote.type}</span>
              </div>
              <span>{selectedNote.wordCount} words</span>
              <span>{selectedNote.readTime} min read</span>
              <span>{formatDate(selectedNote.updatedAt)}</span>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 leading-relaxed">{selectedNote.content}</p>
            </div>
            
            {selectedNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {selectedNote.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-white/70 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button variant="primary" icon={Edit} fullWidth>
                Edit Note
              </Button>
              <Button variant="secondary" icon={Share2}>
                Share
              </Button>
              <Button variant="ghost" icon={Bookmark}>
                {selectedNote.isFavorite ? 'Unfavorite' : 'Favorite'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Flashcard Review */}
      <FlashcardReview />
    </div>
  );
};
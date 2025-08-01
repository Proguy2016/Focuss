import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, ChevronRight, Upload, FileText, Brain, BookOpen, HelpCircle, Eye,
  Menu, X, Trash2, Sparkles, ChevronLeft, Clock, LineChart, Target, Pencil,
  MessageSquare, BarChart, Layers, Edit3, Zap, Plus, Save, SendHorizontal,
  RefreshCw, AlertTriangle, CheckCircle2, Bot, Send, Maximize2, Minimize2
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button, ButtonProps } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Separator } from '../components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { ColoredGlassCard } from '../components/ui/ColoredGlassCard';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import aiService from '../services/aiService';
import StudyTools, { SpacedRepetitionFlashcards, QuizMode } from '../components/library/StudyTools';
import PremiumStudySession from '../components/library/PremiumStudySession';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

// Extend ButtonProps to include custom variants
declare module '../components/ui/button' {
  interface ButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass' | 'premium';
  }
}

interface LectureData {
  id: string;
  _id?: string;
  title: string;
  pdfFile?: File;
  summary?: string | string[];
  flashcards?: Array<{ question: string; answer: string }>;
  examQuestions?: Array<{ question: string; answer: string }>;
  revision?: string;
  fileId?: string;
  contentId?: string;
}

interface Subject {
  id: string;
  _id?: string;
  name: string;
  color: string;
  lectures: LectureData[];
}

interface LibraryPageProps {
  subjects?: Subject[];
}

interface ProcessingStatus {
  status?: string;
  progress?: number;
  message?: string;
}

interface Note {
  id: string;
  _id?: string; // Add optional MongoDB _id field
  lectureId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SRSCard {
  id: string;
  lectureId: string;
  front: string;
  back: string;
  difficulty: number; // 1-5
  nextReview: Date;
  interval: number; // days until next review
  repetitions: number;
  easeFactor: number;
}

interface QASession {
  id: string;
  lectureId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

interface LearningPath {
  id: string;
  lectureId: string;
  topics: Array<{
    title: string;
    status: 'not-started' | 'in-progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
    resources: string[];
  }>;
  progress: number;
}

const LibraryPage: React.FC<LibraryPageProps> = ({
  subjects,
}) => {
  const [subjectData, setSubjectData] = useState<Subject[]>(subjects || []);
  const [selectedLecture, setSelectedLecture] = useState<LectureData | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'flashcards' | 'exam' | 'revision' | 'study' | 'premium' | 'notes' | 'srs' | 'qa' | 'learning-path'>('summary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPremiumEnabled, setIsPremiumEnabled] = useState<boolean>(false);
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [srsCards, setSRSCards] = useState<SRSCard[]>([]);
  const [qaSession, setQASession] = useState<QASession | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [qaQuestion, setQAQuestion] = useState('');
  const [isProcessingQA, setIsProcessingQA] = useState(false);

  // Add state for the floating notes window
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Add isLoadingNotes state variable
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(false);

  // Add state for AI chat panel
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatMessages, setAIChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [aiChatInput, setAIChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  // State for tracking the active note in the advanced notes section
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Add state for AI chat panel position and minimized state
  const [aiChatPosition, setAIChatPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Fetch subjects and lectures on page load
  useEffect(() => {
    const fetchSubjects = async () => {
      if (user) {
        try {
          const response = await api.get('/api/subjects');
          setSubjectData(response.data);
        } catch (error) {
          console.error("Error fetching subjects:", error);
          // Optionally, set an error state to show a message to the user
        }
      }
    };

    fetchSubjects();
  }, [user]);

  // Create a standalone fetchNotes function
  const fetchNotes = async (lectureIdParam?: string) => {
    const lectureId = lectureIdParam || (selectedLecture && (selectedLecture.id || selectedLecture._id));

    if (!lectureId) {
      console.error('No valid lecture ID found for fetching notes');
      return;
    }

    try {
      setIsLoadingNotes(true);
      const lectureNotes = await aiService.getNotesByLecture(lectureId as string);

      // Make sure each note has both id and _id for consistency
      const processedNotes = lectureNotes?.map((note: any) => {
        // Ensure each note has an id field that matches its _id
        return {
          ...note,
          id: note.id || note._id, // Use existing id or _id if id doesn't exist
          _id: note._id || note.id // Use existing _id or id if _id doesn't exist
        };
      }) || [];

      setNotes(processedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
      setError('Failed to fetch notes for this lecture');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleFileUpload = (subjectId: string, lectureId: string, file: File) => {
    setSubjectData(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          lectures: subject.lectures.map(lecture => {
            if (lecture.id === lectureId) {
              return { ...lecture, pdfFile: file };
            }
            return lecture;
          })
        };
      }
      return subject;
    }));
  };

  const generateAIContent = async (subjectId: string, lectureId: string) => {
    console.log('generateAIContent called with:', { subjectId, lectureId });

    // Find the lecture and subject, checking both id and _id properties
    const lecture = subjectData.find(s => (s.id === subjectId || s._id === subjectId))?.lectures.find(
      l => (l.id === lectureId || l._id === lectureId)
    );
    const subject = subjectData.find(s => (s.id === subjectId || s._id === subjectId));

    console.log('Found lecture:', lecture);
    console.log('Found subject:', subject);

    if (!lecture || !lecture.pdfFile || !subject) {
      console.error("No PDF file or subject found for the lecture.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProcessingStatus({ status: 'Starting', progress: 0, message: 'Preparing to upload...' });

    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append('file', lecture.pdfFile);
      formData.append('folderName', subject.name);
      formData.append('lectureName', lecture.title); // Add lecture title for new folder structure

      const uploadResponse = await api.post('/api/up/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileId = uploadResponse.data.id;
      if (!fileId) {
        throw new Error('No valid file ID returned from upload');
      }
      setProcessingStatus({ status: 'Uploaded', progress: 10, message: 'File uploaded successfully. Starting analysis...' });


      // Step 2: Start the AI analysis job
      const analyzeResponse = await api.post('/api/ai/analyze-pdf', {
        fileId,
        lectureId,
        subjectId,
        title: lecture.title,
      });

      const { jobId } = analyzeResponse.data;
      if (!jobId) {
        throw new Error('Failed to start analysis job.');
      }
      setJobId(jobId);

      // Step 3: Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await api.get(`/api/ai/job-status/${jobId}`);
          const { status, progress, message, data } = statusResponse.data;

          setProcessingStatus({ status, progress, message });

          if (status === 'completed' || status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setJobId(null);

            if (status === 'completed') {
              // Refetch content to update UI
              const content = await loadLectureContent(lectureId);
              if (content) {
                updateLectureWithContent(subjectId, lectureId, content, fileId);
              }
            } else if (status === 'failed') {
              setError(`Content generation failed: ${message || 'Unknown error'}`);
            }
          }
        } catch (error) {
          console.error("Error checking job status:", error);
          setError("Failed to check processing status.");
          clearInterval(pollInterval);
          setIsGenerating(false);
          setJobId(null);
        }
      }, 3000); // Poll every 3 seconds

    } catch (error: any) {
      console.error("Error during AI content generation process:", error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      setIsGenerating(false);
    }
  };

  // Helper function to update lecture with AI content
  const updateLectureWithContent = (subjectId: string, lectureId: string, aiData: any, fileId: string) => {
    const contentToUpdate = aiData.content || aiData;
    setSubjectData(prev => prev.map(subject => {
      if (subject.id === subjectId || subject._id === subjectId) {
        return {
          ...subject,
          lectures: subject.lectures.map(l => {
            if (l.id === lectureId || l._id === lectureId) {
              return {
                ...l,
                summary: contentToUpdate.summary,
                flashcards: contentToUpdate.flashcards,
                examQuestions: contentToUpdate.examQuestions,
                revision: contentToUpdate.revision,
                fileId: fileId,
                contentId: contentToUpdate._id
              };
            }
            return l;
          })
        };
      }
      return subject;
    }));

    // Also update selected lecture to show new content immediately
    setSelectedLecture(prev => prev ? {
      ...prev,
      summary: contentToUpdate.summary,
      flashcards: contentToUpdate.flashcards,
      examQuestions: contentToUpdate.examQuestions,
      revision: contentToUpdate.revision,
      fileId: fileId,
      contentId: contentToUpdate._id
    } : null);

    setIsGenerating(false);
  };

  // Function to load previously generated content
  const loadLectureContent = async (lectureId: string) => {
    try {
      console.log(`Loading lecture content for lectureId: ${lectureId}`);
      const response = await api.get(`/api/ai/lecture-content/${lectureId}`);
      console.log('Lecture content response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error loading lecture content:", error);
      return null;
    }
  };

  // Update the selectLecture function to fetch notes
  const selectLecture = async (lecture: LectureData) => {
    try {
      setSelectedLecture(lecture);
      setActiveView('summary');

      // Get the lecture ID, checking both id and _id properties
      const lectureId = lecture?.id || lecture?._id;

      if (lectureId) {
        // If the lecture has a contentId but no loaded content, fetch it
        if (lecture.contentId && (!lecture.summary || !lecture.flashcards)) {
          const content = await loadLectureContent(lectureId as string);
          if (content) {
            // Update the lecture with the loaded content
            const subject = subjectData.find(s => s.lectures.some(l => (l.id || l._id) === lectureId));
            if (subject) {
              const subjectId = subject.id || subject._id || '';
              updateLectureWithContent(subjectId, lectureId as string, content, lecture.fileId || '');
            }
          }
        }

        // Fetch notes for this lecture
        await fetchNotes(lectureId as string);
      }

      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error selecting lecture:', error);
      setError('Failed to load lecture content');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddSubject = async (name: string) => {
    try {
      console.log('Adding subject with name:', name);
      const response = await api.post('/api/subjects', { name });
      console.log('Subject added successfully:', response.data);
      const newSubject = response.data;
      setSubjectData([...subjectData, newSubject]);
    } catch (error: any) {
      console.error("Error adding subject:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add subject';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEditSubject = (id: string, newName: string) => {
    setSubjectData(
      subjectData.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
    setEditingSubject(null);
  };

  const handleAddLecture = async (subjectId: string, title: string) => {
    try {
      console.log('Adding lecture with title:', title, 'to subject:', subjectId);
      const response = await api.post(`/api/subjects/${subjectId}/lectures`, { title });
      console.log('Lecture added successfully:', response.data);
      const newLecture = response.data;

      setSubjectData(
        subjectData.map((s) =>
          (s.id === subjectId || s._id === subjectId)
            ? { ...s, lectures: [...s.lectures, newLecture] }
            : s
        )
      );
    } catch (error: any) {
      console.error("Error adding lecture:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add lecture';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEditLecture = async (
    subjectId: string,
    lectureId: string,
    newTitle: string
  ) => {
    try {
      const response = await api.put(`/api/lectures/${lectureId}`, { title: newTitle });
      const updatedLecture = response.data;
      setSubjectData(
        subjectData.map((s) =>
          s.id === subjectId
            ? {
              ...s,
              lectures: s.lectures.map((l) =>
                l.id === lectureId ? updatedLecture : l
              ),
            }
            : s
        )
      );
      setEditingLecture(null);
    } catch (error) {
      console.error("Error editing lecture:", error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      console.log('Deleting subject with ID:', id);
      await api.delete(`/api/subjects/${id}`);
      console.log('Subject deleted successfully');
      // Filter by both id and _id to handle both formats
      setSubjectData(subjectData.filter((s) => s.id !== id && s._id !== id));
    } catch (error: any) {
      console.error("Error deleting subject:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete subject';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteLecture = async (subjectId: string, lectureId: string) => {
    try {
      await api.delete(`/api/lectures/${lectureId}`);
      setSubjectData(
        subjectData.map((s) =>
          s.id === subjectId
            ? { ...s, lectures: s.lectures.filter((l) => l.id !== lectureId) }
            : s
        )
      );
    } catch (error) {
      console.error("Error deleting lecture:", error);
    }
  };

  const SidebarContent = () => (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Library</h1>
        <p className="text-sm text-muted-foreground">Organize and study your university subjects</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Add Subject</Button>
          </DialogTrigger>
          <AddSubjectDialog onAddSubject={handleAddSubject} />
        </Dialog>
      </div>
      <div className="space-y-2">
        {subjectData.map((subject) => (
          <Collapsible
            key={subject.id}
            open={expandedSubjects.has(subject.id)}
            onOpenChange={(isOpen) => {
              const newExpanded = new Set(expandedSubjects);
              if (isOpen) {
                newExpanded.add(subject.id);
              } else {
                newExpanded.delete(subject.id);
              }
              setExpandedSubjects(newExpanded);
            }}
          >
            <div className="flex items-center w-full rounded-lg hover:bg-accent/50 transition-colors pr-2">
              <CollapsibleTrigger className="flex-1 text-left p-3">
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                  <span className="font-medium">{subject.name}</span>
                  <div className="ml-auto">
                    {expandedSubjects.has(subject.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="pl-6 pr-2 space-y-1 mt-1">
                {subject.lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className={`flex items-center justify-between rounded-md p-2 transition-colors ${selectedLecture && (selectedLecture.id === lecture.id || selectedLecture._id === lecture._id)
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                      }`}
                  >
                    <button
                      className="flex-1 text-left flex items-center gap-2"
                      onClick={() => selectLecture(lecture)}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{lecture.title}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectLecture(lecture);
                          setIsNotesOpen(true);
                          handleNewNote();
                        }}
                        title="Take Notes"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          const subject = subjectData.find(s => s.lectures.some(l => l.id === lecture.id));
                          if (subject) {
                            handleEditLecture(subject.id, lecture.id, lecture.title);
                          }
                        }}
                        title="Edit Lecture"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive/70 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          const subject = subjectData.find(s => s.lectures.some(l => l.id === lecture.id));
                          if (subject) {
                            if (window.confirm(`Are you sure you want to delete "${lecture.title}"?`)) {
                              handleDeleteLecture(subject.id, lecture.id);
                            }
                          }
                        }}
                        title="Delete Lecture"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start pl-2 mt-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lecture
                    </Button>
                  </DialogTrigger>
                  <AddLectureDialog
                    subjectId={subject.id}
                    onAddLecture={handleAddLecture}
                  />
                </Dialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );

  const ProcessingStatusIndicator = () => {
    if (!isGenerating || !processingStatus.status) return null;

    return (
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Processing PDF</h3>
            <span className="text-sm text-muted-foreground">{processingStatus.progress || 0}%</span>
          </div>
          <Progress
            value={processingStatus.progress || 0}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground">{processingStatus.message || processingStatus.status}</p>
        </div>
      </Card>
    );
  };

  // Add functions to handle note operations
  // Add a proper interface for the savedNote type
  interface SavedNote extends Note {
    _id?: string;
  }

  // Update the handleSaveNote function to correctly handle the lectureId
  const handleSaveNote = async () => {
    if (!currentNote || !currentNote.title || !selectedLecture) return;

    try {
      // Make sure we have a valid lectureId
      const lectureId = selectedLecture.id || selectedLecture._id;
      if (!lectureId) {
        console.error('No valid lecture ID found');
        return;
      }

      let savedNote: SavedNote;

      // Check if this is a new note by checking if it has an _id property
      // or if the id is a timestamp (new notes use timestamp as temporary id)
      const isNewNote = !currentNote._id && currentNote.id.toString().length < 24;

      if (isNewNote) {
        // This is a new note
        savedNote = await aiService.saveNote({
          title: currentNote.title,
          content: currentNote.content,
          tags: currentNote.tags || [],
          lectureId: lectureId as string
        });

        // Update notes list with the new note
        setNotes(prevNotes => [...prevNotes, savedNote]);
      } else {
        // This is an existing note - use _id if available, otherwise use id
        const noteId = currentNote._id || currentNote.id;
        savedNote = await aiService.updateNote(noteId, {
          title: currentNote.title,
          content: currentNote.content,
          tags: currentNote.tags || []
        });

        // Update notes list with the updated note
        setNotes(prevNotes =>
          prevNotes.map(note => {
            if (note.id === currentNote.id || note._id === currentNote._id) {
              return savedNote;
            }
            return note;
          })
        );
      }

      // Update current note with saved version (includes proper ID from server)
      setCurrentNote(savedNote);

    } catch (error) {
      console.error('Error saving note:', error);
      // Show error message to user
      setError('Failed to save note. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await aiService.deleteNote(noteId);

      // Remove from notes list
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

      // Clear current note if it was the deleted one
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
      }

    } catch (error) {
      console.error('Error deleting note:', error);
      // TODO: Show error message to user
    }
  };

  // Update the handleNewNote function to handle both id and _id
  const handleNewNote = () => {
    if (!selectedLecture) return;

    const lectureId = selectedLecture.id || selectedLecture._id;
    if (!lectureId) {
      console.error('No valid lecture ID found');
      return;
    }

    // Create a new note with a temporary ID (but not a MongoDB ObjectId format)
    setCurrentNote({
      id: `temp_${Date.now()}`, // Prefix with temp to distinguish from MongoDB IDs
      title: '',
      content: '',
      tags: [],
      lectureId: lectureId as string,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Open the notes panel if it's not already open
    if (!isNotesOpen) {
      setIsNotesOpen(true);
    }
  };

  // Find the NotesPanel component and update it to show loading state and improve the UI
  const NotesPanel = () => (
    <Card className="fixed bottom-6 right-6 w-96 shadow-lg border-primary/20 overflow-hidden z-50">
      <CardHeader className="bg-card py-3 px-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {selectedLecture ? `Notes for ${selectedLecture.title}` : 'Notes'}
            </CardTitle>
            {selectedLecture && (
              <CardDescription className="text-xs">
                Save your notes to the cloud
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedLecture && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNewNote}
                title="Add New Note"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsNotesOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoadingNotes ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading notes...</p>
          </div>
        ) : selectedLecture ? (
          <>
            {notes.length > 0 && !currentNote ? (
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-md bg-accent/50 hover:bg-accent cursor-pointer relative group"
                      onClick={() => setCurrentNote(note)}
                    >
                      <h3 className="font-medium text-sm truncate mb-1">{note.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent note selection when clicking delete
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-4">
                  <Input
                    placeholder="Note title"
                    className="mb-2"
                    value={currentNote?.title || ''}
                    onChange={(e) => setCurrentNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                  <Textarea
                    placeholder="Write your notes here..."
                    className="min-h-[200px]"
                    value={currentNote?.content || ''}
                    onChange={(e) => setCurrentNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                  />
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentNote(null)}
                  >
                    {notes.length > 0 ? 'Back to Notes' : 'Cancel'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={!currentNote?.title || !currentNote?.content}
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Lecture Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a lecture to view and create notes.
            </p>
          </div>
        )}
      </CardContent>
      {notes.length > 0 && !currentNote && selectedLecture && (
        <CardFooter className="p-3 border-t border-border flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNotes()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewNote}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  // Add drag functionality for the AI chat panel
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = aiChatPosition.x;
    const startPosY = aiChatPosition.y;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setAIChatPosition({
        x: startPosX + dx,
        y: startPosY + dy
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Update the AI Chat Panel component to be draggable and have a minimize button
  const AIChatPanel = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');

    const handleSendClick = async () => {
      if (inputValue.trim() && !isAILoading && selectedLecture) {
        const message = inputValue;

        // Add user message
        setAIChatMessages((prev) => [
          ...prev,
          { role: 'user', content: message },
        ]);

        // Clear input
        setInputValue('');

        // Set loading state
        setIsAILoading(true);

        try {
          // Get the lecture ID, checking both id and _id properties
          const lectureId = selectedLecture.id || selectedLecture._id;

          if (!lectureId) {
            throw new Error('No valid lecture ID found');
          }

          // Create a simplified lecture content object to pass to the API
          const lectureContent = {
            title: selectedLecture.title,
            summary: selectedLecture.summary,
            flashcards: selectedLecture.flashcards,
            examQuestions: selectedLecture.examQuestions,
            revision: selectedLecture.revision
          };

          // Call the AI service with the message and lecture content
          const response = await aiService.chatWithLecture(
            lectureId as string,
            message,
            lectureContent
          );

          // Add the AI response to the chat
          setAIChatMessages((prev) => [
            ...prev,
            { role: 'assistant', content: response.response || "I'm sorry, I couldn't process your request." },
          ]);
        } catch (error) {
          console.error('Error getting AI response:', error);

          // Add an error message to the chat
          setAIChatMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: "I'm sorry, I encountered an error processing your request. Please try again."
            },
          ]);
        } finally {
          // Clear loading state
          setIsAILoading(false);
        }
      }
    };

    return (
      <Card
        className={`fixed shadow-lg border-primary/20 overflow-hidden z-50 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:shadow-xl' : ''}`}
        style={{
          width: isDesktopSidebarCollapsed ? '400px' : '350px',
          height: isAIChatMinimized ? '50px' : (isDesktopSidebarCollapsed ? '500px' : '450px'),
          top: `${aiChatPosition.y}px`,
          left: `${aiChatPosition.x}px`,
          transition: 'height 0.3s ease, width 0.3s ease'
        }}
      >
        <CardHeader
          className={`bg-card py-2 px-4 border-b border-border cursor-move transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:py-3 lg:px-5' : ''}`}
          ref={dragRef}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-base transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg' : ''}`}>
                {selectedLecture ? `AI Chat: ${selectedLecture.title}` : 'AI Chat'}
              </CardTitle>
              {!isAIChatMinimized && selectedLecture && (
                <CardDescription className={`text-xs transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-sm' : ''}`}>
                  Ask questions about this document
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-8 lg:w-8' : ''}`}
                onClick={() => setIsAIChatMinimized(!isAIChatMinimized)}
              >
                {isAIChatMinimized ? (
                  <Maximize2 className={`h-3.5 w-3.5 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-4 lg:w-4' : ''}`} />
                ) : (
                  <Minimize2 className={`h-3.5 w-3.5 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-4 lg:w-4' : ''}`} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-8 lg:w-8' : ''}`}
                onClick={() => setIsAIChatOpen(false)}
              >
                <X className={`h-3.5 w-3.5 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-4 lg:w-4' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        {!isAIChatMinimized && (
          <CardContent className="p-0">
            <div className={`flex flex-col transition-all duration-300 ${isDesktopSidebarCollapsed ? 'h-[400px]' : 'h-[350px]'}`}>
              <div className={`flex-1 overflow-y-auto mb-4 space-y-4 p-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-6 lg:space-y-6' : ''}`}>
                {aiChatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className={`text-center text-muted-foreground transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:scale-110' : ''}`}>
                      <Bot className={`h-10 w-10 mx-auto mb-3 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-14 lg:w-14 lg:mb-5' : ''}`} />
                      <p className={`transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg' : ''}`}>Ask me questions about this document!</p>
                    </div>
                  </div>
                ) : (
                  aiChatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                          } transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-4 lg:rounded-xl' : ''}`}
                      >
                        <p className={`text-sm transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base' : ''}`}>{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isAILoading && (
                  <div className="flex justify-start">
                    <div className={`max-w-[80%] rounded-lg p-3 bg-accent transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-4 lg:rounded-xl' : ''}`}>
                      <div className="flex space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-primary animate-bounce transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:w-3 lg:h-3' : ''}`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-2 h-2 rounded-full bg-primary animate-bounce transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:w-3 lg:h-3' : ''}`} style={{ animationDelay: '300ms' }}></div>
                        <div className={`w-2 h-2 rounded-full bg-primary animate-bounce transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:w-3 lg:h-3' : ''}`} style={{ animationDelay: '600ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className={`p-4 border-t border-border transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-5' : ''}`}>
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask a question..."
                    disabled={isAILoading || !selectedLecture}
                    className={`flex-1 h-9 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50 ${isDesktopSidebarCollapsed ? 'lg:h-11 lg:text-base lg:px-4' : ''}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendClick();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size={isDesktopSidebarCollapsed ? "default" : "icon"}
                    onClick={handleSendClick}
                    className={isDesktopSidebarCollapsed ? 'lg:px-5' : ''}
                  >
                    <Send className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5 lg:mr-2' : ''}`} />
                    {isDesktopSidebarCollapsed && <span className="hidden lg:inline">Send</span>}
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="dark" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 100%)', backgroundAttachment: 'fixed' }}>
      <div className="min-h-screen text-foreground flex flex-col lg:flex-row">
        {/* Mobile/Tablet Header and Sidebar Trigger */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold">Library</h1>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="glass" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 sm:w-80">
              {SidebarContent()}
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col border-r border-border overflow-hidden transition-all duration-300 ${isDesktopSidebarCollapsed ? 'w-16' : 'w-80'}`}>
          <div className="flex justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarCollapsed(prev => !prev)}
              className="h-8 w-8"
            >
              {isDesktopSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className={`overflow-y-auto ${isDesktopSidebarCollapsed ? 'hidden' : 'block'}`}>
            {SidebarContent()}
          </div>
          {isDesktopSidebarCollapsed && (
            <div className="flex flex-col items-center p-2 space-y-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              {subjectData.map((subject) => (
                <div
                  key={subject.id}
                  className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setIsDesktopSidebarCollapsed(false);
                    if (!expandedSubjects.has(subject.id)) {
                      toggleSubject(subject.id);
                    }
                  }}
                >
                  <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:scale-[1.02] lg:transform-gpu lg:p-8' : ''}`}>
          {selectedLecture ? (
            <div className={`max-w-4xl mx-auto transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:max-w-6xl' : ''}`}>
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-5xl lg:mb-4' : ''}`}>{selectedLecture.title}</h2>
                  {selectedLecture.pdfFile && (
                    <div className={`flex items-center gap-2 text-sm text-muted-foreground mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base' : ''}`}>
                      <FileText className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                      <span>{selectedLecture.pdfFile.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size={isDesktopSidebarCollapsed ? "default" : "sm"}
                    className={`gap-2 shadow-md transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    onClick={() => setIsNotesOpen(true)}
                  >
                    <Edit3 className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                    Open Notes
                  </Button>
                </div>
              </div>

              {/* Upload and Generate Section */}
              {!selectedLecture.summary && (
                <Card className={`mb-6 p-6 text-center bg-accent/30 border-dashed transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-10 lg:mb-10' : ''}`}>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="pdf-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const subject = subjectData.find(s => s.lectures.some(l => l.id === selectedLecture.id));
                        if (subject) {
                          handleFileUpload(subject.id, selectedLecture.id, file);
                          // Also update selectedLecture state to reflect the change immediately
                          setSelectedLecture(prev => prev ? { ...prev, pdfFile: file } : null);
                        }
                      }
                    }}
                  />
                  {!selectedLecture.pdfFile ? (
                    <>
                      <Upload className={`h-10 w-10 mx-auto mb-3 text-muted-foreground transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-16 lg:w-16 lg:mb-5' : ''}`} />
                      <h3 className={`text-lg font-medium mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl lg:mb-4' : ''}`}>Upload Your Lecture</h3>
                      <p className={`text-muted-foreground mb-4 text-sm transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:mb-6' : ''}`}>Upload a PDF to generate AI-powered study materials.</p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:px-6 lg:py-6' : ''}`}
                      >
                        <Upload className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                        Choose PDF
                      </Button>
                    </>
                  ) : (
                    <>
                      <Brain className={`h-10 w-10 mx-auto mb-3 text-muted-foreground transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-16 lg:w-16 lg:mb-5' : ''}`} />
                      <h3 className={`text-lg font-medium mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl lg:mb-4' : ''}`}>Ready to Generate</h3>
                      <p className={`text-muted-foreground mb-4 text-sm transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:mb-6' : ''}`}>Your PDF is uploaded. Now, generate your AI study content.</p>
                      <Button
                        onClick={() => {
                          console.log('Generate button clicked, selectedLecture:', selectedLecture);

                          // Get the lecture ID, checking both id and _id properties
                          const lectureId = selectedLecture?.id || selectedLecture?._id;

                          if (!selectedLecture || !lectureId) {
                            console.error('selectedLecture or lecture ID is missing!');
                            setError('Cannot generate content: lecture ID is missing');
                            return;
                          }

                          const subject = subjectData.find(s => s.lectures.some(l => (l.id || l._id) === lectureId));
                          console.log('Found subject for selectedLecture:', subject);

                          if (subject) {
                            const subjectId = subject.id || subject._id || '';
                            console.log('Calling generateAIContent with:', {
                              subjectId,
                              lectureId
                            });
                            generateAIContent(subjectId, lectureId as string);
                          } else {
                            console.error('Subject not found for lecture:', selectedLecture);
                            setError('Cannot generate content: subject not found');
                          }
                        }}
                        className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:px-6 lg:py-6' : ''}`}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className={`w-4 h-4 border-2 border-background/80 border-t-background rounded-full animate-spin transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:w-5 lg:h-5' : ''}`} />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                            Generate AI Content
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </Card>
              )}

              {error && (
                <Card className={`mb-6 p-4 text-center bg-destructive/20 border-destructive transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-6 lg:mb-8' : ''}`}>
                  <h3 className={`text-lg font-medium text-destructive transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-xl' : ''}`}>Error</h3>
                  <p className={`text-destructive/80 mt-1 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:mt-2' : ''}`}>{error}</p>
                </Card>
              )}

              {/* Show processing status indicator */}
              <ProcessingStatusIndicator />

              {/* AI Generated Content */}
              {selectedLecture.summary && (
                <>
                  <div className={`flex flex-wrap gap-2 mb-6 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:gap-3 lg:mb-8' : ''}`}>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('summary')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <Eye className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Summary
                    </Button>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('flashcards')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <BookOpen className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Flashcards
                    </Button>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('exam')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <HelpCircle className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Exam Questions
                    </Button>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('revision')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <Brain className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Quick Revision
                    </Button>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('notes')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <Edit3 className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Notes
                    </Button>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('srs')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <Zap className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Spaced Repetition
                    </Button>
                    <Button
                      variant="glass"
                      size={isDesktopSidebarCollapsed ? "default" : "sm"}
                      onClick={() => setActiveView('study')}
                      className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:px-6 lg:py-6' : ''}`}
                    >
                      <Clock className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-6 lg:w-6' : ''}`} />
                      Study Tools
                    </Button>
                  </div>

                  <ColoredGlassCard className={`p-6 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-10 lg:rounded-2xl lg:shadow-lg' : ''}`}>
                    {activeView === 'summary' && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-3xl lg:mb-6' : ''}`}>Summary</h3>
                        {Array.isArray(selectedLecture.summary) ? (
                          <ul className={`list-disc pl-6 space-y-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-xl lg:space-y-4 lg:pl-8' : ''}`}>
                            {selectedLecture.summary.map((point, index) => (
                              <li key={index} className={`text-muted-foreground transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:mb-2' : ''}`}>{point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`text-muted-foreground leading-relaxed transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-xl lg:leading-relaxed' : ''}`}>{selectedLecture.summary}</p>
                        )}
                      </div>
                    )}

                    {activeView === 'flashcards' && selectedLecture.flashcards && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-3xl lg:mb-6' : ''}`}>Flashcards</h3>
                        <div className={`relative min-h-[200px] mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:min-h-[300px]' : ''}`}>
                          <ColoredGlassCard
                            className={`p-6 cursor-pointer transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-10 lg:rounded-xl lg:shadow-md hover:shadow-lg' : ''}`}
                            onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                          >
                            {!showFlashcardAnswer ? (
                              <>
                                <div className={`text-sm text-muted-foreground mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:mb-4' : ''}`}>Question ({currentFlashcardIndex + 1}/{selectedLecture.flashcards.length})</div>
                                <p className={`text-lg font-medium transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl lg:font-semibold lg:mb-4' : ''}`}>{selectedLecture.flashcards[currentFlashcardIndex].question}</p>
                                <div className={`text-xs text-muted-foreground mt-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-sm lg:mt-8' : ''}`}>Click to reveal answer</div>
                              </>
                            ) : (
                              <>
                                <div className={`text-sm text-muted-foreground mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:mb-4' : ''}`}>Answer</div>
                                <p className={`text-lg transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl lg:mb-4' : ''}`}>{selectedLecture.flashcards[currentFlashcardIndex].answer}</p>
                                <div className={`text-xs text-muted-foreground mt-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-sm lg:mt-8' : ''}`}>Click to see question</div>
                              </>
                            )}
                          </ColoredGlassCard>
                        </div>

                        <div className={`flex justify-between mt-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:mt-8' : ''}`}>
                          <Button
                            variant="outline"
                            size={isDesktopSidebarCollapsed ? "default" : "sm"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFlashcardIndex(prev =>
                                prev === 0 ? selectedLecture.flashcards!.length - 1 : prev - 1
                              );
                              setShowFlashcardAnswer(false);
                            }}
                            className={`transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:px-6 lg:py-6' : ''}`}
                          >
                            <ChevronLeft className={`h-4 w-4 mr-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size={isDesktopSidebarCollapsed ? "default" : "sm"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFlashcardIndex(prev =>
                                prev === selectedLecture.flashcards!.length - 1 ? 0 : prev + 1
                              );
                              setShowFlashcardAnswer(false);
                            }}
                            className={`transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:px-6 lg:py-6' : ''}`}
                          >
                            Next
                            <ChevronRight className={`h-4 w-4 ml-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                          </Button>
                        </div>
                        <p className={`text-xs text-center text-muted-foreground mt-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-sm lg:mt-4' : ''}`}>
                          Swipe left/right or use buttons to navigate
                        </p>
                      </div>
                    )}

                    {activeView === 'exam' && selectedLecture.examQuestions && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-3xl lg:mb-6' : ''}`}>Potential Exam Questions</h3>
                        <div className={`space-y-6 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:space-y-8' : ''}`}>
                          {selectedLecture.examQuestions.map((item, index) => (
                            <ColoredGlassCard key={index} className={`p-4 border-l-4 border-l-orange-500 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-8 lg:rounded-xl lg:shadow-md' : ''}`}>
                              <h4 className={`font-medium text-lg mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl lg:mb-4' : ''}`}>Question {index + 1}:</h4>
                              <p className={`mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-xl lg:mb-6' : ''}`}>{item.question}</p>

                              <Separator className={`my-3 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:my-5' : ''}`} />

                              <h4 className={`font-medium text-sm text-green-600 mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:mb-3' : ''}`}>Model Answer:</h4>
                              <p className={`text-muted-foreground transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg' : ''}`}>{item.answer}</p>
                            </ColoredGlassCard>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeView === 'revision' && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-3xl lg:mb-6' : ''}`}>Quick Revision</h3>
                        <ColoredGlassCard className={`p-4 bg-accent border-l-4 border-l-purple-500 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-8 lg:rounded-xl lg:shadow-md' : ''}`}>
                          <div className={`space-y-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:space-y-4' : ''}`}>
                            {selectedLecture.revision?.split(/\n|\r/).map((paragraph, idx) => (
                              paragraph.trim() && (
                                <p key={idx} className={`leading-relaxed transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-xl lg:leading-relaxed' : ''}`}>
                                  {paragraph.replace(/\*\*/g, '')}
                                </p>
                              )
                            ))}
                          </div>
                        </ColoredGlassCard>
                      </div>
                    )}

                    {activeView === 'notes' && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-3xl lg:mb-6' : ''}`}>Advanced Notes</h3>
                        <div className={`mb-4 flex justify-between transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:mb-6' : ''}`}>
                          <h4 className={`text-lg font-medium transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl' : ''}`}>My Notes</h4>
                          <Button
                            variant="outline"
                            size={isDesktopSidebarCollapsed ? "default" : "sm"}
                            className={`gap-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-lg lg:px-6 lg:py-6' : ''}`}
                            onClick={() => {
                              setCurrentNote({
                                id: `temp_${Date.now()}`,
                                title: '',
                                content: '',
                                tags: [],
                                lectureId: selectedLecture?.id || selectedLecture?._id || '',
                                createdAt: new Date(),
                                updatedAt: new Date()
                              });
                              setNoteContent('');
                              setActiveNoteId(null);
                            }}
                          >
                            <Plus className={`h-4 w-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-5 lg:w-5' : ''}`} />
                            New Note
                          </Button>
                        </div>

                        <div className={`grid gap-4 md:grid-cols-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:gap-6' : ''}`}>
                          {notes.length > 0 ? (
                            notes.map((note) => (
                              <ColoredGlassCard key={note.id} className={`p-4 ${activeNoteId === note.id ? 'border-2 border-primary' : ''} transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-6 lg:rounded-xl hover:shadow-md' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className={`font-medium transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-xl' : ''}`}>{note.title}</h5>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-7 w-7 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-9 lg:w-9' : ''}`}
                                      onClick={() => {
                                        setCurrentNote(note);
                                        setNoteContent(note.content);
                                        setActiveNoteId(note.id);
                                      }}
                                    >
                                      <Edit3 className={`h-3.5 w-3.5 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-4.5 lg:w-4.5' : ''}`} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-7 w-7 text-destructive hover:text-destructive transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-9 lg:w-9' : ''}`}
                                      onClick={() => handleDeleteNote(note.id)}
                                    >
                                      <Trash2 className={`h-3.5 w-3.5 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-4.5 lg:w-4.5' : ''}`} />
                                    </Button>
                                  </div>
                                </div>
                                <p className={`text-sm text-muted-foreground line-clamp-3 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-base lg:line-clamp-4' : ''}`}>{note.content}</p>
                                {note.tags && note.tags.length > 0 && (
                                  <div className={`flex flex-wrap gap-1 mt-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:mt-4 lg:gap-2' : ''}`}>
                                    {note.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className={`text-xs transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-sm lg:px-3 lg:py-1' : ''}`}>
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </ColoredGlassCard>
                            ))
                          ) : (
                            <div className={`col-span-2 text-center p-8 text-muted-foreground transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:p-12 lg:text-lg' : ''}`}>
                              <Edit3 className={`h-8 w-8 mx-auto mb-2 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:h-12 lg:w-12 lg:mb-4' : ''}`} />
                              <p>No notes yet. Create your first note!</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-6" id="advanced-note-editor">
                          <h4 className="text-lg font-medium mb-4">
                            {activeNoteId ? `Editing: ${currentNote?.title}` : 'New Note'}
                          </h4>
                          <ColoredGlassCard className="p-4 min-h-[300px]">
                            <div className="mb-4">
                              <Input
                                placeholder="Note title"
                                className="mb-4"
                                value={currentNote?.title || ''}
                                onChange={(e) => {
                                  const newTitle = e.target.value;
                                  if (currentNote) {
                                    setCurrentNote({
                                      ...currentNote,
                                      title: newTitle
                                    });
                                  } else {
                                    // Create a new note if one doesn't exist
                                    setCurrentNote({
                                      id: `temp_${Date.now()}`,
                                      title: newTitle,
                                      content: noteContent,
                                      tags: [],
                                      lectureId: selectedLecture?.id || selectedLecture?._id || '',
                                      createdAt: new Date(),
                                      updatedAt: new Date()
                                    });
                                  }
                                }}
                              />
                              <div className="flex gap-2 mb-4 flex-wrap">
                                <Button variant="outline" size="sm" onClick={() => {
                                  const textarea = document.getElementById('advanced-note-textarea') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const selection = text.substring(start, end);
                                    const after = text.substring(end);
                                    const newText = `${before}**${selection}**${after}`;
                                    setNoteContent(newText);
                                    if (currentNote) {
                                      setCurrentNote({ ...currentNote, content: newText });
                                    }
                                  }
                                }}>Bold</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  const textarea = document.getElementById('advanced-note-textarea') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const selection = text.substring(start, end);
                                    const after = text.substring(end);
                                    const newText = `${before}*${selection}*${after}`;
                                    setNoteContent(newText);
                                    if (currentNote) {
                                      setCurrentNote({ ...currentNote, content: newText });
                                    }
                                  }
                                }}>Italic</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  const textarea = document.getElementById('advanced-note-textarea') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const selection = text.substring(start, end);
                                    const after = text.substring(end);
                                    const newText = `${before}\n- ${after}`;
                                    setNoteContent(newText);
                                    if (currentNote) {
                                      setCurrentNote({ ...currentNote, content: newText });
                                    }
                                  }
                                }}>List</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  const textarea = document.getElementById('advanced-note-textarea') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const selection = text.substring(start, end);
                                    const after = text.substring(end);
                                    const newText = `${before}\`${selection}\`${after}`;
                                    setNoteContent(newText);
                                    if (currentNote) {
                                      setCurrentNote({ ...currentNote, content: newText });
                                    }
                                  }
                                }}>Code</Button>
                              </div>
                            </div>
                            <textarea
                              id="advanced-note-textarea"
                              className="w-full min-h-[200px] bg-transparent border border-border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Start typing your notes here..."
                              value={noteContent}
                              onChange={(e) => {
                                setNoteContent(e.target.value);
                                if (currentNote) {
                                  setCurrentNote({ ...currentNote, content: e.target.value });
                                }
                              }}
                            />
                            <div className="flex justify-between mt-4">
                              <Input
                                placeholder="Add tags (comma separated)"
                                className="max-w-[300px]"
                                value={currentNote?.tags?.join(', ') || ''}
                                onChange={(e) => {
                                  const tagsString = e.target.value;
                                  const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
                                  if (currentNote) {
                                    setCurrentNote({ ...currentNote, tags: tagsArray });
                                  }
                                }}
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    setCurrentNote({
                                      id: `temp_${Date.now()}`,
                                      title: '',
                                      content: '',
                                      tags: [],
                                      lectureId: selectedLecture?.id || selectedLecture?._id || '',
                                      createdAt: new Date(),
                                      updatedAt: new Date()
                                    });
                                    setNoteContent('');
                                    setActiveNoteId(null);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                  Clear
                                </Button>
                                <Button
                                  className="gap-2"
                                  onClick={handleSaveNote}
                                  disabled={!currentNote?.title || !currentNote?.content}
                                >
                                  <Save className="h-4 w-4" />
                                  Save Note
                                </Button>
                              </div>
                            </div>
                          </ColoredGlassCard>
                        </div>
                      </div>
                    )}

                    {activeView === 'srs' && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl' : ''}`}>Spaced Repetition System</h3>

                        <div className="grid gap-6 md:grid-cols-2 mb-6">
                          <ColoredGlassCard className="p-4">
                            <h4 className="text-lg font-medium mb-2">Today's Review</h4>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-2xl font-bold">{srsCards.filter(card => new Date(card.nextReview) <= new Date()).length}</span>
                              </div>
                              <div>
                                <p className="font-medium">Cards due today</p>
                                <p className="text-sm text-muted-foreground">Keep your streak going!</p>
                              </div>
                            </div>
                            <Button className="w-full gap-2">
                              <Zap className="h-4 w-4" />
                              Start Review Session
                            </Button>
                          </ColoredGlassCard>

                          <ColoredGlassCard className="p-4">
                            <h4 className="text-lg font-medium mb-2">Statistics</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Cards</span>
                                <span className="font-medium">{srsCards.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Mastered</span>
                                <span className="font-medium">{srsCards.filter(card => card.easeFactor > 2.5).length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Learning</span>
                                <span className="font-medium">{srsCards.filter(card => card.easeFactor <= 2.5 && card.easeFactor > 1.5).length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Difficult</span>
                                <span className="font-medium">{srsCards.filter(card => card.easeFactor <= 1.5).length}</span>
                              </div>
                            </div>
                          </ColoredGlassCard>
                        </div>

                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium">My Flashcards</h4>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Plus className="h-4 w-4" />
                              Create Flashcard
                            </Button>
                          </div>

                          {srsCards.length > 0 ? (
                            <div className="space-y-4">
                              {srsCards.slice(0, 5).map((card) => (
                                <ColoredGlassCard key={card.id} className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium mb-1">{card.front}</p>
                                      <p className="text-sm text-muted-foreground">{card.back}</p>
                                    </div>
                                    <Badge variant={card.difficulty < 3 ? "destructive" : card.difficulty > 3 ? "secondary" : "outline"}>
                                      {card.difficulty < 3 ? "Hard" : card.difficulty > 3 ? "Easy" : "Medium"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-muted-foreground">
                                      Next review: {new Date(card.nextReview).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                      <Button variant="ghost" size="sm">Edit</Button>
                                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                                    </div>
                                  </div>
                                </ColoredGlassCard>
                              ))}
                            </div>
                          ) : (
                            <ColoredGlassCard className="p-6 text-center">
                              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <h4 className="text-lg font-medium mb-2">No Flashcards Yet</h4>
                              <p className="text-muted-foreground mb-4">Create your first flashcard to start learning with spaced repetition.</p>
                              <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Flashcard
                              </Button>
                            </ColoredGlassCard>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-4">Auto-Generate Flashcards</h4>
                          <ColoredGlassCard className="p-4">
                            <p className="text-muted-foreground mb-4">Let AI create flashcards from your lecture content or notes.</p>
                            <div className="flex gap-4 flex-wrap">
                              <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                From PDF Content
                              </Button>
                              <Button variant="outline" className="gap-2">
                                <Edit3 className="h-4 w-4" />
                                From My Notes
                              </Button>
                              <Button variant="outline" className="gap-2">
                                <BookOpen className="h-4 w-4" />
                                From Summary
                              </Button>
                            </div>
                          </ColoredGlassCard>
                        </div>
                      </div>
                    )}

                    {activeView === 'qa' && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl' : ''}`}>Ask Your Document</h3>

                        <div className="mb-6">
                          <ColoredGlassCard className="p-4 min-h-[400px] flex flex-col">
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                              {qaSession && qaSession.messages.length > 0 ? (
                                qaSession.messages.map((message, index) => (
                                  <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div
                                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-primary/20 text-foreground'
                                        : 'bg-accent/30 text-foreground'
                                        }`}
                                    >
                                      <p>{message.content}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                  <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
                                  <h4 className="text-lg font-medium mb-2">Ask anything about this document</h4>
                                  <p className="text-muted-foreground">
                                    The AI will answer questions based on the content of this lecture.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Input
                                placeholder="Ask a question about this document..."
                                value={qaQuestion}
                                onChange={(e) => setQAQuestion(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                disabled={isProcessingQA || !qaQuestion.trim()}
                                className="gap-2"
                              >
                                {isProcessingQA ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4" />
                                    Send
                                  </>
                                )}
                              </Button>
                            </div>
                          </ColoredGlassCard>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-4">Suggested Questions</h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            <Button variant="outline" className="justify-start h-auto py-2 px-4">
                              What are the key concepts in this lecture?
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-2 px-4">
                              Can you explain the most difficult part in simpler terms?
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-2 px-4">
                              What are the practical applications of this knowledge?
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-2 px-4">
                              How does this relate to other topics we've studied?
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeView === 'learning-path' && (
                      <div>
                        <h3 className={`text-xl font-semibold mb-4 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:text-2xl' : ''}`}>Personalized Learning Path</h3>

                        <div className="mb-6">
                          <ColoredGlassCard className="p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-medium">Your Progress</h4>
                              <Button variant="outline" size="sm" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Refresh Analysis
                              </Button>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Overall Mastery</span>
                                <span className="text-sm font-medium">{learningPath?.progress || 0}%</span>
                              </div>
                              <Progress value={learningPath?.progress || 0} className="h-2" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 mb-4">
                              <div className="p-3 bg-accent/30 rounded-lg">
                                <h5 className="font-medium mb-1 flex items-center gap-2">
                                  <Target className="h-4 w-4 text-green-500" />
                                  Strengths
                                </h5>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  <li>Understanding core concepts</li>
                                  <li>Applying theoretical knowledge</li>
                                </ul>
                              </div>

                              <div className="p-3 bg-accent/30 rounded-lg">
                                <h5 className="font-medium mb-1 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  Areas to Improve
                                </h5>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  <li>Complex problem solving</li>
                                  <li>Recalling specific details</li>
                                </ul>
                              </div>
                            </div>
                          </ColoredGlassCard>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-4">Recommended Learning Path</h4>

                          {learningPath && learningPath.topics.length > 0 ? (
                            <div className="space-y-4">
                              {learningPath.topics.map((topic, index) => (
                                <ColoredGlassCard
                                  key={index}
                                  className={`p-4 border-l-4 ${topic.priority === 'high'
                                    ? 'border-l-red-500'
                                    : topic.priority === 'medium'
                                      ? 'border-l-amber-500'
                                      : 'border-l-green-500'
                                    }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium">{topic.title}</h5>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        Priority: {topic.priority.charAt(0).toUpperCase() + topic.priority.slice(1)}
                                      </p>
                                    </div>
                                    <Badge variant={
                                      topic.status === 'completed'
                                        ? 'secondary'
                                        : topic.status === 'in-progress'
                                          ? 'outline'
                                          : 'default'
                                    }>
                                      {topic.status === 'completed'
                                        ? 'Completed'
                                        : topic.status === 'in-progress'
                                          ? 'In Progress'
                                          : 'Not Started'}
                                    </Badge>
                                  </div>

                                  <div className="mt-2">
                                    <h6 className="text-sm font-medium mb-1">Resources:</h6>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                      {topic.resources.map((resource, idx) => (
                                        <li key={idx}>{resource}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="flex justify-end mt-4">
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Mark as Completed
                                    </Button>
                                  </div>
                                </ColoredGlassCard>
                              ))}
                            </div>
                          ) : (
                            <ColoredGlassCard className="p-6 text-center">
                              <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <h4 className="text-lg font-medium mb-2">No Learning Path Yet</h4>
                              <p className="text-muted-foreground mb-4">
                                Complete some quizzes or flashcard sessions to generate your personalized learning path.
                              </p>
                              <Button className="gap-2">
                                <Zap className="h-4 w-4" />
                                Generate Learning Path
                              </Button>
                            </ColoredGlassCard>
                          )}
                        </div>
                      </div>
                    )}

                    {activeView === 'study' && selectedLecture.flashcards && selectedLecture.examQuestions && (
                      <StudyTools
                        summary={selectedLecture.summary || ''}
                        flashcards={selectedLecture.flashcards}
                        examQuestions={selectedLecture.examQuestions}
                        revision={selectedLecture.revision || ''}
                      />
                    )}

                    {activeView === 'premium' && selectedLecture.flashcards && selectedLecture.examQuestions && (
                      <PremiumStudySession
                        lectureId={selectedLecture.id}
                        lectureTitle={selectedLecture.title}
                        summary={selectedLecture.summary || ''}
                        flashcards={selectedLecture.flashcards}
                        examQuestions={selectedLecture.examQuestions}
                        revision={selectedLecture.revision || ''}
                      />
                    )}
                  </ColoredGlassCard>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen className="h-16 w-16 mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Select a Lecture</h2>
              <p className="text-muted-foreground">Choose a lecture from the sidebar to view its content.</p>
              <p className="text-sm text-muted-foreground mt-2">You can upload PDFs, generate AI summaries, and create study materials.</p>
            </div>
          )}
        </div>

        {isNotesOpen && (
          <div className="fixed bottom-6 right-6 z-40">
            <div className="bg-card border border-border rounded-lg shadow-lg w-80 md:w-96 h-96 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/50 flex justify-between items-center">
                <h3 className="font-medium">Quick Notes</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNewNote()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsNotesOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Notes list */}
                <div className="w-1/3 border-r border-border overflow-y-auto p-2">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-2 rounded-md cursor-pointer mb-1 relative group ${currentNote?.id === note.id ? 'bg-accent' : 'hover:bg-muted'}`}
                        onClick={() => setCurrentNote(note)}
                      >
                        <p className="font-medium text-sm truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{new Date(note.updatedAt).toLocaleDateString()}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <p className="text-sm text-muted-foreground">No notes yet</p>
                    </div>
                  )}
                </div>

                {/* Note editor */}
                <div className="w-2/3 flex flex-col p-2">
                  <input
                    type="text"
                    placeholder="Title"
                    className="bg-transparent border-b border-border p-2 mb-2 focus:outline-none"
                    value={currentNote?.title || ''}
                    onChange={(e) => setCurrentNote(prev => prev ? { ...prev, title: e.target.value } : { id: Date.now().toString(), title: e.target.value, content: '', tags: [], lectureId: selectedLecture?.id || '', createdAt: new Date(), updatedAt: new Date() })}
                  />
                  <textarea
                    placeholder="Start typing your notes here..."
                    className="flex-1 bg-transparent p-2 resize-none focus:outline-none"
                    value={currentNote?.content || ''}
                    onChange={(e) => setCurrentNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="text"
                      placeholder="Add tags (comma separated)"
                      className="bg-transparent border border-border rounded-md p-1 text-xs w-2/3"
                    />
                    <Button size="sm" disabled={!currentNote?.title} onClick={handleSaveNote}>Save</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add the AI Chat Panel component */}
        {isAIChatOpen && <AIChatPanel />}

        {/* Add a floating button for AI chat */}
        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-6 ${isNotesOpen ? 'right-[26rem]' : 'right-[6.5rem]'} h-12 w-12 rounded-full shadow-lg z-40 transition-all duration-300`}
          onClick={() => setIsAIChatOpen(true)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

interface AddSubjectDialogProps {
  onAddSubject: (name: string) => void;
}

const AddSubjectDialog: React.FC<AddSubjectDialogProps> = ({ onAddSubject }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddSubject(name.trim());
      setName('');
    }
  };

  return (
    <DialogContent className="bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-white text-xl">Add New Subject</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Subject name (e.g., Quantum Physics)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="my-4 bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary-400"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Add Subject</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

interface EditSubjectDialogProps {
  subject: Subject;
  onEditSubject: (id: string, newName: string) => void;
}

const EditSubjectDialog: React.FC<EditSubjectDialogProps> = ({ subject, onEditSubject }) => {
  const [newName, setNewName] = useState(subject.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== subject.name) {
      onEditSubject(subject.id, newName.trim());
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Save Changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteSubjectDialogProps {
  subject: Subject;
  onDeleteSubject: (id: string) => void;
}

const DeleteSubjectDialog: React.FC<DeleteSubjectDialogProps> = ({ subject, onDeleteSubject }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
      </DialogHeader>
      <p>This will permanently delete the subject "{subject.name}" and all its lectures. This action cannot be undone.</p>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant="destructive" onClick={() => onDeleteSubject(subject.id)}>Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface AddLectureDialogProps {
  subjectId: string;
  onAddLecture: (subjectId: string, title: string) => void;
}

const AddLectureDialog: React.FC<AddLectureDialogProps> = ({ subjectId, onAddLecture }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddLecture(subjectId, title.trim());
      setTitle('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">Add Lecture</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Lecture title (e.g., Week 1: Introduction)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Add Lecture</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface EditLectureDialogProps {
  lecture: LectureData;
  subjectId: string;
  onEditLecture: (subjectId: string, lectureId: string, newTitle: string) => void;
}

const EditLectureDialog: React.FC<EditLectureDialogProps> = ({ lecture, subjectId, onEditLecture }) => {
  const [newTitle, setNewTitle] = useState(lecture.title);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newTitle.trim() !== lecture.title) {
      onEditLecture(subjectId, lecture.id, newTitle.trim());
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lecture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Save Changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteLectureDialogProps {
  lecture: LectureData;
  subjectId: string;
  onDeleteLecture: (subjectId: string, lectureId: string) => void;
}

const DeleteLectureDialog: React.FC<DeleteLectureDialogProps> = ({ lecture, subjectId, onDeleteLecture }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
      </DialogHeader>
      <p>This will permanently delete the lecture "{lecture.title}". This action cannot be undone.</p>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant="destructive" onClick={() => onDeleteLecture(subjectId, lecture.id)}>Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default LibraryPage; 
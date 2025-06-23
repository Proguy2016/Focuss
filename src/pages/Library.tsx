import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Upload, FileText, Brain, BookOpen, HelpCircle, Eye, Menu, X, Trash2, Sparkles, ChevronLeft, Clock, LineChart, Target, Pencil } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
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

const LibraryPage: React.FC<LibraryPageProps> = ({
  subjects,
}) => {
  const [subjectData, setSubjectData] = useState<Subject[]>(subjects || []);
  const [selectedLecture, setSelectedLecture] = useState<LectureData | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'flashcards' | 'exam' | 'revision' | 'study' | 'premium'>('summary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPremiumEnabled, setIsPremiumEnabled] = useState<boolean>(false);
  const { user } = useAuth();

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

  // Modify selectLecture to check for existing content
  const selectLecture = async (lecture: LectureData) => {
    setSelectedLecture(lecture);
    setActiveView('summary');

    // Get the lecture ID, checking both id and _id properties
    const lectureId = lecture.id || lecture._id;

    // If the lecture has a contentId but no loaded content, fetch it
    if (lecture.contentId && (!lecture.summary || !lecture.flashcards) && lectureId) {
      try {
        const content = await loadLectureContent(lectureId);
        if (content) {
          // Update the lecture with the loaded content
          const subject = subjectData.find(s => s.lectures.some(l => (l.id || l._id) === lectureId));
          if (subject) {
            const subjectId = subject.id || subject._id || '';
            updateLectureWithContent(subjectId, lectureId, content, lecture.fileId || '');
          }
        }
      } catch (error) {
        console.error("Error loading lecture content:", error);
      }
    }

    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
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
        <AddSubjectDialog onAddSubject={handleAddSubject} />
      </div>

      <div className="space-y-2">
        {subjectData.map((subject) => (
          <Collapsible
            key={subject.id}
            open={expandedSubjects.has(subject.id)}
            onOpenChange={() => toggleSubject(subject.id)}
          >
            <div className="flex items-center w-full rounded-lg hover:bg-accent/50 transition-colors pr-2">
              <CollapsibleTrigger asChild>
                <button className="flex-1 text-left p-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                    <span className="font-medium">{subject.name}</span>
                    <div className="ml-auto">
                      {expandedSubjects.has(subject.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <div className="flex items-center">
                <EditSubjectDialog subject={subject} onEditSubject={handleEditSubject} />
                <DeleteSubjectDialog subject={subject} onDeleteSubject={handleDeleteSubject} />
              </div>
            </div>
            <CollapsibleContent className="ml-6 mt-2 space-y-1">
              {subject.lectures.map((lecture) => (
                <ColoredGlassCard
                  key={lecture.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => selectLecture(lecture)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lecture.title}</span>
                    </div>
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <EditLectureDialog lecture={lecture} subjectId={subject.id} onEditLecture={handleEditLecture} />
                      <DeleteLectureDialog lecture={lecture} subjectId={subject.id} onDeleteLecture={handleDeleteLecture} />
                      <div className="flex gap-1">
                        {lecture.pdfFile && (
                          <Badge key="pdf-badge" variant="secondary" className="text-xs">PDF</Badge>
                        )}
                        {lecture.summary && (
                          <Badge key="ai-badge" variant="outline" className="text-xs">AI</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </ColoredGlassCard>
              ))}
              <AddLectureDialog subjectId={subject.id} onAddLecture={handleAddLecture} />
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
        <div className="hidden lg:block w-80 border-r border-border overflow-y-auto">
          {SidebarContent()}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedLecture ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedLecture.title}</h2>
                  {selectedLecture.pdfFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <FileText className="h-4 w-4" />
                      <span>{selectedLecture.pdfFile.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Button variant="premium" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Premium Study Session
                  </Button>
                </div>
              </div>

              {/* Upload and Generate Section */}
              {!selectedLecture.summary && (
                <Card className="mb-6 p-6 text-center bg-accent/30 border-dashed">
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
                      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Upload Your Lecture</h3>
                      <p className="text-muted-foreground mb-4 text-sm">Upload a PDF to generate AI-powered study materials.</p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose PDF
                      </Button>
                    </>
                  ) : (
                    <>
                      <Brain className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                      <p className="text-muted-foreground mb-4 text-sm">Your PDF is uploaded. Now, generate your AI study content.</p>
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
                        className="gap-2"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-background/80 border-t-background rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate AI Content
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </Card>
              )}

              {error && (
                <Card className="mb-6 p-4 text-center bg-destructive/20 border-destructive">
                  <h3 className="text-lg font-medium text-destructive">Error</h3>
                  <p className="text-destructive/80 mt-1">{error}</p>
                </Card>
              )}

              {/* Show processing status indicator */}
              <ProcessingStatusIndicator />

              {/* AI Generated Content */}
              {selectedLecture.summary && (
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setActiveView('summary')}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Summary
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setActiveView('flashcards')}
                      className="gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Flashcards
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setActiveView('exam')}
                      className="gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Exam Questions
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setActiveView('revision')}
                      className="gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Quick Revision
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setActiveView('study')}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Study Tools
                    </Button>
                    <Button
                      variant="premium"
                      size="sm"
                      onClick={() => setActiveView('premium')}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Premium Session
                    </Button>
                  </div>

                  <ColoredGlassCard className="p-6">
                    {activeView === 'summary' && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Summary</h3>
                        {Array.isArray(selectedLecture.summary) ? (
                          <ul className="list-disc pl-6 space-y-2">
                            {selectedLecture.summary.map((point, index) => (
                              <li key={index} className="text-muted-foreground">{point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">{selectedLecture.summary}</p>
                        )}
                      </div>
                    )}

                    {activeView === 'flashcards' && selectedLecture.flashcards && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Flashcards</h3>
                        <div className="relative min-h-[200px] mb-4">
                          <ColoredGlassCard
                            className="p-6 cursor-pointer"
                            onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                          >
                            {!showFlashcardAnswer ? (
                              <>
                                <div className="text-sm text-muted-foreground mb-2">Question ({currentFlashcardIndex + 1}/{selectedLecture.flashcards.length})</div>
                                <p className="text-lg font-medium">{selectedLecture.flashcards[currentFlashcardIndex].question}</p>
                                <div className="text-xs text-muted-foreground mt-4">Click to reveal answer</div>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-muted-foreground mb-2">Answer</div>
                                <p className="text-lg">{selectedLecture.flashcards[currentFlashcardIndex].answer}</p>
                                <div className="text-xs text-muted-foreground mt-4">Click to see question</div>
                              </>
                            )}
                          </ColoredGlassCard>
                        </div>

                        <div className="flex justify-between mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFlashcardIndex(prev =>
                                prev === 0 ? selectedLecture.flashcards!.length - 1 : prev - 1
                              );
                              setShowFlashcardAnswer(false);
                            }}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFlashcardIndex(prev =>
                                prev === selectedLecture.flashcards!.length - 1 ? 0 : prev + 1
                              );
                              setShowFlashcardAnswer(false);
                            }}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Swipe left/right or use buttons to navigate
                        </p>
                      </div>
                    )}

                    {activeView === 'exam' && selectedLecture.examQuestions && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Potential Exam Questions</h3>
                        <div className="space-y-6">
                          {selectedLecture.examQuestions.map((item, index) => (
                            <ColoredGlassCard key={index} className="p-4 border-l-4 border-l-orange-500">
                              <h4 className="font-medium text-lg mb-2">Question {index + 1}:</h4>
                              <p className="mb-4">{item.question}</p>

                              <Separator className="my-3" />

                              <h4 className="font-medium text-sm text-green-600 mb-2">Model Answer:</h4>
                              <p className="text-muted-foreground">{item.answer}</p>
                            </ColoredGlassCard>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeView === 'revision' && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Quick Revision</h3>
                        <ColoredGlassCard className="p-4 bg-accent border-l-4 border-l-purple-500">
                          <p className="leading-relaxed">{selectedLecture.revision}</p>
                        </ColoredGlassCard>
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
      // Close dialog if it's open
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4">Add Subject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Subject name (e.g., Quantum Physics)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Add Subject</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
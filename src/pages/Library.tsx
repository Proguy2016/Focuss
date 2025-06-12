import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Upload, FileText, Brain, BookOpen, HelpCircle, Eye, Menu, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LectureData {
  id: string;
  title: string;
  pdfFile?: File;
  summary?: string;
  flashcards?: Array<{ question: string; answer: string }>;
  examQuestions?: string[];
  revision?: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  lectures: LectureData[];
}

interface LibraryPageProps {
  subjects?: Subject[];
}

const LibraryPage: React.FC<LibraryPageProps> = ({
  subjects = [
    {
      id: '1',
      name: 'APT',
      color: 'bg-blue-500',
      lectures: [
        {
          id: '1-1',
          title: 'Lecture 1',
          summary: 'Introduction to Advanced Programming Techniques covering basic concepts and methodologies.',
          flashcards: [
            { question: 'What is APT?', answer: 'Advanced Programming Techniques' },
            { question: 'Key programming paradigms?', answer: 'OOP, Functional, Procedural' }
          ],
          examQuestions: ['Explain the concept of polymorphism', 'Compare different programming paradigms'],
          revision: 'APT focuses on advanced programming concepts including design patterns, algorithms, and software architecture principles.'
        },
        { id: '1-2', title: 'Lecture 2' },
        { id: '1-3', title: 'Lecture 3' }
      ]
    },
    {
      id: '2',
      name: 'OS',
      color: 'bg-green-500',
      lectures: [
        {
          id: '2-1',
          title: 'Lecture 1',
          summary: 'Operating Systems fundamentals including process management and memory allocation.',
          flashcards: [
            { question: 'What is an OS?', answer: 'Operating System - manages computer hardware and software resources' },
            { question: 'Types of OS?', answer: 'Batch, Time-sharing, Real-time, Distributed' }
          ],
          examQuestions: ['Describe process scheduling algorithms', 'Explain memory management techniques'],
          revision: 'OS manages system resources, provides interface between user and hardware, handles process scheduling and memory management.'
        },
        { id: '2-2', title: 'Lecture 2' }
      ]
    },
    {
      id: '3',
      name: 'Database Systems',
      color: 'bg-purple-500',
      lectures: [
        { id: '3-1', title: 'Lecture 1' },
        { id: '3-2', title: 'Lecture 2' },
        { id: '3-3', title: 'Lecture 3' },
        { id: '3-4', title: 'Lecture 4' }
      ]
    }
  ]
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [selectedLecture, setSelectedLecture] = useState<LectureData | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'flashcards' | 'exam' | 'revision'>('summary');
  const [subjectData, setSubjectData] = useState<Subject[]>(subjects);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

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

  const generateAIContent = (subjectId: string, lectureId: string) => {
    setSubjectData(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          lectures: subject.lectures.map(lecture => {
            if (lecture.id === lectureId) {
              return {
                ...lecture,
                summary: `AI-generated summary for ${lecture.title} in ${subject.name}. This covers key concepts and important points from the uploaded material.`,
                flashcards: [
                  { question: `What is the main topic of ${lecture.title}?`, answer: `Core concepts in ${subject.name}` },
                  { question: `Key takeaway from ${lecture.title}?`, answer: 'Important principles and applications' }
                ],
                examQuestions: [
                  `Explain the main concepts covered in ${lecture.title}`,
                  `How does ${lecture.title} relate to ${subject.name}?`
                ],
                revision: `Quick revision: ${lecture.title} covers essential topics in ${subject.name} with practical applications and theoretical foundations.`
              };
            }
            return lecture;
          })
        };
      }
      return subject;
    }));
  };

  const selectLecture = (lecture: LectureData) => {
    setSelectedLecture(lecture);
    setActiveView('summary');
    if (window.innerWidth < 1024) { // Close sidebar on mobile/tablet after selecting lecture
      setIsSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Library</h1>
        <p className="text-sm text-muted-foreground">Organize and study your university subjects</p>
      </div>

      <div className="space-y-2">
        {subjectData.map((subject) => (
          <Collapsible
            key={subject.id}
            open={expandedSubjects.has(subject.id)}
            onOpenChange={() => toggleSubject(subject.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto hover:bg-accent"
              >
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
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 mt-2 space-y-1">
              {subject.lectures.map((lecture) => (
                <Card
                  key={lecture.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => selectLecture(lecture)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lecture.title}</span>
                    </div>
                    <div className="flex gap-1">
                      {lecture.pdfFile && (
                        <Badge variant="secondary" className="text-xs">PDF</Badge>
                      )}
                      {lecture.summary && (
                        <Badge variant="outline" className="text-xs">AI</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Mobile/Tablet Header and Sidebar Trigger */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h1 className="text-xl font-bold">Library</h1>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
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
      <div className="hidden lg:block w-80 border-r border-border bg-card overflow-y-auto">
        {SidebarContent()}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedLecture ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">{selectedLecture.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const subjectId = subjectData.find(s =>
                        s.lectures.some(l => l.id === selectedLecture.id)
                      )?.id;
                      if (subjectId) {
                        handleFileUpload(subjectId, selectedLecture.id, file);
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </Button>

                {selectedLecture.pdfFile && (
                  <Button
                    onClick={() => {
                      const subjectId = subjectData.find(s =>
                        s.lectures.some(l => l.id === selectedLecture.id)
                      )?.id;
                      if (subjectId) {
                        generateAIContent(subjectId, selectedLecture.id);
                      }
                    }}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Generate AI Content
                  </Button>
                )}
              </div>

              {selectedLecture.pdfFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <FileText className="h-4 w-4" />
                  <span>Uploaded: {selectedLecture.pdfFile.name}</span>
                </div>
              )}
            </div>

            {selectedLecture.summary && (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    variant={activeView === 'summary' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('summary')}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Summary
                  </Button>
                  <Button
                    variant={activeView === 'flashcards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('flashcards')}
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Flashcards
                  </Button>
                  <Button
                    variant={activeView === 'exam' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('exam')}
                    className="gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Exam Questions
                  </Button>
                  <Button
                    variant={activeView === 'revision' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('revision')}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Quick Revision
                  </Button>
                </div>

                <Card className="p-6">
                  {activeView === 'summary' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Summary</h3>
                      <p className="text-muted-foreground leading-relaxed">{selectedLecture.summary}</p>
                    </div>
                  )}

                  {activeView === 'flashcards' && selectedLecture.flashcards && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Flashcards</h3>
                      <div className="space-y-4">
                        {selectedLecture.flashcards.map((card, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                            <div className="mb-2">
                              <span className="font-medium text-sm text-blue-600">Question:</span>
                              <p className="mt-1">{card.question}</p>
                            </div>
                            <Separator className="my-3" />
                            <div>
                              <span className="font-medium text-sm text-green-600">Answer:</span>
                              <p className="mt-1">{card.answer}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeView === 'exam' && selectedLecture.examQuestions && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Potential Exam Questions</h3>
                      <div className="space-y-3">
                        {selectedLecture.examQuestions.map((question, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-orange-500">
                            <p className="font-medium">{index + 1}. {question}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeView === 'revision' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Quick Revision</h3>
                      <Card className="p-4 bg-accent border-l-4 border-l-purple-500">
                        <p className="leading-relaxed">{selectedLecture.revision}</p>
                      </Card>
                    </div>
                  )}
                </Card>
              </>
            )}

            {!selectedLecture.summary && !selectedLecture.pdfFile && (
              <Card className="p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload lecture notes</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a PDF to get started with AI-powered summaries, flashcards, and exam questions.
                </p>
                <Button
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose PDF File
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to your Library</h2>
              <p className="text-muted-foreground">
                Select a lecture from the sidebar to start studying
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage; 
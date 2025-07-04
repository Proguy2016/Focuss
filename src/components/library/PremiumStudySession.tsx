import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColoredGlassCard } from '@/components/ui/ColoredGlassCard';
import {
    Brain,
    Sparkles,
    Clock,
    LineChart,
    BookOpen,
    Lightbulb,
    Target,
    CheckCircle2,
    AlertCircle,
    Zap,
    Timer,
    PauseCircle,
    PlayCircle
} from 'lucide-react';
import api from '@/services/api';

interface PremiumStudySessionProps {
    lectureId: string;
    lectureTitle: string;
    summary: string | string[];
    flashcards: Array<{ question: string; answer: string }>;
    examQuestions: Array<{ question: string; answer: string }>;
    revision: string;
}

interface StudyPlan {
    title: string;
    description: string;
    duration: number; // in minutes
    steps: Array<{
        type: 'read' | 'practice' | 'quiz' | 'break';
        title: string;
        duration: number; // in minutes
        content?: string;
    }>;
}

interface PracticeQuestion {
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    hint?: string;
    explanation?: string;
}

interface StudyAnalytics {
    totalStudyTime: number; // in minutes
    sessionsCompleted: number;
    masteryScore: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    recommendedFocus: string;
}

export const PremiumStudySession: React.FC<PremiumStudySessionProps> = ({
    lectureId,
    lectureTitle,
    summary,
    flashcards,
    examQuestions,
    revision
}) => {
    const [activeTab, setActiveTab] = useState<string>('coach');
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
    const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [timerRunning, setTimerRunning] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [sessionStarted, setSessionStarted] = useState<boolean>(false);

    useEffect(() => {
        // Load or generate study plan and analytics
        const loadPremiumContent = async () => {
            setIsLoading(true);
            try {
                // In a real app, we'd fetch this from the backend
                // For now, we'll generate it on the client side

                // Generate study plan based on content
                const generatedPlan: StudyPlan = {
                    title: `Study Plan for ${lectureTitle}`,
                    description: `A personalized study plan focused on mastering the key concepts in ${lectureTitle}.`,
                    duration: 45, // 45 minutes
                    steps: [
                        {
                            type: 'read',
                            title: 'Review Summary',
                            duration: 5,
                            content: Array.isArray(summary) ? summary.join('\n\n') : summary
                        },
                        {
                            type: 'practice',
                            title: 'Key Concepts Practice',
                            duration: 15,
                            content: 'Practice applying the key concepts from the lecture.'
                        },
                        {
                            type: 'break',
                            title: 'Short Break',
                            duration: 5,
                            content: 'Take a short break to refresh your mind.'
                        },
                        {
                            type: 'quiz',
                            title: 'Knowledge Check',
                            duration: 15,
                            content: 'Test your understanding with practice questions.'
                        },
                        {
                            type: 'read',
                            title: 'Revision Overview',
                            duration: 5,
                            content: revision
                        }
                    ]
                };

                setStudyPlan(generatedPlan);
                setTimeRemaining(generatedPlan.steps[0].duration * 60); // Set timer for first step

                // Generate practice questions
                const questions: PracticeQuestion[] = examQuestions.map((q, index) => ({
                    question: q.question,
                    answer: q.answer,
                    difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
                    hint: `Think about the ${index % 2 === 0 ? 'core principles' : 'key relationships'} discussed in the lecture.`,
                    explanation: `${q.answer}\n\nThis concept is important because it forms the foundation for understanding the subject matter.`
                }));

                setPracticeQuestions(questions);

                // Generate mock analytics
                const mockAnalytics: StudyAnalytics = {
                    totalStudyTime: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
                    sessionsCompleted: Math.floor(Math.random() * 5) + 1, // 1-5 sessions
                    masteryScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
                    strengths: [
                        'Understanding core concepts',
                        'Applying theoretical knowledge'
                    ],
                    weaknesses: [
                        'Recalling specific details',
                        'Complex problem solving'
                    ],
                    recommendedFocus: 'Focus on strengthening your recall of specific details through active recall practice.'
                };

                setAnalytics(mockAnalytics);
            } catch (error) {
                console.error('Error loading premium content:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPremiumContent();
    }, [lectureId, lectureTitle, summary, revision, examQuestions]);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (timerRunning && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [timerRunning, timeRemaining]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const startSession = () => {
        setSessionStarted(true);
        setTimerRunning(true);
    };

    const nextStep = () => {
        if (!studyPlan || currentStep >= studyPlan.steps.length - 1) return;

        setCurrentStep(prev => prev + 1);
        setTimeRemaining(studyPlan.steps[currentStep + 1].duration * 60);
        setTimerRunning(true);
    };

    const toggleTimer = () => {
        setTimerRunning(prev => !prev);
    };

    if (isLoading) {
        return (
            <Card className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                <h3 className="text-xl font-bold mb-2">Preparing Your Premium Session</h3>
                <p className="text-muted-foreground">Our AI is personalizing your study experience...</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-0">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/20 rounded-full">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Premium Study Session</h2>
                        <p className="text-muted-foreground">AI-powered personalized learning experience</p>
                    </div>
                </div>

                {!sessionStarted ? (
                    <div className="text-center py-8">
                        <Brain className="h-16 w-16 mx-auto mb-4 text-primary/60" />
                        <h3 className="text-xl font-bold mb-2">Ready to start your personalized study session?</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Our AI has analyzed your content and created a tailored study plan to maximize your learning efficiency.
                        </p>
                        <Button onClick={startSession} size="lg" className="gap-2">
                            <Zap className="h-4 w-4" />
                            Begin Study Session
                        </Button>
                    </div>
                ) : (
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-6">
                        <TabsList className="grid grid-cols-4 mb-6">
                            <TabsTrigger value="coach" className="gap-2">
                                <Brain className="h-4 w-4" />
                                <span className="hidden sm:inline">Study Coach</span>
                            </TabsTrigger>
                            <TabsTrigger value="content" className="gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span className="hidden sm:inline">Enhanced Content</span>
                            </TabsTrigger>
                            <TabsTrigger value="interactive" className="gap-2">
                                <Zap className="h-4 w-4" />
                                <span className="hidden sm:inline">Interactive</span>
                            </TabsTrigger>
                            <TabsTrigger value="progress" className="gap-2">
                                <LineChart className="h-4 w-4" />
                                <span className="hidden sm:inline">Progress</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="coach" className="space-y-4">
                            {studyPlan && (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                {studyPlan.steps[currentStep].title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Step {currentStep + 1} of {studyPlan.steps.length}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={toggleTimer}
                                            >
                                                {timerRunning ? (
                                                    <PauseCircle className="h-4 w-4" />
                                                ) : (
                                                    <PlayCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Timer className="h-4 w-4" />
                                                {formatTime(timeRemaining)}
                                            </div>
                                        </div>
                                    </div>

                                    <Progress
                                        value={(currentStep / (studyPlan.steps.length - 1)) * 100}
                                        className="h-2 mb-4"
                                    />

                                    <ColoredGlassCard className="p-6 mb-4">
                                        {studyPlan.steps[currentStep].type === 'break' ? (
                                            <div className="text-center py-8">
                                                <PauseCircle className="h-16 w-16 mx-auto mb-4 text-primary/60" />
                                                <h4 className="text-xl font-bold mb-2">Break Time!</h4>
                                                <p className="text-muted-foreground mb-4">
                                                    Take a short break to refresh your mind. Stand up, stretch, or grab a glass of water.
                                                </p>
                                                <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="text-lg font-medium mb-4">
                                                    {studyPlan.steps[currentStep].type === 'read' ? 'Read and Understand' :
                                                        studyPlan.steps[currentStep].type === 'practice' ? 'Practice Application' :
                                                            'Test Your Knowledge'}
                                                </h4>
                                                {studyPlan.steps[currentStep].type === 'read' && studyPlan.steps[currentStep].title.toLowerCase().includes('revision') ? (
                                                    <div className="space-y-2">
                                                        {studyPlan.steps[currentStep].content.split(/\n|\r|\.|\*/).map((para, idx) => para.trim() && (
                                                            <p key={idx} className="text-muted-foreground leading-relaxed">{para.replace(/\*+/g, '')}</p>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                                        {studyPlan.steps[currentStep].content}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </ColoredGlassCard>

                                    <div className="flex justify-between">
                                        <Button
                                            variant="outline"
                                            disabled={currentStep === 0}
                                            onClick={() => {
                                                if (currentStep > 0) {
                                                    setCurrentStep(prev => prev - 1);
                                                    setTimeRemaining(studyPlan.steps[currentStep - 1].duration * 60);
                                                }
                                            }}
                                        >
                                            Previous Step
                                        </Button>
                                        <Button
                                            onClick={nextStep}
                                            disabled={currentStep >= studyPlan.steps.length - 1}
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="content" className="space-y-4">
                            <h3 className="text-xl font-bold mb-4">Enhanced Learning Materials</h3>

                            <div className="grid gap-4">
                                <ColoredGlassCard className="p-6">
                                    <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        Key Concepts Map
                                    </h4>
                                    <div className="p-4 bg-accent/30 rounded-lg mb-4">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            These concepts are central to understanding the material:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            {Array.isArray(summary) ?
                                                summary.map((point, i) => (
                                                    <li key={i} className="text-sm">{point}</li>
                                                )) :
                                                typeof summary === 'string' ?
                                                    summary.split(/\.|\n/).filter(point => point.trim()).map((point, i) => (
                                                        <li key={i} className="text-sm">{point.trim().replace(/\*\*/g, '')}</li>
                                                    )) : []
                                            }
                                        </ul>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Understanding these core concepts will help you build a solid foundation for more advanced topics.
                                    </p>
                                </ColoredGlassCard>
                            </div>

                            <ColoredGlassCard className="p-6">
                                <h4 className="text-lg font-medium mb-4">Practice Problems with Solutions</h4>

                                <div className="space-y-6">
                                    {practiceQuestions.slice(0, 2).map((question, index) => (
                                        <div key={index} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2 py-1 text-xs rounded ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                                                </div>
                                                <h5 className="font-medium">Problem {index + 1}</h5>
                                            </div>

                                            <p>{question.question}</p>

                                            <div className="p-3 bg-accent/30 rounded-lg">
                                                <p className="text-sm font-medium mb-1">Hint:</p>
                                                <p className="text-sm text-muted-foreground">{question.hint}</p>
                                            </div>

                                            <div>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Show Solution
                                                </Button>
                                            </div>

                                            <Separator />
                                        </div>
                                    ))}
                                </div>
                            </ColoredGlassCard>
                        </TabsContent>

                        <TabsContent value="interactive" className="space-y-4">
                            <h3 className="text-xl font-bold mb-4">Interactive Learning Session</h3>

                            <Card className="p-6 border-primary/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-medium">Focused Study Timer</h4>
                                    <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <Button variant="outline" onClick={() => setTimeRemaining(15 * 60)}>
                                        15 min
                                    </Button>
                                    <Button variant="outline" onClick={() => setTimeRemaining(25 * 60)}>
                                        25 min
                                    </Button>
                                    <Button variant="outline" onClick={() => setTimeRemaining(45 * 60)}>
                                        45 min
                                    </Button>
                                </div>

                                <div className="flex justify-center mb-6">
                                    <Button
                                        variant={timerRunning ? "destructive" : "default"}
                                        size="lg"
                                        onClick={toggleTimer}
                                        className="gap-2"
                                    >
                                        {timerRunning ? (
                                            <>
                                                <PauseCircle className="h-4 w-4" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="h-4 w-4" />
                                                Start
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <Separator className="my-6" />

                                <h4 className="text-lg font-medium mb-4">Current Focus</h4>

                                <div className="p-4 bg-accent/30 rounded-lg mb-4">
                                    <p className="text-muted-foreground">
                                        {studyPlan?.steps?.[currentStep]?.content || "Focus on understanding the core concepts."}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 inline mr-2" />
                                        Optimal focus time: 25-45 minutes
                                    </p>
                                    <Button variant="outline" size="sm">
                                        Mark Complete
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="progress" className="space-y-4">
                            {analytics && (
                                <>
                                    <h3 className="text-xl font-bold mb-4">Learning Analytics</h3>

                                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                                        <Card className="p-4">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Study Time</h4>
                                            <div className="text-2xl font-bold">{analytics.totalStudyTime} min</div>
                                        </Card>

                                        <Card className="p-4">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Sessions Completed</h4>
                                            <div className="text-2xl font-bold">{analytics.sessionsCompleted}</div>
                                        </Card>

                                        <Card className="p-4">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Mastery Score</h4>
                                            <div className="text-2xl font-bold">{analytics.masteryScore}%</div>
                                        </Card>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <ColoredGlassCard className="p-6">
                                            <h4 className="text-lg font-medium mb-4">Strengths & Weaknesses</h4>

                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-green-500 mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Strengths
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {analytics.strengths.map((strength, i) => (
                                                        <li key={i} className="text-sm">{strength}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h5 className="text-sm font-medium text-red-500 mb-2 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Areas to Improve
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {analytics.weaknesses.map((weakness, i) => (
                                                        <li key={i} className="text-sm">{weakness}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </ColoredGlassCard>

                                        <ColoredGlassCard className="p-6">
                                            <h4 className="text-lg font-medium mb-4">Recommended Focus</h4>
                                            <p className="text-muted-foreground mb-4">{analytics.recommendedFocus}</p>

                                            <h5 className="text-sm font-medium mb-2">Exam Readiness</h5>
                                            <div className="mb-2">
                                                <Progress value={analytics.masteryScore} className="h-2" />
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                {analytics.masteryScore < 70
                                                    ? "More study recommended before assessment"
                                                    : analytics.masteryScore < 90
                                                        ? "Good progress, continue focusing on weak areas"
                                                        : "Excellent mastery, ready for assessment"}
                                            </p>

                                            <Button className="w-full gap-2">
                                                <Target className="h-4 w-4" />
                                                Generate Personalized Practice
                                            </Button>
                                        </ColoredGlassCard>
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </Card>
        </div>
    );
};

export default PremiumStudySession; 
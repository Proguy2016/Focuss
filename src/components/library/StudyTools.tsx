import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import {
    Brain,
    Check,
    X,
    Clock,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Lightbulb,
    AlertCircle
} from 'lucide-react';
import { ColoredGlassCard } from '../../components/ui/ColoredGlassCard';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

interface FlashcardData {
    question: string;
    answer: string;
    nextReviewDate?: Date;
    difficulty?: 'easy' | 'medium' | 'hard';
    repetitionCount?: number;
}

interface StudyToolsProps {
    summary: string | string[];
    flashcards: FlashcardData[];
    examQuestions: Array<{ question: string; answer: string }>;
    revision: string;
}

export const QuizMode: React.FC<{ examQuestions: Array<{ question: string; answer: string }> }> = ({ examQuestions }) => {
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        // Generate quiz questions from exam questions
        const generatedQuestions = examQuestions.map(examQuestion => {
            // Extract key phrases from the answer to create options
            const correctAnswer = extractKeyPhrase(examQuestion.answer);

            // Generate 3 incorrect options
            const incorrectOptions = generateIncorrectOptions(correctAnswer, examQuestion.answer);

            return {
                question: examQuestion.question,
                options: shuffleArray([correctAnswer, ...incorrectOptions]),
                correctAnswer: correctAnswer,
                explanation: examQuestion.answer
            };
        });

        setQuizQuestions(generatedQuestions);
    }, [examQuestions]);

    const extractKeyPhrase = (text: string): string => {
        // Extract a key phrase from the answer (simplified version)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 0) {
            const mainSentence = sentences[0].trim();
            if (mainSentence.length > 50) {
                return mainSentence.substring(0, 50) + '...';
            }
            return mainSentence;
        }
        return text.substring(0, Math.min(50, text.length)) + (text.length > 50 ? '...' : '');
    };

    const generateIncorrectOptions = (correctAnswer: string, fullAnswer: string): string[] => {
        // In a real app, we'd use more sophisticated methods to generate plausible but incorrect options
        // For now, we'll create simple variations
        const options = [
            `Not ${correctAnswer.replace(/^is|are|was|were/, '')}`,
            `The opposite of ${correctAnswer.toLowerCase().includes('increase') ? 'increasing' : 'decreasing'} ${correctAnswer.split(' ').slice(-1)[0]}`,
            `A different approach than ${correctAnswer.split(' ').slice(-2).join(' ')}`
        ];

        return options;
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    const checkAnswer = () => {
        if (!selectedOption) return;

        setIsAnswerRevealed(true);
        if (selectedOption === quizQuestions[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswerRevealed(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
        setScore(0);
        setQuizCompleted(false);
    };

    if (quizQuestions.length === 0) {
        return (
            <Card className="p-6 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Generating Quiz</h3>
                <p className="text-muted-foreground">Please wait while we prepare your quiz questions...</p>
            </Card>
        );
    }

    if (quizCompleted) {
        const percentage = Math.round((score / quizQuestions.length) * 100);

        return (
            <Card className="p-6">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                    <p className="text-muted-foreground mb-4">You scored {score} out of {quizQuestions.length} questions</p>

                    <div className="mb-4">
                        <Progress value={percentage} className="h-3" />
                        <p className="text-sm text-muted-foreground mt-2">{percentage}% correct</p>
                    </div>

                    {percentage >= 80 ? (
                        <p className="text-green-500 flex items-center justify-center gap-2 mb-4">
                            <Check className="h-5 w-5" /> Excellent! You've mastered this content.
                        </p>
                    ) : percentage >= 60 ? (
                        <p className="text-yellow-500 flex items-center justify-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5" /> Good job! Some review might help.
                        </p>
                    ) : (
                        <p className="text-red-500 flex items-center justify-center gap-2 mb-4">
                            <X className="h-5 w-5" /> You should review this material more thoroughly.
                        </p>
                    )}

                    <Button onClick={restartQuiz} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Restart Quiz
                    </Button>
                </div>
            </Card>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <Card className="p-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/30">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Quiz Mode</h3>
                <div className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </div>
            </div>

            <Progress value={(currentQuestionIndex / quizQuestions.length) * 100} className="h-1 mb-6" />

            <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">{currentQuestion.question}</h4>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg cursor-pointer border transition-colors ${selectedOption === option
                                ? isAnswerRevealed
                                    ? option === currentQuestion.correctAnswer
                                        ? 'bg-green-100 border-green-500 dark:bg-green-900/20 dark:border-green-500'
                                        : 'bg-red-100 border-red-500 dark:bg-red-900/20 dark:border-red-500'
                                    : 'bg-primary/10 border-primary'
                                : 'hover:bg-accent border-border'
                                }`}
                            onClick={() => !isAnswerRevealed && handleOptionSelect(option)}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {isAnswerRevealed && option === currentQuestion.correctAnswer && (
                                    <Check className="h-5 w-5 text-green-500" />
                                )}
                                {isAnswerRevealed && selectedOption === option && option !== currentQuestion.correctAnswer && (
                                    <X className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isAnswerRevealed && (
                <div className="mb-6 p-4 bg-accent/50 rounded-lg">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Explanation
                    </h5>
                    <p className="text-muted-foreground whitespace-pre-wrap break-words">{currentQuestion.explanation}</p>
                </div>
            )}

            <div className="flex justify-between">
                {!isAnswerRevealed ? (
                    <Button
                        onClick={checkAnswer}
                        disabled={!selectedOption}
                        className="gap-2"
                    >
                        Check Answer
                    </Button>
                ) : (
                    <Button
                        onClick={nextQuestion}
                        className="gap-2"
                    >
                        {currentQuestionIndex < quizQuestions.length - 1 ? (
                            <>
                                Next Question
                                <ChevronRight className="h-4 w-4" />
                            </>
                        ) : (
                            'Complete Quiz'
                        )}
                    </Button>
                )}
            </div>
        </Card>
    );
};

export const SpacedRepetitionFlashcards: React.FC<{ flashcards: FlashcardData[] }> = ({ flashcards }) => {
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);

    useEffect(() => {
        // Initialize cards with spaced repetition metadata if not already present
        const initializedCards = flashcards.map(card => ({
            ...card,
            nextReviewDate: card.nextReviewDate || new Date(),
            difficulty: card.difficulty || 'medium',
            repetitionCount: card.repetitionCount || 0
        }));

        // Sort cards by review date (due cards first)
        const sortedCards = initializedCards.sort((a, b) => {
            const dateA = a.nextReviewDate ? new Date(a.nextReviewDate) : new Date();
            const dateB = b.nextReviewDate ? new Date(b.nextReviewDate) : new Date();
            return dateA.getTime() - dateB.getTime();
        });

        setCards(sortedCards);
    }, [flashcards]);

    const calculateNextReviewDate = (difficulty: 'easy' | 'medium' | 'hard', repetitionCount: number): Date => {
        const now = new Date();
        let daysToAdd = 1;

        // Implement a simplified version of the SM-2 algorithm
        switch (difficulty) {
            case 'easy':
                daysToAdd = Math.pow(2, repetitionCount); // 1, 2, 4, 8, 16 days
                break;
            case 'medium':
                daysToAdd = Math.pow(1.5, repetitionCount); // 1, 1.5, 2.25, 3.4, 5.1 days
                break;
            case 'hard':
                daysToAdd = 1; // Always review hard cards the next day
                break;
        }

        // Cap at 30 days
        daysToAdd = Math.min(daysToAdd, 30);

        const nextDate = new Date();
        nextDate.setDate(now.getDate() + daysToAdd);
        return nextDate;
    };

    const handleDifficultyRating = (difficulty: 'easy' | 'medium' | 'hard') => {
        if (currentCardIndex >= cards.length) return;

        const updatedCards = [...cards];
        const currentCard = updatedCards[currentCardIndex];

        // Update card metadata
        updatedCards[currentCardIndex] = {
            ...currentCard,
            difficulty,
            repetitionCount: (currentCard.repetitionCount || 0) + 1,
            nextReviewDate: calculateNextReviewDate(difficulty, (currentCard.repetitionCount || 0) + 1)
        };

        setCards(updatedCards);

        // Move to next card or end session
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setShowAnswer(false);
        } else {
            setSessionCompleted(true);
        }
    };

    const restartSession = () => {
        // Resort cards by next review date
        const sortedCards = [...cards].sort((a, b) => {
            const dateA = a.nextReviewDate ? new Date(a.nextReviewDate) : new Date();
            const dateB = b.nextReviewDate ? new Date(b.nextReviewDate) : new Date();
            return dateA.getTime() - dateB.getTime();
        });

        setCards(sortedCards);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setSessionCompleted(false);
    };

    if (cards.length === 0) {
        return (
            <Card className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">No Flashcards Available</h3>
                <p className="text-muted-foreground">There are no flashcards to review at this time.</p>
            </Card>
        );
    }

    if (sessionCompleted) {
        return (
            <Card className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Session Completed!</h3>
                <p className="text-muted-foreground mb-4">You've reviewed all your flashcards for now.</p>

                <div className="flex justify-center gap-4">
                    <Button onClick={restartSession} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Start New Session
                    </Button>
                </div>
            </Card>
        );
    }

    const currentCard = cards[currentCardIndex];
    const dueCards = cards.filter(card => {
        const reviewDate = card.nextReviewDate ? new Date(card.nextReviewDate) : new Date();
        return reviewDate <= new Date();
    }).length;

    return (
        <Card className="p-6 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/30">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Spaced Repetition</h3>
                <div className="text-sm text-muted-foreground">
                    Card {currentCardIndex + 1} of {dueCards} due
                </div>
            </div>

            <Progress value={(currentCardIndex / dueCards) * 100} className="h-1 mb-6" />

            <ColoredGlassCard
                className="p-6 mb-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
                onClick={() => setShowAnswer(!showAnswer)}
            >
                {!showAnswer ? (
                    <>
                        <h4 className="text-lg font-medium mb-4">Question:</h4>
                        <p className="text-center">{currentCard.question}</p>
                        <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
                    </>
                ) : (
                    <>
                        <h4 className="text-lg font-medium mb-4">Answer:</h4>
                        <p className="text-center">{currentCard.answer}</p>
                        <p className="text-xs text-muted-foreground mt-4">Click to see question</p>
                    </>
                )}
            </ColoredGlassCard>

            {showAnswer && (
                <div className="space-y-3">
                    <p className="text-sm text-center mb-2">How well did you know this?</p>

                    <div className="flex gap-2 justify-center">
                        <Button
                            variant="destructive"
                            onClick={() => handleDifficultyRating('hard')}
                            className="flex-1"
                        >
                            Difficult
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleDifficultyRating('medium')}
                            className="flex-1"
                        >
                            Good
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => handleDifficultyRating('easy')}
                            className="flex-1"
                        >
                            Easy
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const StudyTools: React.FC<StudyToolsProps> = ({ summary, flashcards, examQuestions, revision }) => {
    const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards'>('quiz');

    return (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4">
                <Button
                    variant={activeTab === 'quiz' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('quiz')}
                    className="gap-2"
                >
                    <Brain className="h-4 w-4" />
                    Quiz Mode
                </Button>
                <Button
                    variant={activeTab === 'flashcards' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('flashcards')}
                    className="gap-2"
                >
                    <Clock className="h-4 w-4" />
                    Spaced Repetition
                </Button>
            </div>

            {activeTab === 'quiz' ? (
                <QuizMode examQuestions={examQuestions} />
            ) : (
                <SpacedRepetitionFlashcards flashcards={flashcards} />
            )}
        </div>
    );
};

export default StudyTools; 
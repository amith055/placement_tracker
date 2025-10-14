'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { use } from 'react';

export default function SoftSkillTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const [testDetails, setTestDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState<number | null>(null); // ✅ test score
  const [totalQuestions, setTotalQuestions] = useState<number>(15); // ✅ total aptitude questions

  // local email (or placeholder)
  const email = typeof window !== 'undefined'
    ? localStorage.getItem('userEmail') || ''
    : '';

  // 🔹 Fetch test details & questions
  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      try {
        const testQuery = query(collection(db, "softskill_test"), where("id", "==", testId));
        const testSnap = await getDocs(testQuery);
        const testData = testSnap.docs[0]?.data();

        const questionQuery = query(collection(db, "softskill_test_ques"), where("id", "==", testId));
        const questionSnap = await getDocs(questionQuery);
        const questionsData = questionSnap.docs.map(doc => doc.data());

        setTestDetails(testData);
        setQuestions(questionsData);
        setTimeLeft((testData?.duration || 0) * 60);

        // fetch all aptitude questions count (for overall %)
        const allTestsSnap = await getDocs(collection(db, "softskill_test_ques"));
        setTotalQuestions(allTestsSnap.size); // e.g. 15 total
      } catch (error) {
        console.error("Error fetching test data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [testId]);

  // 🔹 Timer
  useEffect(() => {
    if (!loading && timeLeft && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (!prev || prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // auto-submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, timeLeft]);

  // 🔹 Handlers
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleSubmit = async (auto = false) => {
    const allAnswered = Object.keys(selectedAnswers).length === questions.length;
    if (!allAnswered && !auto) {
      alert("Please answer all questions before submitting!");
      return;
    }

    // ✅ Calculate per-test score
    let correct = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.ans) correct++;
    });
    setScore(correct);

    // ✅ Calculate overall aptitude percentage (out of total 15)
    const percentage = ((correct / totalQuestions) * 100).toFixed(2);

    // ✅ Update user document
    try {
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const old_score = userDoc.data().softskill_score || 0;

        await updateDoc(doc(db, "users", userDoc.id), {
          softskill_score:old_score+ Number(percentage),
        });
      }
    } catch (err) {
      console.error("Error updating user score:", err);
    }

    // ✅ Show popup
    setIsTimeUp(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <p className="text-center mt-10">Loading test...</p>;
  if (!testDetails) return <p className="text-center mt-10">No test found.</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-2xl">{testDetails.title}</CardTitle>
            <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
              <Clock className="h-5 w-5" />
              <span>{formatTime(timeLeft || 0)}</span>
            </div>
          </div>

          {/* 🔹 Progress bar */}
          <div className="mt-3">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1 text-right">
              {answeredCount}/{questions.length} answered
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {currentQuestion ? (
            <>
              <div className="mb-6">
                <p className="mb-1 text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>
              </div>

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex]}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {currentQuestion.options.map((option: string, index: number) => (
                  <Label
                    key={index}
                    className="flex items-center space-x-3 rounded-md border p-4 hover:bg-muted has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <span>{option}</span>
                  </Label>
                ))}
              </RadioGroup>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={() => handleSubmit()} disabled={answeredCount < questions.length}>
                    Submit
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p>No questions found for this test.</p>
          )}
        </CardContent>
      </Card>

      {/* ✅ Popup with score */}
      <AlertDialog open={isTimeUp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Finished!</AlertDialogTitle>
            <AlertDialogDescription>
              {score !== null ? (
                <>
                  You scored <strong>{score}/{questions.length}</strong> in this test. <br />
                  Your overall softskill score has been updated in your profile.
                </>
              ) : (
                "Your responses have been recorded."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link href="/aptitude">Back to Tests</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

export default function AptitudeTestPage({ params }: { params: { testId: string } }) {
  const [testDetails, setTestDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  // ---------------- Fetch test details & questions ----------------
  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      setLoading(true);
      try {
        const testRef = doc(db, "int_tests", params.testId);
        const testSnap = await getDoc(testRef);

        if (!testSnap.exists()) {
          console.error("❌ Test not found for ID:", params.testId);
          setTestDetails(null);
          return;
        }

        const testData = { id: testSnap.id, ...testSnap.data() };
        setTestDetails(testData);

        const questionRef = collection(db, "int_tests", params.testId, "questions");
const questionSnap = await getDocs(questionRef);

const questionsData = questionSnap.docs.map((docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    slno: data.slno ?? 0,
    question: data.question ?? '',
    options: Array.isArray(data.options) ? data.options : [],
    correct_ans: data.correct_ans ?? '',
    img_link: data.img_link ?? null,
  };
});


        setQuestions(questionsData);
        setTotalQuestions(questionsData.length);

        const durationMinutes = Number((testData as any).duration) || 0;
        setTimeLeft(durationMinutes > 0 ? durationMinutes * 60 : null);
      } catch (error) {
        console.error("🔥 Error fetching test data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [params.testId]);

  // ---------------- Timer ----------------
  useEffect(() => {
    if (loading || timeLeft == null) return;
    if (timeLeft <= 0) {
      handleSubmit(true).catch(() => {});
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          handleSubmit(true).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft]);

  // ---------------- Handlers ----------------
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: value }));
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (auto = false) => {
    if (questions.length === 0) {
      setIsTimeUp(true);
      return;
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    const allAnswered = answeredCount === questions.length;
    // if (!allAnswered && !auto) {
    //   alert("Please answer all questions before submitting!");
    //   return;
    // }

    const negativeMarks = Number(testDetails.negativeMarks || 0);

    let correct = 0;
    let wrong = 0;

    questions.forEach((q, i) => {
      const selected = selectedAnswers[i];
      if (!selected) return;
      if (selected === q.correct_ans) correct++;
      else wrong++;
    });

    const totalScore = correct - wrong * negativeMarks;
    const denom = totalQuestions || questions.length;
    const percentageScore = denom > 0 ? (totalScore / denom) * 100 : 0;
    const percentageRounded = Math.max(0, Number(percentageScore.toFixed(2)));

    setScore(totalScore);
    setCorrectCount(correct);
    setWrongCount(wrong);
    setPercentage(percentageRounded);

    if (email) {
      try {
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          const userId = userDoc.id;

          const userTestRef = doc(db, "users", userId, "tests", params.testId);
          await updateDoc(userTestRef, {
            score: percentageRounded,
            correct,
            wrong,
            attempted: true,
            submittedAt: new Date(),
          }).catch(async () => {
            await setDoc(userTestRef, {
              score: percentageRounded,
              correct,
              wrong,
              attempted: true,
              submittedAt: new Date(),
            });
          });

          const testAttemptRef = doc(db, "int_tests", params.testId, "student_attempted", email);
          await updateDoc(testAttemptRef, {
            email,
            score: percentageRounded,
            correct,
            wrong,
            submittedAt: new Date(),
          }).catch(async () => {
            await setDoc(testAttemptRef, {
              email,
              score: percentageRounded,
              correct,
              wrong,
              submittedAt: new Date(),
            });
          });
        }
      } catch (err) {
        console.error("🔥 Error storing test result:", err);
      }
    }

    setIsTimeUp(true);
  };

  // ---------------- Utils ----------------
  const formatTime = (seconds: number | null) => {
    if (seconds == null) return '∞';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) return <p className="text-center mt-10">Loading test...</p>;
  if (!testDetails) return <p className="text-center mt-10 text-red-500">❌ No test found for ID: {params.testId}</p>;

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-2xl">
              {testDetails.test_title ?? testDetails.testName ?? 'Aptitude Test'}
            </CardTitle>
            <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
              <Clock className="h-5 w-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="mt-3">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1 text-right">
              {answeredCount}/{testDetails.numQuestions} answered
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
                <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>

                {currentQuestion.img_link && (
                  <img
                    src={currentQuestion.img_link}
                    alt="question"
                    className="w-full h-60 object-contain rounded-md border mb-4"
                  />
                )}
              </div>

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex]}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((option: string, i: number) => (
                    <Label
                      key={i}
                      className="flex items-center space-x-3 rounded-md border p-4 hover:bg-muted has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                    >
                      <RadioGroupItem value={option} id={`option-${i}`} />
                      <span>{option}</span>
                    </Label>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No options available.</p>
                )}
              </RadioGroup>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={() => handleSubmit()}
                    // disabled={Object.keys(selectedAnswers).length !== questions.length}
                  >
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

      <AlertDialog open={isTimeUp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Finished!</AlertDialogTitle>
            <AlertDialogDescription>
              {score !== null ? (
                <>
                  <p>
                    ✅ Correct Answers: <strong>{correctCount}</strong><br />
                    ❌ Wrong Answers: <strong>{wrongCount}</strong><br />
                    🧮 Negative Marks per Wrong: <strong>{testDetails.negativeMarks || 0}</strong><br /><br />
                    Final Score: <strong>{score}/{questions.length}</strong><br />
                    Percentage: <strong>{percentage}%</strong><br />
                    Your aptitude score has been updated successfully.
                  </p>
                </>
              ) : (
                "Your responses have been recorded."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link href="/dashboard">Back to Tests</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

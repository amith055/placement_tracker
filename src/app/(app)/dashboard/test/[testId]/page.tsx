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

  const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  // ---------------- Fetch test details & questions ----------------
  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      setLoading(true);
      try {
        // ✅ Fetch test metadata directly using doc ID
        const testRef = doc(db, "int_tests", params.testId);
        const testSnap = await getDoc(testRef);

        if (!testSnap.exists()) {
          console.error("❌ Test not found for ID:", params.testId);
          setTestDetails(null);
          return;
        }

        const testData = { id: testSnap.id, ...testSnap.data() };
        console.log("✅ Test Data:", testData);
        setTestDetails(testData);

        // ✅ Fetch related questions — adjust 'testid' field if your field is 'testId'
        const questionRef = collection(db, "int_ques");
        const questionQuery = query(questionRef, where("testid", "==", params.testId));
        const questionSnap = await getDocs(questionQuery);

        console.log("📦 Raw Question Snapshot:", questionSnap.size);
        if (questionSnap.empty) {
          console.warn("⚠️ No questions found for testid:", params.testId);
        }

        const questionsData = questionSnap.docs.map((d) => {
          const data = d.data();
          console.log("🧩 Question doc:", data);
          return {
            id: d.id,
            slno: data.slno ?? 0,
            question: data.question ?? '',
            options: Array.isArray(data.options) ? data.options : [],
            correct_ans: data.correct_ans ?? '',
            img_link: data.img_link ?? null,
          };
        });

        console.log("✅ Questions fetched:", questionsData.length);
        setQuestions(questionsData);
        setTotalQuestions(questionsData.length);

        // ✅ Set timer (convert duration to seconds)
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
  if (!allAnswered && !auto) {
    alert("Please answer all questions before submitting!");
    return;
  }

  // ✅ Calculate score
  let correct = 0;
  questions.forEach((q, i) => {
    const selected = selectedAnswers[i];
    if (selected === q.correct_ans) correct++;
  });
  setScore(correct);

  const denom = totalQuestions || questions.length;
  const percentage = denom > 0 ? (correct / denom) * 100 : 0;
  const percentageRounded = Number(percentage.toFixed(2));

  if (email) {
    try {
      // ✅ Get user by email
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const userId = userDoc.id;

        // ✅ 1️⃣ Store in user's subcollection
        const userTestRef = doc(db, "users", userId, "tests", params.testId);
        await updateDoc(userTestRef, {
          score: percentageRounded,
          attempted: true,
          submittedAt: new Date(),
        }).catch(async () => {
          await setDoc(userTestRef, {
            score: percentageRounded,
            attempted: true,
            submittedAt: new Date(),
          });
        });

        // ✅ 2️⃣ Store in int_tests -> student_attempted subcollection
        const testAttemptRef = doc(db, "int_tests", params.testId, "student_attempted", email);
        await updateDoc(testAttemptRef, {
          email: email,
          score: percentageRounded,
          submittedAt: new Date(),
        }).catch(async () => {
          await setDoc(testAttemptRef, {
            email: email,
            score: percentageRounded,
            submittedAt: new Date(),
          });
        });

        // ✅ 3️⃣ Mark test as completed in user’s side (optional)
        const testRef = doc(db, "int_tests", params.testId);
        await updateDoc(testRef, {
          [`studentsCompleted.${userId}`]: true, // optional map for quick lookup
        }).catch(() => {});

        console.log("✅ Test result stored in both user & test records!");
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

      <AlertDialog open={isTimeUp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Finished!</AlertDialogTitle>
            <AlertDialogDescription>
              {score !== null ? (
                <>
                  You scored <strong>{score}/{questions.length}</strong>.<br />
                  Your aptitude score has been updated.
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

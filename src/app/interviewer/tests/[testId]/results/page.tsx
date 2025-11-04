'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TestData {
  testName: string;
  date: string;
  time: string;
  duration: number;
  negativeMarks: number;
  numQuestions: number;
  company_name: string;
  interviewerName: string;
}

interface StudentResult {
  id: string;
  email: string;
  studentName: string;
  score: number;
  correct: number;
  wrong: number;
  submittedAt: string;
}

export default function TestResultsPage() {
  const { testId } = useParams();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
      fetchStudentResults();
    }
  }, [testId]);

  // ✅ Fetch test details
  async function fetchTestDetails() {
    const testDoc = await getDoc(doc(db, 'int_tests', testId as string));
    if (testDoc.exists()) {
      setTestData(testDoc.data() as TestData);
    }
  }

  // ✅ Fetch results from subcollection `int_tests/{testId}/student_attempted`
  async function fetchStudentResults() {
    const attemptedRef = collection(db, 'int_tests', testId as string, 'student_attempted');
    const snapshot = await getDocs(query(attemptedRef));
    const tempResults: StudentResult[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const email = data.email;
      const score = data.score;
      const correct = data.correct ?? 0;
      const wrong = data.wrong ?? 0;
      const submittedAt = data.submittedAt?.toDate?.()?.toLocaleString?.() || '';

      // 🔹 Efficient user lookup
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnap = await getDocs(userQuery);
      const studentName = userSnap.docs[0]?.data()?.name || '';

      tempResults.push({
        id: docSnap.id,
        email,
        score,
        correct,
        wrong,
        submittedAt,
        studentName,
      });
    }

    setResults(tempResults);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-8">
      {testData ? (
        <>
          {/* Test Details Card */}
          <Card className="shadow-md">
            <CardHeader>
              <h1 className="text-2xl font-semibold">{testData.testName}</h1>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>Date:</strong> {testData.date}</p>
                <p><strong>Time:</strong> {testData.time}</p>
                <p><strong>Duration:</strong> {testData.duration} min</p>
                <p><strong>Questions:</strong> {testData.numQuestions}</p>
                <p><strong>Company:</strong> {testData.company_name}</p>
                <p><strong>Interviewer:</strong> {testData.interviewerName}</p>
                <p><strong>Negative Mark (per wrong answer):</strong> {testData.negativeMarks}</p>
              </div>
            </CardContent>
          </Card>

          {/* Student Results Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Student Results</h2>

            {loading ? (
              <p>Loading results...</p>
            ) : results.length === 0 ? (
              <p className="text-gray-500">No students have attempted this test yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold text-center">Total Attempted</TableHead>
                      <TableHead className="font-semibold text-center">Correct Answers</TableHead>
                      <TableHead className="font-semibold text-center">Wrong Answers</TableHead>

                      <TableHead className="font-semibold text-center">Score</TableHead>
                      <TableHead className="font-semibold">Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((student, index) => (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.studentName || 'Unknown Student'}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className='text-center'>{student.correct + student.wrong}</TableCell>
                        <TableCell className='text-center'>{student.correct}</TableCell>
                        <TableCell className='text-center'>{student.wrong}</TableCell>
                        <TableCell className="text-center font-medium">
                          {student.score}
                        </TableCell>
                        <TableCell>{student.submittedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </>
      ) : (
        <p>Loading test details...</p>
      )}
    </div>
  );
}

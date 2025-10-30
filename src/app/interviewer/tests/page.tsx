'use client';
import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ✅ Correct shadcn imports
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

interface Test {
  id: string;
  testName: string;
  duration: number;
  numQuestions: number;
  date: string;
  time: string;
  company_name: string;
  interviewerName: string;
  que_added: number;
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [completedTests, setCompletedTests] = useState<Test[]>([]);
  const [open, setOpen] = useState(false);

  // form fields
  const [testName, setTestName] = useState('');
  const [duration, setDuration] = useState('');
  const [numQuestions, setNumQuestions] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const [interviewerName, setInterviewerName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetchInterviewerData();
      fetchTests();
    }
  }, [userId]);

  async function fetchInterviewerData() {
    const q = query(collection(db, 'int_users'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = doc.data();
      setInterviewerName(data.interviewerName || '');
      setCompanyName(data.company_name || '');
    });
  }

  async function fetchTests() {
    const q = query(collection(db, 'int_tests'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const allTests: Test[] = [];
    snapshot.forEach((doc) => {
      allTests.push({ id: doc.id, ...doc.data() } as Test);
    });
    setTests(allTests);

    // separate upcoming and completed based on date/time
    const now = new Date();
    const upcoming = allTests.filter((t) => new Date(`${t.date}T${t.time}`) > now);
    const completed = allTests.filter((t) => new Date(`${t.date}T${t.time}`) <= now);

    setUpcomingTests(upcoming);
    setCompletedTests(completed);
  }

  async function handleAddTest() {
    if (!testName || !duration || !numQuestions || !date || !time) {
      alert('Please fill all fields');
      return;
    }

    await addDoc(collection(db, 'int_tests'), {
      userId,
      testName,
      duration: Number(duration),
      numQuestions: Number(numQuestions),
      date,
      time,
      company_name: companyName,
      interviewerName,
      que_added: 0,
    });

    setOpen(false);
    setTestName('');
    setDuration('');
    setNumQuestions('');
    setDate('');
    setTime('');
    fetchTests();
  }

  function handleAddQuestions(testId: string) {
    router.push(`/interviewer/tests/${testId}/add-questions`);
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tests</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Test Name</Label>
                <Input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <Label>Duration (in minutes)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Enter duration"
                />
              </div>
              <div>
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  placeholder="Enter number of questions"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <Button onClick={handleAddTest} className="w-full">
                Add Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Tests Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Upcoming Tests</h2>
        {upcomingTests.length === 0 ? (
          <p className="text-gray-500">No upcoming tests available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTests.map((test) => (
              <Card key={test.id} className="shadow-md">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{test.testName}</h3>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    <strong>Date:</strong> {test.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {test.time}
                  </p>
                  <p>
                    <strong>Duration:</strong> {test.duration} min
                  </p>
                  <p>
                    <strong>Questions Added:</strong> {test.que_added}/{test.numQuestions}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddQuestions(test.id)}
                  >
                    Add Questions
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Completed Tests Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Completed Tests</h2>
        {completedTests.length === 0 ? (
          <p className="text-gray-500">No completed tests available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTests.map((test) => (
              <Card key={test.id} className="shadow-md opacity-70">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{test.testName}</h3>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    <strong>Date:</strong> {test.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {test.time}
                  </p>
                  <p>
                    <strong>Duration:</strong> {test.duration} min
                  </p>
                  <p>
                    <strong>Questions Added:</strong> {test.que_added}/{test.numQuestions}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

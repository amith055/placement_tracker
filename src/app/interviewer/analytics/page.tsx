'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [studentSummaries, setStudentSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return setLoading(false);

      try {
        const q = query(collection(db, 'int_tests'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const fetchedTests: any[] = [];

        for (const doc of snapshot.docs) {
          const test = { id: doc.id, ...doc.data() };
          const attemptsSnap = await getDocs(collection(db, `int_tests/${test.id}/student_attempted`));
          const studentAttempts = attemptsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          fetchedTests.push({ ...test, studentAttempts });
        }

        setTests(fetchedTests);
        await Promise.all(fetchedTests.map((t) => generateTestSummary(t)));
        await generateStudentSummaries(fetchedTests);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🧠 Generate short test summary
  const generateTestSummary = async (test: any) => {
    const prompt = `
Summarize this test in 3 short, clear bullet points:
- What it measures
- Overall student performance
- Key recommendation

Data: ${JSON.stringify(test, null, 2)}
`;
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setSummaries((prev) => ({
      ...prev,
      [test.id]: data.text?.trim() || '⚠️ Summary unavailable.',
    }));
  };

  // 🧠 Generate short student summaries
  const generateStudentSummaries = async (tests: any[]) => {
    const allAttempts = tests.flatMap((t) =>
      (t.studentAttempts || []).map((s: any) => ({
        ...s,
        testId: t.id,
      }))
    );

    for (const s of allAttempts) {
      const prompt = `
Provide a 3-line evaluation:
⭐ Strength highlight
⚙️ Area to improve
🏁 Final remark
Data: ${JSON.stringify(s, null, 2)}
`;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setStudentSummaries((prev) => ({
        ...prev,
        [`${s.testId}_${s.email}`]: data.text?.trim() || 'No summary available.',
      }));
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Test-Based Analytics</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading analytics...</p>
      ) : tests.length === 0 ? (
        <p className="text-center text-gray-500">No tests found.</p>
      ) : (
        tests.map((test) => {
          const chartData = (test.studentAttempts || []).map((s: any) => ({
            student: s.email?.split('@')[0] || 'Unknown',
            score: s.score || 0,
          }));

          return (
            <Card key={test.id} className="border shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  🧪 {test.testName || 'Untitled Test'}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Test-level Summary */}
                <div className="bg-gray-50 p-3 rounded-md border text-sm whitespace-pre-wrap leading-relaxed">
                  {summaries[test.id] || 'Generating concise summary...'}
                </div>

                {/* Compact Bar Chart */}
                <div className="bg-white border rounded-md p-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <XAxis dataKey="student" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip contentStyle={{ fontSize: '0.8rem' }} />
                      <Bar dataKey="score" fill="#6366F1" barSize={25} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Student-Level Analysis */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {test.studentAttempts?.map((s: any) => (
                    <Card key={s.id} className="border bg-white shadow-sm p-3">
                      <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-sm font-semibold truncate">
                          {s.email}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-gray-700 space-y-1">
                        <p className="whitespace-pre-wrap">
                          {studentSummaries[`${test.id}_${s.email}`] || 'Analyzing...'}
                        </p>
                        <div className="pt-1">
                          <p className="text-[10px] text-gray-500 mb-1">Overall Score</p>
                          <Progress value={s.score || 0} className="h-1.5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

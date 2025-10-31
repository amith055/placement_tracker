'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

// ✅ Load API key from .env
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ✅ Temporary test data
const mockData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    testType: 'Aptitude Test',
    totalScore: 82,
    sections: {
      LogicalReasoning: 85,
      Quantitative: 80,
      Verbal: 75,
      DataInterpretation: 88,
    },
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    testType: 'Aptitude Test',
    totalScore: 74,
    sections: {
      LogicalReasoning: 70,
      Quantitative: 76,
      Verbal: 68,
      DataInterpretation: 82,
    },
  },
  {
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    testType: 'Aptitude Test',
    totalScore: 90,
    sections: {
      LogicalReasoning: 92,
      Quantitative: 87,
      Verbal: 88,
      DataInterpretation: 93,
    },
  },
];

// ✅ Function: Generate AI insights per student
async function generateStudentInsights(student: any): Promise<string> {
  if (!genAI) return '⚠️ Gemini API not configured.';

  const prompt = `
  Analyze the following student's aptitude test performance and give a short AI insight.

  Student: ${student.name}
  Test Type: ${student.testType}
  Section Scores:
  ${Object.entries(student.sections)
    .map(([k, v]) => `${k}: ${v}%`)
    .join('\n')}
  Total Score: ${student.totalScore}%

  Write 3–4 sentences covering:
  - Strengths & weaknesses
  - Suggestions for improvement
  - Suitable roles/domains based on performance.
  Be concise and professional.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // ✅ stable model
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return text.trim() || 'AI analysis not available.';
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return 'AI analysis not available.';
  }
}

// ✅ Function: Batch-level summary
async function generateBatchInsights(students: any[]): Promise<string> {
  if (!genAI) return '⚠️ Gemini API not configured.';

  const avg = {
    LogicalReasoning: Math.round(students.reduce((a, s) => a + s.sections.LogicalReasoning, 0) / students.length),
    Quantitative: Math.round(students.reduce((a, s) => a + s.sections.Quantitative, 0) / students.length),
    Verbal: Math.round(students.reduce((a, s) => a + s.sections.Verbal, 0) / students.length),
    DataInterpretation: Math.round(students.reduce((a, s) => a + s.sections.DataInterpretation, 0) / students.length),
  };

  const prompt = `
  Analyze these average batch scores and provide insights:

  Logical Reasoning: ${avg.LogicalReasoning}%
  Quantitative: ${avg.Quantitative}%
  Verbal: ${avg.Verbal}%
  Data Interpretation: ${avg.DataInterpretation}%

  Give 4–5 sentences including:
  - Strongest & weakest areas
  - Overall batch performance
  - Recommended training focus.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return text.trim() || 'Batch-level insights unavailable.';
  } catch (err: any) {
    console.error('Gemini Batch API Error:', err);
    return 'Batch-level insights unavailable.';
  }
}

// ✅ Main Component
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<{ student: any; aiInsights: string }[]>([]);
  const [batchInsights, setBatchInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAll = async () => {
      const results: { student: any; aiInsights: string }[] = [];

      for (const student of mockData) {
        const aiText = await generateStudentInsights(student);
        results.push({ student, aiInsights: aiText });
      }

      const batchAI = await generateBatchInsights(mockData);
      setAnalytics(results);
      setBatchInsights(batchAI);
      setLoading(false);
    };

    generateAll();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="animate-spin w-6 h-6 text-primary mb-2" />
        <p>Generating AI Analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-center">📊 Student Performance Analytics</h1>

      {analytics.map(({ student, aiInsights }, index) => (
        <Card key={index} className="border border-gray-300 shadow-lg w-full">
          <CardHeader>
            <CardTitle className="text-xl">{student.name}</CardTitle>
            <CardDescription>{student.testType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                  data={Object.entries(student.sections).map(([k, v]) => ({
                    subject: k,
                    score: v,
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name={student.name}
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(student.sections).map(([k, v]) => ({
                    section: k,
                    score: v,
                  }))}
                >
                  <XAxis dataKey="section" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insights */}
            <div className="mt-4 bg-gray-100 p-3 rounded-md text-sm">
              <strong>💡 AI Insights:</strong>
              <p className="mt-1 whitespace-pre-line">{aiInsights}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Batch Insights */}
      <Card className="border border-gray-300 shadow-lg w-full">
        <CardHeader>
          <CardTitle>🏫 Batch-Level Analytics</CardTitle>
          <CardDescription>Overall performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-line">
            {batchInsights}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

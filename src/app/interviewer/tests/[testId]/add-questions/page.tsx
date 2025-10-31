'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

export default function AddQuestionsPage() {
  const router = useRouter();
  const { testId } = useParams();
  const [testData, setTestData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch test details from Firestore
  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      const testRef = doc(db, 'int_tests', testId as string);
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        const data = testSnap.data();
        setTestData(data);

        // Initialize empty question rows with dynamic options
        const emptyRows = Array.from({ length: data.numQuestions }, (_, i) => ({
          slno: i + 1,
          question: '',
          options: [''], // start with 1 empty option
          correct: '',
        }));
        setQuestions(emptyRows);
      }
      setLoading(false);
    };

    fetchTest();
  }, [testId]);

  // ✅ Handle input changes for main question fields
  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // ✅ Handle option text change
  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  // ✅ Add new option to a question
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  // ✅ Remove an option
  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    setQuestions(updated);
  };

  // ✅ Save all questions to Firestore
  const handleSaveQuestions = async () => {
    if (!testId || !testData) return;

    try {
      const testRef = doc(db, 'int_tests', testId as string);
      const questionsRef = collection(testRef, 'questions');

      for (const q of questions) {
        await addDoc(questionsRef, q);
      }

      await updateDoc(testRef, { que_added: questions.length });

      alert(`✅ ${questions.length} questions were added successfully!`);
      router.push('/interviewer/tests');
    } catch (err) {
      console.error(err);
      alert('❌ Error saving questions. Please try again.');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading test details...</p>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Add Questions for Test: {testData?.testName || 'Untitled'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total Questions: {testData?.numQuestions}
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-center w-[60px]">Sl. No</th>
                  <th className="border p-2 text-left w-[400px]">Question</th>
                  <th className="border p-2 text-left w-[350px]">Options</th>
                  <th className="border p-2 text-left w-[160px]">Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, qIndex) => (
                  <tr key={qIndex} className="align-top">
                    <td className="border p-2 text-center">{q.slno}</td>

                    {/* ✅ Dynamic question field */}
                    <td className="border p-2">
                      <textarea
                        className="w-full border rounded-md p-2 resize-none overflow-hidden min-h-[40px]"
                        value={q.question}
                        onChange={(e) => {
                          handleInputChange(qIndex, 'question', e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder="Enter question..."
                      />
                    </td>

                    {/* ✅ Dynamic options list */}
                    <td className="border p-2">
                      <div className="flex flex-col gap-2">
                        {q.options.map((opt: string, optIndex: number) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <Input
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(qIndex, optIndex, e.target.value)
                              }
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            {q.options.length > 1 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeOption(qIndex, optIndex)}
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          + Add Option
                        </Button>
                      </div>
                    </td>

                    {/* ✅ Correct Answer (Dropdown from options) */}
<td className="border p-2">
  <div className="flex flex-col">
    <select
      className="border rounded-md p-2 bg-white text-sm"
      value={q.correct}
      onChange={(e) => handleInputChange(qIndex, 'correct', e.target.value)}
    >
      <option value="">Select...</option>
      {q.options
        .filter((opt: string) => opt.trim() !== '')
        .map((opt: string, idx: number) => (
          <option key={idx} value={opt}>
            {opt || `Option ${idx + 1}`}
          </option>
        ))}
    </select>
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveQuestions}>Save Questions</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

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

        // Initialize empty question rows
        const emptyRows = Array.from({ length: data.numQuestions }, (_, i) => ({
          slno: i + 1,
          question: '',
          op1: '',
          op2: '',
          op3: '',
          op4: '',
          op5: '',
          correct: '',
        }));
        setQuestions(emptyRows);
      }
      setLoading(false);
    };

    fetchTest();
  }, [testId]);

  // ✅ Handle input changes
  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...questions];
    updated[index][field] = value;
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

      // Update question count
      await updateDoc(testRef, {
        que_added: questions.length,
      });

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
                  <th className="border p-2 text-left w-[60px]">Sl. No</th>
                  <th className="border p-2 text-left w-[400px]">Question</th>
                  <th className="border p-2 text-left w-[150px]">Option 1</th>
                  <th className="border p-2 text-left w-[150px]">Option 2</th>
                  <th className="border p-2 text-left w-[150px]">Option 3</th>
                  <th className="border p-2 text-left w-[150px]">Option 4</th>
                  <th className="border p-2 text-left w-[150px]">Option 5</th>
                  <th className="border p-2 text-left w-[130px]">Correct Answer</th>
                </tr>
              </thead>

              <tbody>
                {questions.map((q, index) => (
                  <tr key={index} className="align-top">
                    <td className="border p-2 text-center">{q.slno}</td>

                    {/* ✅ Dynamic textarea for question */}
                    <td className="border p-2">
                      <textarea
                        className="w-full border rounded-md p-2 resize-none overflow-hidden min-h-[40px]"
                        value={q.question}
                        onChange={(e) => {
                          handleInputChange(index, 'question', e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder="Enter question..."
                      />
                    </td>

                    {/* ✅ Standard inputs for options */}
                    <td className="border p-2">
                      <Input
                        value={q.op1}
                        onChange={(e) =>
                          handleInputChange(index, 'op1', e.target.value)
                        }
                        placeholder="Option 1"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        value={q.op2}
                        onChange={(e) =>
                          handleInputChange(index, 'op2', e.target.value)
                        }
                        placeholder="Option 2"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        value={q.op3}
                        onChange={(e) =>
                          handleInputChange(index, 'op3', e.target.value)
                        }
                        placeholder="Option 3"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        value={q.op4}
                        onChange={(e) =>
                          handleInputChange(index, 'op4', e.target.value)
                        }
                        placeholder="Option 4"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        value={q.op5}
                        onChange={(e) =>
                          handleInputChange(index, 'op5', e.target.value)
                        }
                        placeholder="Option 5"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        value={q.correct}
                        onChange={(e) =>
                          handleInputChange(index, 'correct', e.target.value)
                        }
                        placeholder="Correct Answer"
                      />
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

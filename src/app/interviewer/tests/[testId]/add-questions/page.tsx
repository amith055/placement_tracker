'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
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
  const [saving, setSaving] = useState(false);

  // ✅ Fetch test details from Firestore
  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      const testRef = doc(db, 'int_tests', testId as string);
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        const data = testSnap.data();
        setTestData(data);

        const emptyRows = Array.from({ length: data.numQuestions }, (_, i) => ({
          slno: i + 1,
          question: '',
          options: [''],
          correct: '',
          image: null,
        }));
        setQuestions(emptyRows);
      }
      setLoading(false);
    };

    fetchTest();
  }, [testId]);

  // ✅ Handle question field change
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

  // ✅ Add new option
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

  // ✅ Handle image upload preview
  const handleImageUpload = (qIndex: number, file: File) => {
    const updated = [...questions];
    const imageUrl = URL.createObjectURL(file);
    updated[qIndex].image = { file, preview: imageUrl };
    setQuestions(updated);
  };

  // ✅ Save questions to Firestore with image upload
  const handleSaveQuestions = async () => {
    if (!testId || !testData) return;

    setSaving(true);
    try {
      for (const q of questions) {
        let img_link = null;

        // ✅ Upload image if present
        if (q.image && q.image.file) {
          const imageRef = ref(
            storage,
            `questions/${testId}/q${q.slno}_${Date.now()}`
          );
          await uploadBytes(imageRef, q.image.file);
          img_link = await getDownloadURL(imageRef);
        }

        // ✅ Add to "int_ques" collection
        await addDoc(collection(db, 'int_ques'), {
          slno: q.slno,
          question: q.question,
          options: q.options.filter((opt: string) => opt.trim() !== ''),
          correct_ans: q.correct,
          testid: testId,
          img_link: img_link || null,
        });
      }

      // ✅ Update the test document
      await updateDoc(doc(db, 'int_tests', testId as string), {
        que_added: questions.length,
      });

      alert(`✅ ${questions.length} questions added successfully!`);
      router.push('/interviewer/tests');
    } catch (err) {
      console.error('Error saving questions:', err);
      alert('❌ Error saving questions. Please try again.');
    } finally {
      setSaving(false);
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
                  <th className="border p-2 text-left w-[160px]">
                    Correct Answer
                  </th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, qIndex) => (
                  <tr key={qIndex} className="align-top">
                    <td className="border p-2 text-center">{q.slno}</td>

                    {/* ✅ Question + image upload */}
                    <td className="border p-2 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
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

                          {/* Image upload */}
                          <label className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border hover:bg-gray-200">
                            📷
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(qIndex, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Image preview */}
                        {q.image && (
                          <div className="relative w-[150px] mt-1">
                            <img
                              src={q.image.preview}
                              alt={`Question ${q.slno}`}
                              className="rounded-md border object-cover w-full h-auto"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 text-xs py-0 px-1"
                              onClick={() => {
                                const updated = [...questions];
                                updated[qIndex].image = null;
                                setQuestions(updated);
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ✅ Options */}
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

                    {/* ✅ Correct answer dropdown */}
                    <td className="border p-2">
                      <select
                        className="border rounded-md p-2 bg-white text-sm"
                        value={q.correct}
                        onChange={(e) =>
                          handleInputChange(qIndex, 'correct', e.target.value)
                        }
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveQuestions} disabled={saving}>
            {saving ? 'Saving...' : 'Save Questions'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

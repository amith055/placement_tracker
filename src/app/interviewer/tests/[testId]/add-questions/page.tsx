'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
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
import * as XLSX from 'xlsx';

export default function AddQuestionsPage() {
  const router = useRouter();
  const { testId } = useParams();
  const [testData, setTestData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch test details + questions from subcollection
  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      if (!testId) return;

      const testRef = doc(db, 'int_tests', testId as string);
      const testSnap = await getDoc(testRef);

      if (!testSnap.exists()) {
        setLoading(false);
        return;
      }

      const data = testSnap.data();
      setTestData(data);

      // ⚡ Fetch existing questions from subcollection
      const qRef = collection(db, 'int_tests', testId as string, 'questions');
      const qSnap = await getDocs(qRef);

      const existingQuestions = qSnap.docs.map((docSnap, idx) => ({
        id: docSnap.id,
        slno: docSnap.data().slno || idx + 1,
        question: docSnap.data().question || '',
        options: docSnap.data().options || [''],
        correct: docSnap.data().correct_ans || '',
        image: docSnap.data().img_link
          ? { preview: docSnap.data().img_link, file: null }
          : null,
      }));

      // ⚡ Fill remaining empty rows up to total question count
      const emptySlots = Math.max(data.numQuestions - existingQuestions.length, 0);
      const emptyRows = Array.from({ length: emptySlots }, (_, i) => ({
        slno: existingQuestions.length + i + 1,
        question: '',
        options: [''],
        correct: '',
        image: null,
      }));

      setQuestions([...existingQuestions, ...emptyRows]);
      setLoading(false);
    };

    fetchTestAndQuestions();
  }, [testId]);

  // ✅ Excel Import
  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const parsedQuestions = jsonData.map((row: any, index: number) => {
        const optionKeys = Object.keys(row).filter((key) =>
          key.toLowerCase().startsWith('option')
        );

        const options = optionKeys
          .map((key) => row[key])
          .filter((opt) => opt !== undefined && opt !== null)
          .map((opt) => String(opt).trim())
          .filter((opt) => opt !== '');

        return {
          slno: index + 1,
          question: String(row['Question'] || '').trim(),
          options,
          correct: String(row['Correct Option'] || '').trim(),
          image: null,
        };
      });

      // ⚡ Fill empty slots if fewer imported
      const total = testData?.numQuestions || parsedQuestions.length;
      const emptySlots = Math.max(total - parsedQuestions.length, 0);
      const emptyRows = Array.from({ length: emptySlots }, (_, i) => ({
        slno: parsedQuestions.length + i + 1,
        question: '',
        options: [''],
        correct: '',
        image: null,
      }));

      setQuestions([...parsedQuestions, ...emptyRows]);
    };

    reader.readAsArrayBuffer(file);
  };

  // ✅ Handle input, options, image
  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    setQuestions(updated);
  };

  const handleImageUpload = (qIndex: number, file: File) => {
    const updated = [...questions];
    const imageUrl = URL.createObjectURL(file);
    updated[qIndex].image = { file, preview: imageUrl };
    setQuestions(updated);
  };

  // ✅ Save Questions to Subcollection
  const handleSaveQuestions = async () => {
    if (!testId || !testData) return;

    setSaving(true);
    try {
      const questionsRef = collection(db, 'int_tests', testId as string, 'questions');

      for (const q of questions) {
        let img_link = null;

        if (q.image && q.image.file) {
          const imageRef = ref(storage, `questions/${testId}/q${q.slno}_${Date.now()}`);
          await uploadBytes(imageRef, q.image.file);
          img_link = await getDownloadURL(imageRef);
        } else if (q.image?.preview && !q.image.file) {
          img_link = q.image.preview; // keep existing link
        }

        await addDoc(questionsRef, {
          slno: q.slno,
          question: q.question,
          options: q.options.filter((opt: string) => String(opt).trim() !== ''),
          correct_ans: q.correct,
          img_link: img_link || null,
        });
      }

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
          {/* Excel Import */}
          <div className="mb-4 flex justify-end">
            <input
              id="excelInput"
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleExcelImport}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('excelInput')?.click()}
            >
              📄 Import Excel
            </Button>
          </div>

          {/* ✅ Table */}
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
                    <td className="border p-2 align-top">
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="w-full border rounded-md p-2 resize-none overflow-hidden min-h-[40px]"
                          value={q.question}
                          onChange={(e) =>
                            handleInputChange(qIndex, 'question', e.target.value)
                          }
                          placeholder="Enter question..."
                        />
                        {q.image && (
                          <img
                            src={q.image.preview}
                            alt="preview"
                            className="rounded-md border w-[150px]"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(qIndex, e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </td>

                    <td className="border p-2">
                      {q.options.map((opt: string, optIndex: number) => (
                        <div key={optIndex} className="flex gap-2 mb-1">
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
                    </td>

                    <td className="border p-2">
                      <select
                        className="border rounded-md p-2 bg-white text-sm w-full"
                        value={q.correct}
                        onChange={(e) =>
                          handleInputChange(qIndex, 'correct', e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        {q.options.map((opt: string, idx: number) => (
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

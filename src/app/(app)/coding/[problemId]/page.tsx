'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Editor } from '@monaco-editor/react';
import { Code, Play } from 'lucide-react';
import { problemDetails } from '@/lib/mock-data';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CodingProblemPage({ params, userId }: { params: { problemId: string }, userId: string }) {
  const problem = (problemDetails as any)[params.problemId];
  const [code, setCode] = useState('// Write your code here...');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(63); // default: JavaScript

  if (!problem) return <div>Problem not found.</div>;

  const getEditorLanguage = (id: number) => {
    switch (id) {
      case 71: return 'python';
      case 54: return 'cpp';
      case 50: return 'c';
      case 62: return 'java';
      case 63: return 'javascript';
      default: return 'plaintext';
    }
  };

  const getDifficultyBadgeVariant = (difficulty?: string) => {
    if (!difficulty) return 'outline';
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'default';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  const handleRunCode = async () => {
    setLoading(true);
    setOutput('Running your code...');

    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': '7ffb581d52msh595482911e43679p10c337jsnad904bcf12f3',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language,
          stdin: '',
        }),
      });

      const result = await response.json();

      if (result.stdout) setOutput(result.stdout);
      else if (result.stderr) setOutput(result.stderr);
      else if (result.compile_output) setOutput(result.compile_output);
      else setOutput('No output received.');
    } catch (error) {
      console.error(error);
      setOutput('Error running code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setOutput('Submitting your code...');

    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': '7ffb581d52msh595482911e43679p10c337jsnad904bcf12f3',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language,
          stdin: '',
        }),
      });

      const result = await response.json();

      // Check if there are no errors
      const hasError = result.stderr || result.compile_output;
      if (hasError) {
        setOutput(`Submission failed:\n${result.stderr || result.compile_output}`);
      } else {
        setOutput(result.stdout || 'Code ran successfully!');

        // Update coding_score in Firestore
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          coding_score: increment(25),
        });
        alert('Congratulations! Your coding score has been updated.');
      }
    } catch (error) {
      console.error(error);
      setOutput('Error submitting code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-full flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left Section: Problem Details */}
      <div className="flex flex-col space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold">{problem.title}</h1>
            <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>
              {problem.difficulty || 'Unknown'}
            </Badge>
          </div>
          <p className="mt-4 text-muted-foreground">{problem.description}</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Example:</h2>
          <pre className="mt-2 rounded-md bg-muted p-4 text-sm font-code whitespace-pre-wrap">
            {problem.example}
          </pre>
        </div>
      </div>

      {/* Right Section: Editor & Output */}
      <div className="flex flex-col rounded-lg border">
        {/* Header with Run/Submit buttons and language selector */}
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-lg font-semibold px-2">Solution</h2>
            <select
              className="border rounded-md p-1 text-sm"
              value={language}
              onChange={(e) => setLanguage(Number(e.target.value))}
            >
              <option value={63}>JavaScript (Node.js)</option>
              <option value={71}>Python 3.11</option>
              <option value={54}>C++</option>
              <option value={50}>C</option>
              <option value={62}>Java</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRunCode} disabled={loading}>
              <Code className="mr-2 h-4 w-4" />
              {loading ? 'Running...' : 'Run Code'}
            </Button>
            <Button size="sm" onClick={handleSubmitCode} disabled={loading}>
              <Play className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 p-2">
          <Editor
            height="400px"
            language={getEditorLanguage(language)}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
          />
        </div>

        {/* Output Section */}
        <div className="border-t p-2 bg-muted min-h-[100px] overflow-auto">
          <h3 className="font-semibold mb-1">Output:</h3>
          <pre className="text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
}

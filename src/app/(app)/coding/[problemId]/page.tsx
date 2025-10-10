'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { problemDetails } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Code, Play } from 'lucide-react';

export default function CodingProblemPage({ params }: { params: { problemId: string } }) {
  const problem = (problemDetails as any)[params.problemId];

  if (!problem) {
    return <div>Problem not found.</div>;
  }

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
        case 'easy': return 'default';
        case 'medium': return 'secondary';
        case 'hard': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <div className="grid h-full flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col space-y-4">
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-2xl font-bold">{problem.title}</h1>
                <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>{problem.difficulty}</Badge>
            </div>
            <p className="mt-4 text-muted-foreground">{problem.description}</p>
        </div>
        <div className="rounded-lg border p-4">
            <h2 className="font-semibold">Example:</h2>
            <pre className="mt-2 rounded-md bg-muted p-4 text-sm font-code">{problem.example}</pre>
        </div>
      </div>
      <div className="flex flex-col rounded-lg border">
        <div className="flex items-center justify-between border-b p-2">
            <h2 className="font-headline text-lg font-semibold px-2">Solution</h2>
            <div className='flex gap-2'>
                <Button variant="outline" size="sm">
                    <Code className="mr-2 h-4 w-4" />
                    Run Code
                </Button>
                <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Submit
                </Button>
            </div>
        </div>
        <div className="flex-1 p-2">
            <Textarea
                placeholder="Write your code here..."
                className="h-full min-h-[400px] resize-none border-0 font-code focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        </div>
      </div>
    </div>
  );
}

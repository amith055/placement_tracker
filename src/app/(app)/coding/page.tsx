import { Button } from '@/components/ui/button';
import { codingProblems } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link';

export default function CodingPage() {

    const getDifficultyBadgeVariant = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'default';
            case 'medium': return 'secondary';
            case 'hard': return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Coding Practice</h1>
        <p className="text-muted-foreground">Select a problem to start coding.</p>
      </div>
      <div className="rounded-lg border">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {codingProblems.map((problem) => (
                <TableRow key={problem.id}>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>
                        <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>{problem.difficulty}</Badge>
                    </TableCell>
                    <TableCell>{problem.category}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/coding/${problem.id}`}>Solve</Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}

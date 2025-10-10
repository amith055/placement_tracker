import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { readinessScore, upcomingTests } from '@/lib/mock-data';
import { BarChart3, BookCopy, Calendar, Code, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function SkillCard({ title, score, icon: Icon, progressColor }: { title: string, score: number, icon: React.ElementType, progressColor: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{score}%</div>
                <Progress value={score} className="mt-2 h-2" indicatorClassName={progressColor} />
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Welcome back, Alex!</CardTitle>
                <CardDescription>Here&apos;s your progress overview. Keep up the great work!</CardDescription>
            </CardHeader>
        </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Placement Readiness Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
                <div className="relative h-48 w-48">
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                        <path
                        className="text-muted"
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        />
                        <path
                        className="text-primary"
                        strokeDasharray={`${readinessScore.total}, 100`}
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-headline text-4xl font-bold">{readinessScore.total}%</span>
                        <span className="text-sm text-muted-foreground">Ready</span>
                    </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    Your overall score based on your performance across all categories.
                </p>
            </CardContent>
        </Card>

        <div className="grid gap-4 lg:col-span-2">
            <SkillCard title="Aptitude" score={readinessScore.aptitude} icon={BookCopy} progressColor="bg-sky-500" />
            <SkillCard title="Coding Skills" score={readinessScore.coding} icon={Code} progressColor="bg-green-500" />
            <SkillCard title="Soft Skills" score={readinessScore.softSkills} icon={Users} progressColor="bg-amber-500" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Upcoming Tests</CardTitle>
          <CardDescription>Stay prepared for your upcoming assessments.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Test Title</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingTests.map(test => (
                        <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.title}</TableCell>
                            <TableCell className="hidden md:table-cell">{test.type}</TableCell>
                            <TableCell>{test.date}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

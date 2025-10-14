'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookCopy, Calendar, Code, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface UserData {
  appti_score: number;
  coding_score: number;
  softskill_score: number;
  email: string;
  name: string;
  usn: string;
  year: string;
}

interface Test {
  id: string;
  title: string;
  type: string;
  date: string;
}

const upcomingTests: Test[] = [
  { id: '1', title: 'Aptitude Test 1', type: 'Aptitude', date: '2025-10-15' },
  { id: '2', title: 'Coding Test 1', type: 'Coding', date: '2025-10-20' },
  { id: '3', title: 'Soft Skills Assessment', type: 'Soft Skills', date: '2025-10-25' },
];

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
  const [user, setUser] = useState<UserData | null>(null);
  const [readinessScore, setReadinessScore] = useState({
    total: 0,
    aptitude: 0,
    coding: 0,
    softSkills: 0,
  });

  const email = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as UserData;
          setUser(data);

          const total = Math.round(
            data.appti_score * 0.3 + data.coding_score * 0.4 + data.softskill_score * 0.3
          );

          setReadinessScore({
            total,
            aptitude: data.appti_score,
            coding: data.coding_score,
            softSkills: data.softskill_score,
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUser();
  }, [email]);

  if (!user) return <div className="p-6 text-center">Loading user data...</div>;

  // ✅ Determine color & rating based on total score
  const getReadinessColor = (score: number) => {
    if (score < 35) return 'text-red-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getReadinessLabel = (score: number) => {
    if (score < 35) return 'Weak';
    if (score < 70) return 'Average';
    return 'Excellent';
  };

  const readinessColor = getReadinessColor(readinessScore.total);
  const readinessLabel = getReadinessLabel(readinessScore.total);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Welcome back, {user.name}!
            </CardTitle>
            <CardDescription>
              ({user.usn} - {user.year}) <br />
              Here's your progress overview. Keep up the great work!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* ✅ Readiness Section */}
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
                  className={readinessColor}
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
                <span className={`font-headline text-4xl font-bold ${readinessColor}`}>
                  {readinessScore.total}%
                </span>
                <span className="text-sm text-muted-foreground">Ready</span>
                {/* ✅ Rating label below */}
                <span className={`text-base font-semibold mt-1 ${readinessColor}`}>
                  {readinessLabel}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Your overall readiness score based on your Aptitude, Coding, and Soft Skills.
            </p>
          </CardContent>
        </Card>

        {/* Skill Cards */}
        <div className="grid gap-4 lg:col-span-2">
          <SkillCard title="Aptitude" score={readinessScore.aptitude} icon={BookCopy} progressColor="bg-sky-500" />
          <SkillCard title="Coding Skills" score={readinessScore.coding} icon={Code} progressColor="bg-green-500" />
          <SkillCard title="Soft Skills" score={readinessScore.softSkills} icon={Users} progressColor="bg-amber-500" />
        </div>
      </div>

      {/* Upcoming Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Upcoming Tests
          </CardTitle>
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

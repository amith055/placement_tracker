'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookCopy, Calendar, Code, Users, Loader2, PlayCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// ================== Interfaces ===================
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
  company_name: string;
  test_title: string;
  questions: number;
  duration: string;
  date: string;
  time: string;
  scheduledDateTime: Date;
  endDateTime: Date;
}

// ================== Skill Card ===================
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

// ================== Dashboard Page ===================
export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [readinessScore, setReadinessScore] = useState({
    total: 0,
    aptitude: 0,
    coding: 0,
    softSkills: 0,
  });

  const [ongoingTests, setOngoingTests] = useState<Test[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [now, setNow] = useState(new Date());

  const email = typeof window !== 'undefined' ? localStorage.getItem("userEmail") || "" : "";

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch user data
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

  // ✅ Fetch & classify tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const q = query(collection(db, "int_tests"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        const currentTime = new Date();

        const allTests: Test[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const dateStr = data.date || "";
          const timeStr = data.time || "";
          const durationStr = data.duration?.toString() || "0";
          const durationNum = parseInt(durationStr.replace(/\D/g, "")) || 0;

          const scheduledDateTime = new Date(`${dateStr} ${timeStr}`);
          const endDateTime = new Date(scheduledDateTime.getTime() + durationNum * 60000);

          return {
            id: doc.id,
            company_name: data.company_name || "Unknown",
            test_title: data.testName || "Untitled Test",
            questions: data.numQuestions || 0,
            duration: durationStr.includes("min") ? durationStr : `${durationStr} mins`,
            date: data.date || "N/A",
            time: data.time || "N/A",
            scheduledDateTime,
            endDateTime,
          };
        });

        const ongoing = allTests.filter(
          (t) => t.scheduledDateTime <= currentTime && t.endDateTime >= currentTime
        );
        const upcoming = allTests.filter((t) => t.scheduledDateTime > currentTime);

        ongoing.sort((a, b) => a.scheduledDateTime.getTime() - b.scheduledDateTime.getTime());
        upcoming.sort((a, b) => a.scheduledDateTime.getTime() - b.scheduledDateTime.getTime());

        setOngoingTests(ongoing);
        setUpcomingTests(upcoming);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoadingTests(false);
      }
    };

    fetchTests();
  }, []);

  if (!user) return <div className="p-6 text-center">Loading user data...</div>;

  // ✅ Helper: countdown
  const formatTimeLeft = (target: Date) => {
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return "00:00:00";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // ✅ Readiness color logic
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

  // ✅ Table renderer
  const renderTestTable = (tests: Test[], type: "ongoing" | "upcoming") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sl. No</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-center">
            <Clock className="inline h-4 w-4 mr-1" />
            {type === "ongoing" ? "Closes in" : "Starts in"}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tests.map((test, index) => (
          <TableRow
            key={test.id}
            onClick={
              type === "ongoing"
                ? () => (window.location.href = `/dashboard/test/${test.id}`)
                : undefined
            }
            className={`transition-colors ${
              type === "ongoing"
                ? "cursor-pointer hover:bg-green-50"
                : "cursor-not-allowed bg-gray-50 opacity-80"
            }`}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{test.company_name}</TableCell>
            <TableCell>{test.test_title}</TableCell>
            <TableCell>{test.questions}</TableCell>
            <TableCell>{test.duration}</TableCell>
            <TableCell>{test.date}</TableCell>
            <TableCell>{test.time}</TableCell>
            <TableCell className="text-center font-semibold">
              {type === "ongoing"
                ? formatTimeLeft(test.endDateTime)
                : formatTimeLeft(test.scheduledDateTime)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // ================== Render UI ===================
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Welcome + Readiness Section */}
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

        {/* Readiness Score */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Placement Readiness Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="relative h-48 w-48">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className={readinessColor}
                  strokeDasharray={`${readinessScore.total}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
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

      {/* Ongoing Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <PlayCircle className="h-5 w-5" /> Ongoing Tests
          </CardTitle>
          <CardDescription>Tests that are currently live.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTests ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
              Loading tests...
            </div>
          ) : ongoingTests.length === 0 ? (
            <p className="text-center text-muted-foreground">No ongoing tests right now.</p>
          ) : (
            renderTestTable(ongoingTests, "ongoing")
          )}
        </CardContent>
      </Card>

      {/* Upcoming Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Upcoming Tests
          </CardTitle>
          <CardDescription>Prepare for your scheduled assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTests ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
              Loading tests...
            </div>
          ) : upcomingTests.length === 0 ? (
            <p className="text-center text-muted-foreground">No upcoming tests found.</p>
          ) : (
            renderTestTable(upcomingTests, "upcoming")
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// TypeScript interface for your Firestore data
interface AptitudeTest {
  id: string;
  title: string;
  duration: number;
  ques: number;
}

export default function AptitudePage() {
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'apptitude_questions')); // your Firestore collection name
        const fetchedTests: AptitudeTest[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AptitudeTest[];
        setTests(fetchedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <p>Loading aptitude tests...</p>;
  }

  if (tests.length === 0) {
    return <p>No aptitude tests found in Firestore.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Aptitude Practice</h1>
        <p className="text-muted-foreground">
          Choose a test to begin your practice session.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>
                A set of questions to test your skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <HelpCircle className="mr-1 h-4 w-4" />
                {test.ques} Questions
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {test.duration} Mins
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/aptitude/${test.id}`}>Start Test</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

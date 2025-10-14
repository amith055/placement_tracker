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
import { Clock, HelpCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ReactPlayer from 'react-player';
import { Skeleton } from '@/components/ui/skeleton';

// TypeScript interfaces
interface SoftSkillTest {
  id: string;
  title: string;
  duration: number;
  ques: number;
}

interface SoftSkillVideo {
  id: string;
  title: string;
  url: string;
}

export default function SoftSkillPage() {
  const [tests, setTests] = useState<SoftSkillTest[]>([]);
  const [videos, setVideos] = useState<SoftSkillVideo[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Fetch Tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'softskill_test'));
        const fetchedTests: SoftSkillTest[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SoftSkillTest[];
        setTests(fetchedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  // Fetch Videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'video'));
        const fetchedVideos: SoftSkillVideo[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SoftSkillVideo[];
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Soft Skill Practice</h1>
        <p className="text-muted-foreground">
          Choose a test to begin your practice session.
        </p>
      </div>

      {/* Tests Section */}
      {loadingTests ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <p>No soft skill tests found in Firestore.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-10">
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
                  <Link href={`/soft-skills/${test.id}`}>Start Test</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Videos Section */}
      <div className="mb-6 mt-10">
        <h2 className="font-headline text-2xl font-bold mb-3 flex items-center">
          <PlayCircle className="mr-2 h-6 w-6 text-primary" />
          Soft Skill Videos
        </h2>
        <p className="text-muted-foreground mb-5">
          Watch curated videos to improve your communication, teamwork, and leadership skills.
        </p>

        {loadingVideos ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p>No videos found in Firestore.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden shadow-lg">
                <div className="aspect-video">
                  <iframe width="560" height="315" src="https://www.youtube.com/embed/pJ7RgUCEd5M?si=8ygakokbBkOp0ESh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

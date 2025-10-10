import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, BrainCircuit, Code, Users, BarChart3, Lightbulb, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'Aptitude Practice',
    description: 'Sharpen your skills with timed tests and a vast question bank.',
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: 'Coding Challenges',
    description: 'Solve problems in our in-browser editor and get instant feedback.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Soft Skills Tracking',
    description: 'Assess your communication and teamwork abilities.',
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Tips',
    description: 'Get personalized practice suggestions for your weak areas.',
  },
  {
    icon: <Trophy className="h-8 w-8 text-primary" />,
    title: 'Leaderboards',
    description: 'Compete with your batchmates and track your progress.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Admin Dashboard',
    description: 'Admins can manage questions and monitor student performance.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">NexusPrep</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-12 md:grid-cols-2 md:px-6 md:py-24">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              Unlock Your Career Potential
            </h2>
            <p className="text-lg text-muted-foreground">
              NexusPrep is your all-in-one platform for acing placement interviews. Personalized practice, real-time feedback, and AI-driven insights to land your dream job.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 w-full md:h-96">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="rounded-lg object-cover shadow-2xl"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
        </section>

        <section id="features" className="bg-card py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="font-headline text-3xl font-bold md:text-4xl">
                Everything You Need to Succeed
              </h3>
              <p className="mt-4 text-muted-foreground md:text-lg">
                From technical skills to soft skills, we've got you covered.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-3">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-headline text-xl font-semibold">{feature.title}</h4>
                    <p className="mt-1 text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} NexusPrep. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:underline">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

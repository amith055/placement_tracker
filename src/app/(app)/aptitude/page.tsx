import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { aptitudeTests } from '@/lib/mock-data';
import { Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function AptitudePage() {
  return (
    <div>
        <div className="mb-6">
            <h1 className="font-headline text-3xl font-bold">Aptitude Practice</h1>
            <p className="text-muted-foreground">Choose a test to begin your practice session.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aptitudeTests.map((test) => (
            <Card key={test.id}>
                <CardHeader>
                <CardTitle>{test.title}</CardTitle>
                <CardDescription>A set of questions to test your skills.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <HelpCircle className="mr-1 h-4 w-4" />
                        {test.questions} Questions
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

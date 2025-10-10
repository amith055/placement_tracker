import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { softSkills } from '@/lib/mock-data';
import { Star } from 'lucide-react';

export default function SoftSkillsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Soft Skills Tracker</h1>
        <p className="text-muted-foreground">Assess your skills and view mentor feedback.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Self-Assessment</CardTitle>
            <CardDescription>Rate your proficiency in the following areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {softSkills.map((skill) => (
              <div key={skill.id}>
                <div className="mb-2 flex justify-between">
                  <h3 className="font-medium">{skill.name}</h3>
                  <span className="font-semibold text-primary">{skill.selfAssesment}/10</span>
                </div>
                <Slider defaultValue={[skill.selfAssesment]} max={10} step={1} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coach & Mentor Ratings</CardTitle>
            <CardDescription>Feedback provided by your mentors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {softSkills.map((skill) => (
              <div key={skill.id}>
                <h3 className="font-medium">{skill.name}</h3>
                <div className="mt-2 flex items-center gap-1">
                  {skill.mentorRating ? (
                    <>
                      {[...Array(skill.mentorRating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                      {[...Array(10 - skill.mentorRating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-muted" />
                      ))}
                       <span className="ml-2 font-semibold text-amber-500">{skill.mentorRating}/10</span>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rating yet.</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { weakAreas } from '@/lib/mock-data';
import { generatePracticeTips, FormState } from './actions';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tips
                </>
            )}
        </Button>
    )
}


export default function PracticeTipsPage() {
    const initialState: FormState = { message: '' };
    const [state, formAction] = useFormState(generatePracticeTips, initialState);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weak Area Detection</CardTitle>
          <CardDescription>Select your weak areas to get personalized practice tips from our AI coach.</CardDescription>
        </CardHeader>
        <CardContent>
            <form action={formAction} className="space-y-6">
                <div className="space-y-4">
                {weakAreas.map((area, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <Checkbox id={`area-${index}`} name="weakAreas" value={area} />
                        <Label htmlFor={`area-${index}`} className="font-normal">
                            {area}
                        </Label>
                    </div>
                ))}
                </div>
                 {state.errors?.weakAreas && (
                    <p className="text-sm font-medium text-destructive">
                        {state.errors.weakAreas[0]}
                    </p>
                )}
                <SubmitButton />
            </form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI-Powered Practice Tips</CardTitle>
          <CardDescription>Here are some actionable tips to help you improve.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            {state.message === 'success' && state.tips ? (
                <ul className="space-y-4">
                    {state.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-400 mt-1" />
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            ) : state.message && state.message !== 'success' ? (
                 <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center text-muted-foreground">
                        <p className="font-semibold text-destructive">Error</p>
                        <p className="mt-2 text-sm">{state.message}</p>
                    </div>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center text-muted-foreground">
                        <p className="font-semibold">Your tips will appear here</p>
                        <p className="mt-2 text-sm">Select your weak areas and click "Generate Tips".</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

'use server';

import { getPersonalizedPracticeTips } from '@/ai/flows/personalized-practice-tips';
import { z } from 'zod';

const weakAreasSchema = z.object({
  weakAreas: z.array(z.string()).min(1, { message: 'Please select at least one weak area.'}),
});

export type FormState = {
    message: string;
    tips?: string[];
    errors?: {
        weakAreas?: string[];
    }
}

export async function generatePracticeTips(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = weakAreasSchema.safeParse({
    weakAreas: formData.getAll('weakAreas'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await getPersonalizedPracticeTips(validatedFields.data);
    if (result && result.practiceTips) {
        return {
            message: 'success',
            tips: result.practiceTips,
        };
    }
    return { message: "Failed to generate tips. The AI model didn't return a valid response." };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred while generating tips.',
    };
  }
}

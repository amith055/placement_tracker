'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized practice tips to students based on their weak areas.
 *
 * - `getPersonalizedPracticeTips`: A function that takes a student's weak areas as input and returns personalized practice tips.
 * - `PersonalizedPracticeTipsInput`: The input type for the `getPersonalizedPracticeTips` function, defining the student's weak areas.
 * - `PersonalizedPracticeTipsOutput`: The output type for the `getPersonalizedPracticeTips` function, providing personalized practice tips.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedPracticeTipsInputSchema = z.object({
  weakAreas: z
    .array(z.string())
    .describe("An array of strings representing the student's weak areas."),
});
export type PersonalizedPracticeTipsInput = z.infer<
  typeof PersonalizedPracticeTipsInputSchema
>;

const PersonalizedPracticeTipsOutputSchema = z.object({
  practiceTips: z
    .array(z.string())
    .describe('An array of personalized practice tips for the identified weak areas.'),
});
export type PersonalizedPracticeTipsOutput = z.infer<
  typeof PersonalizedPracticeTipsOutputSchema
>;

export async function getPersonalizedPracticeTips(
  input: PersonalizedPracticeTipsInput
): Promise<PersonalizedPracticeTipsOutput> {
  return personalizedPracticeTipsFlow(input);
}

const personalizedPracticeTipsPrompt = ai.definePrompt({
  name: 'personalizedPracticeTipsPrompt',
  input: {schema: PersonalizedPracticeTipsInputSchema},
  output: {schema: PersonalizedPracticeTipsOutputSchema},
  prompt: `You are an AI career coach providing personalized practice tips to students.

  Based on the student's weak areas, provide specific and actionable practice tips.
  The practice tips should be tailored to help the student improve in those areas.

  Weak Areas:
  {{#each weakAreas}}- {{{this}}}
  {{/each}}
  `,
});

const personalizedPracticeTipsFlow = ai.defineFlow(
  {
    name: 'personalizedPracticeTipsFlow',
    inputSchema: PersonalizedPracticeTipsInputSchema,
    outputSchema: PersonalizedPracticeTipsOutputSchema,
  },
  async input => {
    const {output} = await personalizedPracticeTipsPrompt(input);
    return output!;
  }
);

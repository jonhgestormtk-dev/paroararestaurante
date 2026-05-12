'use server';
/**
 * @fileOverview An AI agent that generates poetic, culturally-rich descriptions for menu items.
 *
 * - enrichDishDescription - A function that handles the dish description generation process.
 * - EnrichDishDescriptionInput - The input type for the enrichDishDescription function.
 * - EnrichDishDescriptionOutput - The return type for the enrichDishDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnrichDishDescriptionInputSchema = z.object({
  dishName: z.string().describe('The name of the dish.'),
  ingredients: z
    .array(z.string())
    .describe('A list of key ingredients in the dish.'),
});
export type EnrichDishDescriptionInput = z.infer<
  typeof EnrichDishDescriptionInputSchema
>;

const EnrichDishDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A poetic, culturally-rich description of the dish.'),
});
export type EnrichDishDescriptionOutput = z.infer<
  typeof EnrichDishDescriptionOutputSchema
>;

export async function enrichDishDescription(
  input: EnrichDishDescriptionInput
): Promise<EnrichDishDescriptionOutput> {
  return aiEnrichDishDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enrichDishDescriptionPrompt',
  input: {schema: EnrichDishDescriptionInputSchema},
  output: {schema: EnrichDishDescriptionOutputSchema},
  prompt: `You are an expert culinary storyteller for the 'Paroara | Restaurante | Beer Drik's' restaurant.

Your task is to generate a poetic, culturally-rich, and captivating description for a menu item.
The description should reflect the theme of 'Rusticidade Amazônica Premium', drawing inspiration from Marajoara culture, Amazonian nature, wood, buffalo, natural fibers, and sophisticated regional restaurants.

The description should be sophisticated, regional, artisanal, welcoming, premium without exaggeration, organic, and elegant.
Avoid modern, futuristic, or overly technological language.

Dish Name: {{{dishName}}}
Ingredients: {{{ingredients}}}

Generate a description that captures the essence of this dish within the specified theme.
`,
});

const aiEnrichDishDescriptionFlow = ai.defineFlow(
  {
    name: 'aiEnrichDishDescriptionFlow',
    inputSchema: EnrichDishDescriptionInputSchema,
    outputSchema: EnrichDishDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate dish description.');
    }
    return output;
  }
);

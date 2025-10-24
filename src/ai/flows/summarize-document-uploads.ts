'use server';

/**
 * @fileOverview A flow that summarizes document uploads for the previous day.
 *
 * - summarizeDocumentUploads - A function that summarizes document uploads.
 * - SummarizeDocumentUploadsOutput - The return type for the summarizeDocumentUploads function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentUploadsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of all document uploads for the previous day.'),
});

export type SummarizeDocumentUploadsOutput = z.infer<
  typeof SummarizeDocumentUploadsOutputSchema
>;

export async function summarizeDocumentUploads(): Promise<
  SummarizeDocumentUploadsOutput
> {
  return summarizeDocumentUploadsFlow();
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentUploadsPrompt',
  output: {schema: SummarizeDocumentUploadsOutputSchema},
  prompt: `Summarize all document uploads for the previous day for auditing purposes.  Include the number of documents uploaded, the types of documents uploaded, and any other relevant information. `,
});

const summarizeDocumentUploadsFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentUploadsFlow',
    outputSchema: SummarizeDocumentUploadsOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);

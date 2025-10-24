'use server';

/**
 * @fileOverview An AI flow for extracting structured data from educational documents.
 *
 * - extractDocumentData - Extracts data from an educational document image.
 * - ExtractDocumentDataInput - The input type for the flow.
 * - ExtractDocumentDataOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDocumentDataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo of an educational document (like a degree or marksheet), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDocumentDataInput = z.infer<typeof ExtractDocumentDataInputSchema>;

const ExtractDocumentDataOutputSchema = z.object({
  studentName: z.string().describe('Full name of the student mentioned in the document.'),
  universityName: z.string().describe('Name of the issuing university or institution.'),
  degreeName: z.string().describe('Name of the degree, certificate, or marksheet title.'),
  dateOfIssue: z.string().describe('The date the document was issued, in YYYY-MM-DD format.'),
  extractedText: z.string().describe('The full text extracted from the document using OCR.'),
});
export type ExtractDocumentDataOutput = z.infer<typeof ExtractDocumentDataOutputSchema>;

export async function extractDocumentData(input: ExtractDocumentDataInput): Promise<ExtractDocumentDataOutput> {
  return extractDocumentDataFlow(input);
}

const extractionPrompt = ai.definePrompt({
  name: 'extractDocumentDataPrompt',
  input: {schema: ExtractDocumentDataInputSchema},
  output: {schema: ExtractDocumentDataOutputSchema},
  prompt: `You are an expert AI specializing in extracting structured information from educational documents.
  Your task is to analyze the provided document image and extract the following key details:
  - Student's full name.
  - Name of the university or issuing institution.
  - The official name of the degree or certificate.
  - The date of issue in YYYY-MM-DD format.
  - The full text content of the document.

  Prioritize accuracy. If a field is not clearly present, indicate that it is not available.

  Document Image: {{media url=documentDataUri}}
  `,
});

const extractDocumentDataFlow = ai.defineFlow(
  {
    name: 'extractDocumentDataFlow',
    inputSchema: ExtractDocumentDataInputSchema,
    outputSchema: ExtractDocumentDataOutputSchema,
  },
  async input => {
    const {output} = await extractionPrompt(input);
    return output!;
  }
);

    
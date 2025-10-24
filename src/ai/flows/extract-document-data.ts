'use server';

/**
 * @fileOverview An AI flow for extracting structured data from various documents.
 *
 * - extractDocumentData - Extracts data from a document image.
 * - ExtractDocumentDataInput - The input type for the flow.
 * - ExtractDocumentDataOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDocumentDataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo of a document (like a degree, marksheet, or certificate), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDocumentDataInput = z.infer<typeof ExtractDocumentDataInputSchema>;

const ExtractDocumentDataOutputSchema = z.object({
  documentType: z.string().describe('The type of document identified (e.g., "Degree Certificate", "Income Certificate", "Marksheet").'),
  documentData: z.any().describe('An object containing the structured key-value pairs extracted from the document.'),
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
  prompt: `You are an expert AI specializing in extracting structured information from official documents.
  Your task is to analyze the provided document image and extract the following details:
  1. Identify the 'documentType'.
  2. Extract all relevant information as key-value pairs and place it in the 'documentData' object. Use camelCase for the keys (e.g., 'studentName', 'annualIncome').
  3. Extract the full, raw text content of the document into 'extractedText'.

  Prioritize accuracy.

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

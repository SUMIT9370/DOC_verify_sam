'use server';

/**
 * @fileOverview AI-powered document verification flow.
 *
 * - verifyDocument - A function that verifies the authenticity of a document image.
 * - VerifyDocumentInput - The input type for the verifyDocument function.
 * - VerifyDocumentOutput - The return type for the verifyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { extractDocumentData } from './extract-document-data';
import { findMasterDocument } from '../tools/find-master-document';

const VerifyDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentInputSchema>;

const VerifyDocumentOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether or not the document is authentic based on database comparison and visual checks.'),
  verificationDetails: z.string().describe('Detailed information about the verification process, including the result of the database lookup and visual analysis.'),
  extractedText: z.string().optional().describe('The extracted text from the image, if available.'),
  qrVerificationResult: z.boolean().optional().describe('The QR verification result, if available.'),
  textAlignmentCheck: z.boolean().optional().describe('The text alignment verification result, if available.'),
  watermarkDetected: z.boolean().optional().describe('Whether a watermark was detected, if available.'),
  hallmarkDetected: z.boolean().optional().describe('Whether a hallmark was detected, if available.'),
});
export type VerifyDocumentOutput = z.infer<typeof VerifyDocumentOutputSchema>;

export async function verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentOutput> {
  return verifyDocumentFlow(input);
}

const verifyDocumentPrompt = ai.definePrompt({
  name: 'verifyDocumentPrompt',
  input: {schema: VerifyDocumentInputSchema},
  output: {schema: VerifyDocumentOutputSchema},
  tools: [extractDocumentData, findMasterDocument],
  prompt: `You are an AI expert in document verification for DocVerify. Your primary goal is to determine if a user-uploaded document is authentic by comparing it against official master documents stored in a database.

Follow these steps:
1.  **Extract Data**: First, use the 'extractDocumentData' tool on the provided document image to get structured data (student name, university, degree, issue date).
2.  **Find Master Document**: Next, use the 'findMasterDocument' tool with the extracted data to search for a matching official document in the database.
3.  **Analyze and Compare**:
    *   **If a master document is found**: The document is likely authentic. State that a matching record was found in the database and mention any minor discrepancies in the visual analysis (text alignment, watermarks, hallmarks).
    *   **If NO master document is found**: The document is likely FAKE. State clearly that NO matching record was found in the official database. This is the most important factor.
    *   **Visual Checks**: Also perform a visual analysis of the document for text alignment, watermarks, and hallmarks, and report your findings. The database result is the primary determinant of authenticity.

Your final response must be a JSON object with 'isAuthentic' and 'verificationDetails'. The 'isAuthentic' field should be 'true' ONLY if a matching master document is found.

Image: {{media url=documentDataUri}}
`,
});

const verifyDocumentFlow = ai.defineFlow(
  {
    name: 'verifyDocumentFlow',
    inputSchema: VerifyDocumentInputSchema,
    outputSchema: VerifyDocumentOutputSchema,
  },
  async input => {
    const {output} = await verifyDocumentPrompt(input);
    return output!;
  }
);

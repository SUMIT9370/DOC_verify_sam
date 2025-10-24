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

const VerifyDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentInputSchema>;

const VerifyDocumentOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether or not the document is authentic.'),
  verificationDetails: z.string().describe('Detailed information about the verification process.'),
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
  prompt: `You are an AI expert in document verification. Analyze the document image and determine if it is authentic.

  Consider the following factors:
  - Text extracted from the image using OCR.
  - Comparison with a database of known valid documents.
  - Text alignment.
  - Presence and validity of watermarks and hall-marks.

  Respond with a determination of authenticity, along with detailed verification information.

  Image: {{media url=documentDataUri}}
  Given your analysis, determine if the document is authentic. Return a structured JSON object that indicates whether the document is authentic, provides details of the verification process, and, if possible, the extracted text. Always return verificationDetails.
  Remember to analyze watermarks, hallmarks, and text alignment.
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

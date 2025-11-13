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
  extractedText: z.string().optional().describe('The full text extracted from the document using OCR.'),
  masterDocumentDataUri: z.string().optional().describe('The data URI of the matching master document image, if one was found.'),
});
export type VerifyDocumentOutput = z.infer<typeof VerifyDocumentOutputSchema>;

export async function verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentOutput> {
  return verifyDocumentFlow(input);
}

const verifyDocumentPrompt = ai.definePrompt({
  name: 'verifyDocumentPrompt',
  input: {schema: z.object({ 
    documentDataUri: z.string(),
    extractedText: z.string().optional(),
   })},
  output: {schema: VerifyDocumentOutputSchema},
  tools: [findMasterDocument],
  prompt: `You are an AI expert in document verification for DocVerify. Your primary goal is to determine if a user-uploaded document is authentic by comparing it against official master documents stored in a database.

Follow these steps:
1.  **Analyze Extracted Data**: You have been provided with the full OCR text extracted from the user's document.
2.  **Find Master Document**: Use the 'findMasterDocument' tool with key details from the extracted text (like student name, university, degree, etc.) to search for a matching official document in the database.
3.  **Analyze and Compare**:
    *   **If a master document is found**: The document is likely authentic. State that a matching record was found in the database. Your 'verificationDetails' should summarize the successful match. Set 'isAuthentic' to true. The 'masterDocumentDataUri' will be returned by the tool automatically.
    *   **If NO master document is found**: The document is likely FAKE. State clearly that NO matching record was found in the official database. This is the most important factor. Set 'isAuthentic' to false.
    *   **Visual Checks**: Also perform a brief visual analysis of the document for text alignment, watermarks, and hallmarks, and mention your findings in the 'verificationDetails'. The database result is the primary determinant of authenticity.

Your final response must be a JSON object conforming to the output schema. The 'isAuthentic' field should be 'true' ONLY if a matching master document is found. Also include the provided 'extractedText' in the final output.

Image: {{media url=documentDataUri}}
Extracted Text:
\`\`\`
{{{extractedText}}}
\`\`\`
`,
});

const verifyDocumentFlow = ai.defineFlow(
  {
    name: 'verifyDocumentFlow',
    inputSchema: VerifyDocumentInputSchema,
    outputSchema: VerifyDocumentOutputSchema,
  },
  async input => {
    // Manually call the extraction flow first
    const extractionResult = await extractDocumentData({ documentDataUri: input.documentDataUri });
    
    // Now call the verification prompt, passing the full extracted text to it.
    const {output} = await verifyDocumentPrompt({
      documentDataUri: input.documentDataUri,
      extractedText: extractionResult.extractedText
    });

    // Manually stitch the extracted text into the final result as the LLM sometimes forgets
    if (output) {
      output.extractedText = extractionResult.extractedText;
    }

    return output!;
  }
);

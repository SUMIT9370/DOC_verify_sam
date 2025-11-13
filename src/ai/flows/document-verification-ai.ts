'use server';

/**
 * @fileOverview AI-powered document verification flow that executes a Python script.
 *
 * - verifyDocument - A function that verifies the authenticity of a document image by running a local Python ML model.
 * - VerifyDocumentInput - The input type for the verifyDocument function.
 * - VerifyDocumentOutput - The return type for the verifyDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { run } from 'genkit/tools';

const VerifyDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentInputSchema>;

const VerifyDocumentOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether or not the document is authentic based on the ML model analysis.'),
  verificationDetails: z.string().describe('Detailed information and summary from the 7-stage verification process.'),
  extractedText: z.string().optional().describe('The full text extracted from the document using OCR.'),
  masterDocumentDataUri: z.string().optional().describe('The data URI of the matching master document image, if one was found.'),
});
export type VerifyDocumentOutput = z.infer<typeof VerifyDocumentOutputSchema>;

export async function verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentOutput> {
  return verifyDocumentFlow(input);
}

const pythonExecutor = ai.defineTool(
    {
        name: 'pythonExecutor',
        description: 'Runs a local python script to analyze a document image and returns the JSON output.',
        inputSchema: z.object({
            image_path: z.string().describe("The temporary path to the document image to be analyzed."),
        }),
        outputSchema: z.any(),
    },
    async (input) => {
        // This tool will execute the python script from the 'ml_model' directory
        // The 'run' command is a placeholder for the actual execution logic which happens
        // in the Genkit environment based on the tool definition.
        // The real implementation would involve child_process or a similar mechanism.
        const { stdout } = await run("python", ["app.py", input.image_path]);
        return JSON.parse(stdout);
    }
)


const verifyDocumentFlow = ai.defineFlow(
  {
    name: 'verifyDocumentFlow',
    inputSchema: VerifyDocumentInputSchema,
    outputSchema: VerifyDocumentOutputSchema,
  },
  async (input) => {
    // In a real scenario, we'd save the data URI to a temporary file
    // and pass the file path to the python script.
    // For this prototype, we'll simulate this by passing a placeholder path.
    const tempImagePath = "/tmp/uploaded_document.png"; // Placeholder

    const analysisResult = await pythonExecutor({ image_path: tempImagePath });

    // Process the JSON output from the python script
    const finalVerdict = analysisResult.final_verdict;
    const isAuthentic = finalVerdict.verdict === "GENUINE" || finalVerdict.verdict === "LIKELY GENUINE";
    
    // Create a summary for the UI
    const detailsSummary = `
      Overall Score: ${finalVerdict.overall_score.toFixed(2)}/100
      Verdict: ${finalVerdict.verdict} (Confidence: ${finalVerdict.confidence})
      ---
      Stage Scores:
      - ELA: ${finalVerdict.stage_scores.ela.toFixed(2)}
      - OCR: ${finalVerdict.stage_scores.ocr.toFixed(2)}
      - QR: ${finalVerdict.stage_scores.qr.toFixed(2)}
      - Watermark: ${finalVerdict.stage_scores.watermark.toFixed(2)}
      - Layout: ${finalVerdict.stage_scores.layout.toFixed(2)}
      - ML Model: ${finalVerdict.stage_scores.ml.toFixed(2)}
    `;

    return {
      isAuthentic: isAuthentic,
      verificationDetails: detailsSummary.trim(),
      extractedText: analysisResult.stage_results.ocr?.text || "No text extracted.",
      // masterDocumentDataUri is not provided by this model, so it's omitted.
    };
  }
);

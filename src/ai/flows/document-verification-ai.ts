'use server';

/**
 * @fileOverview AI-powered document verification flow that executes a Python script.
 *
 * - verifyDocument - A function that verifies the authenticity of a document image by running a local Python ML model.
 * - VerifyDocumentInput - The input type for the verifyDocument function.
 * - VerifyDocumentOutput - The return type for the verifyDocument function.
 */

import { ai } from '@/ai/genkit';
import { z, run } from 'genkit';
import { findMasterDocument } from '../tools/find-master-document';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

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
        // This tool executes the python script from the 'ml_model' directory.
        // It assumes 'app.py' is the entry point and it will print JSON to stdout.
        const modelPath = path.join(process.cwd(), 'ml_model', 'fake-Document-Detection');
        const { stdout, stderr } = await run("streamlit", ["run", "app.py"], {
            cwd: modelPath,
        });

        if (stderr) {
            console.error("Python script stderr:", stderr);
            // Don't throw for warnings, but log them. Some libraries print to stderr.
        }
        
        try {
            // Find the start of the JSON output
            const jsonStartIndex = stdout.indexOf('{');
            if (jsonStartIndex === -1) {
                console.error("No JSON output found in stdout:", stdout);
                throw new Error('No JSON output found from Python script.');
            }
            const jsonString = stdout.substring(jsonStartIndex);
            return JSON.parse(jsonString);
        } catch (e: any) {
            console.error("Failed to parse python script output:", stdout);
            throw new Error("Could not parse the output from the document analysis script.");
        }
    }
);


const verifyDocumentFlow = ai.defineFlow(
  {
    name: 'verifyDocumentFlow',
    inputSchema: VerifyDocumentInputSchema,
    outputSchema: VerifyDocumentOutputSchema,
    tools: [findMasterDocument, pythonExecutor],
  },
  async (input) => {
    // 1. Save the data URI to a temporary file
    const buffer = Buffer.from(input.documentDataUri.split(',')[1], 'base64');
    const tempDir = path.join(process.cwd(), 'ml_model', 'fake-Document-Detection');
    // Ensure the directory exists
    await fs.mkdir(tempDir, { recursive: true });
    const tempImagePath = path.join(tempDir, `upload_${Date.now()}.png`);
    await fs.writeFile(tempImagePath, buffer);
    
    let analysisResult;
    try {
        analysisResult = await pythonExecutor({ image_path: tempImagePath });

        if (analysisResult.error) {
            throw new Error(`Analysis script returned an error: ${analysisResult.error}`)
        }
    } finally {
        // 3. Clean up the temporary file
        await fs.unlink(tempImagePath);
    }
    
    // 4. Process the JSON output from the python script
    const finalVerdict = analysisResult.final_verdict;
    const isAuthentic = finalVerdict.verdict === "GENUINE" || finalVerdict.verdict === "LIKELY GENUINE";
    
    // 5. Create a summary for the UI
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

    // 6. Try to find a master document using extracted data
    const ocrText = analysisResult.stage_results.ocr?.text || "";
    const nameMatch = ocrText.match(/This certifies that ([\w\s-]+) has completed/);
    const studentName = nameMatch ? nameMatch[1].trim() : undefined;

    const masterDocResult = await findMasterDocument({
      studentName: studentName,
    });

    return {
      isAuthentic: isAuthentic,
      verificationDetails: detailsSummary.trim(),
      extractedText: ocrText || "No text extracted.",
      masterDocumentDataUri: masterDocResult.found ? masterDocResult.data.documentDataUri : undefined,
    };
  }
);

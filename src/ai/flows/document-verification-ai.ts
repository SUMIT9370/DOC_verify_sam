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
        const { stdout, stderr } = await run("python", ["app.py"], {
            cwd: modelPath,
            // We pass the image path as an argument to the python script
            // Note: This requires the python script to be able to handle arguments.
            // A better implementation would be a proper API, but this works for local execution.
            // For this implementation, we will rely on the script picking up the file from a known location.
            // We will write the file to the `ml_model/fake-Document-Detection` directory.
        });

        if (stderr) {
            console.error("Python script stderr:", stderr);
            throw new Error(`Python script execution failed: ${stderr}`);
        }
        
        try {
            // Find the start of the JSON output
            const jsonStartIndex = stdout.indexOf('{');
            if (jsonStartIndex === -1) {
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
    tools: [findMasterDocument],
  },
  async (input) => {
    // 1. Save the data URI to a temporary file
    const buffer = Buffer.from(input.documentDataUri.split(',')[1], 'base64');
    const tempDir = path.join(process.cwd(), 'ml_model', 'fake-Document-Detection');
    const tempImagePath = path.join(tempDir, `upload_${Date.now()}.png`);
    await fs.writeFile(tempImagePath, buffer);
    
    let analysisResult;
    try {
        // 2. Run the python script on the saved file
        // The python script `app.py` needs to be modified to accept the image path as an argument
        // For now, we assume it can find the image `upload.png` in its directory.
        // We will pass a dummy path for the tool schema, but the script will use the saved file.
        
        // This tool call is a bit of a hack. The python script is hardcoded to look for a file
        // which isn't ideal. We are writing the file and then running the script.
        analysisResult = await pythonExecutor({ image_path: tempImagePath });
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
    const studentName = nameMatch ? nameMatch[1] : undefined;

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

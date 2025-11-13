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
import { findMasterDocument } from '../tools/find-master-document';
import { pythonExecutor } from '../tools/python-executor';
import * as fs from 'fs/promises';
import * as path from 'path';

const VerifyDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
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
    const tempDir = path.join(process.cwd(), 'tmp'); // Use a dedicated tmp directory
    await fs.mkdir(tempDir, { recursive: true });
    const tempImagePath = path.join(tempDir, `upload_${Date.now()}.png`);
    await fs.writeFile(tempImagePath, buffer);
    
    let analysisResult;
    try {
        // 2. Execute the python script using the dedicated tool
        analysisResult = await pythonExecutor({ imagePath: tempImagePath });

    } finally {
        // 3. Clean up the temporary file
        await fs.unlink(tempImagePath);
    }
    
    // 4. Process the JSON output from the python script
    const finalVerdict = analysisResult.final_verdict;
    const stageResults = analysisResult.stage_results;
    const isAuthentic = finalVerdict.verdict === "GENUINE" || finalVerdict.verdict === "LIKELY GENUINE";
    const ocrText = stageResults.ocr?.text || "";

    // 5. Check if it's a governmental document based on keywords
    const isGovernmental = /government|govt|india|certificate|official/i.test(ocrText);
    let govCheckDetails = '';
    if (isGovernmental) {
      // Per instructions, skip the dataset check for now. This is the placeholder.
      console.log("Governmental document detected. Skipping dataset check as per instructions.");
      govCheckDetails = "\nGovernmental Document: Dataset verification step skipped.";
    }

    // 6. Check for QR code info
    let qrDetails = '';
    if (stageResults.qr?.detected && stageResults.qr.codes.length > 0) {
      qrDetails = '\n--- \nQR Code Information:\n' + stageResults.qr.codes.map((code: any) => `- Type: ${code.type}, Data: ${code.data}`).join('\n');
    }

    // 7. Create a summary for the UI
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
${govCheckDetails}${qrDetails}
    `;

    // 8. Try to find a master document using extracted data
    const nameMatch = ocrText.match(/(?:This certifies that|is awarded to|Name:)\s*([\w\s-]+)/i);
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

'use server';

/**
 * @fileOverview AI-powered document verification flow that uses Gemini's multi-modal capabilities.
 *
 * - verifyDocument - A function that verifies the authenticity of a document image using a multi-stage analysis within a Genkit flow.
 * - VerifyDocumentInput - The input type for the verifyDocument function.
 * - VerifyDocumentOutput - The return type for the verifyDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findMasterDocument } from '../tools/find-master-document';

const VerifyDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentInputSchema>;

// Define a detailed output schema for the multi-stage analysis
const AnalysisResultSchema = z.object({
  elaScore: z.number().min(0).max(100).describe("Error Level Analysis score (0-100). A low score suggests uniformity and authenticity. High scores indicate inconsistencies or tampering."),
  ocrConfidence: z.number().min(0).max(100).describe("OCR text extraction confidence score (0-100)."),
  qrDetected: z.boolean().describe("Whether a QR code was detected in the document."),
  qrData: z.string().optional().describe("The data encoded in the QR code, if detected."),
  watermarkScore: z.number().min(0).max(100).describe("Watermark authenticity score (0-100), based on template matching or edge detection."),
  layoutScore: z.number().min(0).max(100).describe("Layout and structure consistency score (0-100)."),
  mlClassification: z.enum(["GENUINE", "FAKE"]).describe("The model's final classification of the document."),
  mlConfidence: z.number().min(0).max(100).describe("The confidence of the ML classification (0-100)."),
  extractedText: z.string().describe("The full text extracted from the document via OCR."),
});

const VerifyDocumentOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether or not the document is authentic based on the analysis.'),
  verificationDetails: z.string().describe('A formatted summary of the multi-stage verification process.'),
  extractedText: z.string().optional().describe('The full text extracted from the document using OCR.'),
  masterDocumentDataUri: z.string().optional().describe('The data URI of the matching master document image, if one was found.'),
});
export type VerifyDocumentOutput = z.infer<typeof VerifyDocumentOutputSchema>;


export async function verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentOutput> {
  return verifyDocumentFlow(input);
}

const verificationPrompt = ai.definePrompt({
    name: 'multiStageDocumentAnalysisPrompt',
    input: { schema: VerifyDocumentInputSchema },
    output: { schema: AnalysisResultSchema },
    prompt: `You are an expert in document forgery detection. Perform a comprehensive 7-stage analysis on the provided document image. Return your findings as a structured JSON object.

    Image: {{media url=documentDataUri}}

    Follow these 7 stages precisely:

    1.  **Error Level Analysis (ELA):** Analyze the image for compression inconsistencies. JPEG artifacts should be uniform in an authentic image. Tampered areas will have different error levels. Provide an 'elaScore' from 0 (very authentic) to 100 (very suspicious).
    2.  **OCR Text Extraction:** Extract all text from the document. Provide the full 'extractedText' and an overall 'ocrConfidence' score from 0-100.
    3.  **QR Code Detection:** Check for QR codes or barcodes. Set 'qrDetected' to true if found, and populate 'qrData' with its content.
    4.  **Watermark Verification:** Look for watermarks. Assess their authenticity based on clarity, consistency, and expected placement. Provide a 'watermarkScore' from 0 (no/bad watermark) to 100 (authentic watermark).
    5.  **Layout Analysis:** Analyze the document's structure. Check for consistent alignment, spacing, and font usage. Inconsistencies suggest forgery. Provide a 'layoutScore' from 0 (inconsistent) to 100 (very consistent).
    6.  **ML Model Classification:** Based on all the evidence from the previous stages, make a final classification. Set 'mlClassification' to "GENUINE" or "FAKE".
    7.  **Final Validation:** Provide your 'mlConfidence' for the classification, from 0-100.`,
});


const verifyDocumentFlow = ai.defineFlow(
  {
    name: 'verifyDocumentFlow',
    inputSchema: VerifyDocumentInputSchema,
    outputSchema: VerifyDocumentOutputSchema,
    tools: [findMasterDocument],
  },
  async (input) => {
    // 1. Execute the multi-stage analysis using the Gemini model
    const analysisResult = await verificationPrompt(input);
    const { output } = analysisResult;

    if (!output) {
      throw new Error("Document analysis failed to produce an output.");
    }
    
    // 2. Determine authenticity and create a detailed summary
    const isAuthentic = output.mlClassification === "GENUINE" && output.mlConfidence > 50;

    // As per instructions, check for governmental docs and skip dataset check for now.
    const isGovernmental = /government|govt|india|certificate|official/i.test(output.extractedText);
    let govCheckDetails = '';
    if (isGovernmental) {
      console.log("Governmental document detected. Skipping dataset check as per instructions.");
      govCheckDetails = "\nGovernmental Document: Dataset verification step skipped.";
    }

    let qrDetails = '';
    if (output.qrDetected && output.qrData) {
      qrDetails = `\n--- \nQR Code Information:\n- Type: QR, Data: ${output.qrData}`;
    }

    // Weighted score calculation, mirroring the Python script's logic
    const weights = { ela: 0.15, ocr: 0.10, qr: 0.10, watermark: 0.20, layout: 0.15, ml: 0.30 };
    const finalScore = 
        (100 - output.elaScore) * weights.ela + // Invert ELA score
        output.ocrConfidence * weights.ocr +
        (output.qrDetected ? 100 : 50) * weights.qr +
        output.watermarkScore * weights.watermark +
        output.layoutScore * weights.layout +
        (output.mlClassification === "GENUINE" ? output.mlConfidence : 100 - output.mlConfidence) * weights.ml;


    const detailsSummary = `
Overall Score: ${finalScore.toFixed(2)}/100
Verdict: ${output.mlClassification} (Confidence: ${output.mlConfidence.toFixed(2)}%)
---
Stage Scores:
- ELA Score: ${output.elaScore.toFixed(2)}
- OCR Confidence: ${output.ocrConfidence.toFixed(2)}%
- QR Detected: ${output.qrDetected ? 'Yes' : 'No'}
- Watermark Score: ${output.watermarkScore.toFixed(2)}
- Layout Score: ${output.layoutScore.toFixed(2)}
- ML Confidence: ${output.mlConfidence.toFixed(2)}%
${govCheckDetails}${qrDetails}
    `.trim();

    // 3. Try to find a master document using extracted data
    const nameMatch = output.extractedText.match(/(?:This certifies that|is awarded to|Name:)\s*([\w\s-]+)/i);
    const studentName = nameMatch ? nameMatch[1].trim() : undefined;

    const masterDocResult = await findMasterDocument({ studentName });

    return {
      isAuthentic: isAuthentic,
      verificationDetails: detailsSummary,
      extractedText: output.extractedText || "No text extracted.",
      masterDocumentDataUri: masterDocResult.found ? masterDocResult.data.documentDataUri : undefined,
    };
  }
);

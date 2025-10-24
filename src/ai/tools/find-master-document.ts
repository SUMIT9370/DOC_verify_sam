'use server';

/**
 * @fileOverview A Genkit tool for finding a master document in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// Define the input schema for the tool using Zod
const MasterDocumentQuerySchema = z.object({
  studentName: z.string().optional().describe("The student's full name to search for."),
  degreeName: z.string().optional().describe("The name of the degree to search for."),
  universityName: z.string().optional().describe("The name of the university to search for."),
});

// Initialize Firebase Admin SDK if not already initialized
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: credential.applicationDefault(),
  });
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export const findMasterDocument = ai.defineTool(
  {
    name: 'findMasterDocument',
    description: 'Searches the Firestore database for a matching master educational document based on extracted fields.',
    inputSchema: MasterDocumentQuerySchema,
    outputSchema: z.object({
        found: z.boolean().describe('Whether a matching document was found.'),
        data: z.any().optional().describe('The data of the found document.'),
    }),
  },
  async (input) => {
    console.log('Searching for master document with input:', input);
    
    const mastersRef = db.collection('document_masters');
    
    // Build the query dynamically based on the input fields provided by the LLM
    let query: FirebaseFirestore.Query = mastersRef;
    if (input.studentName) {
        query = query.where('documentData.studentName', '==', input.studentName);
    }
    if (input.degreeName) {
        query = query.where('documentData.degreeName', '==', input.degreeName);
    }
    if (input.universityName) {
        query = query.where('documentData.universityName', '==', input.universityName);
    }

    try {
      const snapshot = await query.limit(1).get();

      if (snapshot.empty) {
        console.log('No matching master document found.');
        return { found: false };
      }

      const docData = snapshot.docs[0].data();
      // We don't want to return the full image data URI in the tool response
      // as it's very large and not needed by the LLM.
      delete docData.documentDataUri;

      console.log('Found matching master document:', docData);
      return { found: true, data: docData };

    } catch (error) {
      console.error("Error accessing Firestore: ", error);
      // It's important to return a structured response even on error
      return { found: false, data: { error: 'Failed to query the database.' }};
    }
  }
);

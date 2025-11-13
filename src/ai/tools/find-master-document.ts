'use server';

/**
 * @fileOverview A Genkit tool for finding a master document by fetching from a local API endpoint.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the tool using Zod
const MasterDocumentQuerySchema = z.object({
  studentName: z.string().optional().describe("The student's full name to search for."),
  degreeName: z.string().optional().describe("The name of the degree to search for."),
  universityName: z.string().optional().describe("The name of the university to search for."),
});

// This is the URL of our Next.js API route. We assume it's running on the same host.
// In a real production environment, this would be a configured URL.
const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com/api/find-master' // Replace with your actual production URL
    : 'http://localhost:9002/api/find-master';


export const findMasterDocument = ai.defineTool(
  {
    name: 'findMasterDocument',
    description: 'Searches for a matching master educational document by calling an API endpoint with extracted fields. Returns the full master document if found, including its image data URI.',
    inputSchema: MasterDocumentQuerySchema,
    outputSchema: z.object({
        found: z.boolean().describe('Whether a matching document was found.'),
        data: z.any().optional().describe('The data of the found document, including documentDataUri.'),
    }),
  },
  async (input) => {
    console.log('Calling API to find master document with input:', input);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API call failed with status ${response.status}:`, errorText);
        return { found: false, data: { error: `API error: ${errorText}` } };
      }

      const result = await response.json();
      console.log('Received response from API:', result);
      return result;

    } catch (error: any) {
      console.error("Error fetching from find-master API: ", error);
      return { found: false, data: { error: `Failed to query the database via API. ${error.message}` }};
    }
  }
);

'use server';

/**
 * @fileOverview A Genkit tool for executing the local Python ML model script.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { spawn } from 'child_process';
import * as path from 'path';

// Define the input schema for the tool
const PythonExecutorInputSchema = z.object({
  imagePath: z.string().describe('The absolute path to the temporary image file to be analyzed.'),
});

// Define the output schema for the tool (any valid JSON)
const PythonExecutorOutputSchema = z.any().describe('The JSON output from the Python script.');

export const pythonExecutor = ai.defineTool(
  {
    name: 'pythonExecutor',
    description: 'Executes the local document forgery detection Python script and returns its JSON output.',
    inputSchema: PythonExecutorInputSchema,
    outputSchema: PythonExecutorOutputSchema,
  },
  async (input) => {
    const modelPath = path.join(process.cwd(), 'src', 'ml_model', 'fake-Document-Detection');
    const scriptPath = path.join(modelPath, 'app.py');

    // Use a Promise to handle the asynchronous nature of the child process
    return new Promise((resolve, reject) => {
      // Spawn the Python process
      const pythonProcess = spawn('python3', [scriptPath, input.imagePath], {
        cwd: modelPath,
      });

      let stdoutData = '';
      let stderrData = '';

      // Capture standard output
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      // Capture standard error
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      // Handle process exit
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          // If the process exits with an error code, reject the promise
          console.error(`Python script stderr: ${stderrData}`);
          reject(new Error(`Python script exited with code ${code}: ${stderrData}`));
          return;
        }

        try {
          // Try to parse the standard output as JSON
          const result = JSON.parse(stdoutData);
          if (result.error) {
            reject(new Error(`Python script returned an error: ${result.error}`));
          } else {
            resolve(result);
          }
        } catch (e) {
          // If JSON parsing fails, reject the promise
          console.error('Failed to parse Python script output:', stdoutData);
          reject(new Error('Could not parse the JSON output from the Python script.'));
        }
      });

      // Handle errors during process spawning
      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python script: ${err.message}`));
      });
    });
  }
);

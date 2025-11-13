import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-document-uploads.ts';
import '@/ai/flows/document-verification-ai.ts';
import '@/ai/flows/extract-document-data.ts';
import '@/ai/tools/find-master-document.ts';
import '@/ai/tools/python-executor.ts';

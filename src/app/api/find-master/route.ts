
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This is a simplified way to handle service account credentials.
// In a real production environment, you would use environment variables
// or a secret manager instead of committing a file.
let adminApp: App;
try {
  const serviceAccount = require('../../../../../service-account.json');
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    adminApp = getApps()[0];
  }
} catch (e: any) {
  console.error("CRITICAL: Could not load 'service-account.json' or initialize Firebase Admin SDK.", e.message);
  // No admin app, so we can't continue. The POST handler will see this.
}

const db = getFirestore(adminApp!);

export async function POST(req: NextRequest) {
    if (!adminApp) {
        console.error("API Route Error: Firebase Admin SDK is not initialized. Check server logs for credential errors.");
        return NextResponse.json({ found: false, error: "Server configuration error: Unable to connect to the database." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { studentName, degreeName, universityName } = body;

        // Basic validation
        if (!studentName && !degreeName && !universityName) {
            return NextResponse.json({ found: false, error: "At least one search parameter (studentName, degreeName, or universityName) is required." }, { status: 400 });
        }
        
        const mastersRef = db.collection('document_masters');
        let query: FirebaseFirestore.Query = mastersRef;

        // Dynamically build the query based on provided fields
        if (studentName) {
            query = query.where('documentData.studentName', '==', studentName);
        }
        if (degreeName) {
            query = query.where('documentData.degreeName', '==', degreeName);
        }
        if (universityName) {
            query = query.where('documentData.universityName', '==', universityName);
        }

        const snapshot = await query.limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ found: false });
        }

        const docData = snapshot.docs[0].data();
        
        // Return the full document data, including the image URI
        return NextResponse.json({ found: true, data: docData });

    } catch (error: any) {
        console.error("Firestore query error in API route:", error);
        return NextResponse.json({ error: 'Failed to query the database.', details: error.message }, { status: 500 });
    }
}

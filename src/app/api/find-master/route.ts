import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This is a simplified way to handle service account credentials.
// In a real production environment, you would use environment variables
// or a secret manager instead of committing a file.
try {
  const serviceAccount = require('../../../../../service-account.json');
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
} catch (e) {
  console.error("Could not load service account credentials. Make sure 'service-account.json' exists in the root directory.", e);
}


const db = getFirestore();

export async function POST(req: NextRequest) {
    if (!getApps().length) {
        return NextResponse.json({ error: "Firebase Admin SDK not initialized." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { studentName, degreeName, universityName } = body;

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

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  FileText,
  Loader2,
  XCircle,
  AlertTriangle,
  BookMarked,
  Upload,
} from 'lucide-react';
import type { VerifyDocumentOutput } from '@/ai/flows/document-verification-ai';
import { verifyDocument } from '@/ai/flows/document-verification-ai';
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { StagedVerificationProgress, type VerificationStage } from './staged-verification-progress';

interface VerificationProgressProps {
  file: File & { preview: string };
  autoStart: boolean;
}

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export function VerificationProgress({ file, autoStart }: VerificationProgressProps) {
  const [currentStage, setCurrentStage] = useState<VerificationStage>('pending');
  const [result, setResult] = useState<VerifyDocumentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(autoStart);
  
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!autoStart || !user || !firestore) return;

    const runVerification = async () => {
      if (!user) {
          setError("User is not authenticated.");
          setIsVerifying(false);
          setCurrentStage('failed');
          return;
      }
      
      try {
        setCurrentStage('uploading');
        const dataUri = await fileToDataUri(file);
        
        setCurrentStage('analyzing'); // Switch to a general 'analyzing' state
        const aiResult = await verifyDocument({ documentDataUri: dataUri });
        setResult(aiResult);
        
        setCurrentStage('saving');
        const historyCollection = collection(firestore, 'users', user.uid, 'verification_history');
        await addDoc(historyCollection, {
            documentName: file.name,
            documentUrl: dataUri, // Save the image data directly
            isAuthentic: aiResult.isAuthentic,
            verificationDetails: aiResult.verificationDetails,
            timestamp: serverTimestamp()
        });

        setCurrentStage('complete');

      } catch (e: any) {
        console.error('Verification failed:', e);
        setError(e.message || 'An unexpected error occurred during verification.');
        setCurrentStage('failed');
      } finally {
        setIsVerifying(false);
      }
    };

    runVerification();

  }, [autoStart, file, user, firestore]);

  const getResultBadge = () => {
    if (currentStage === 'failed') {
        return <Badge variant="destructive" className="text-lg py-1 px-4"><AlertTriangle className="mr-2 h-5 w-5"/>Error</Badge>;
    }
    if (isVerifying) {
        return <Badge variant="secondary" className="text-lg py-1 px-4"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Verifying</Badge>;
    }
    if (result?.isAuthentic) {
        return <Badge className="text-lg py-1 px-4 bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2 h-5 w-5"/>Authentic</Badge>;
    } 
    if (result && !result.isAuthentic) {
        return <Badge variant="destructive" className="text-lg py-1 px-4"><XCircle className="mr-2 h-5 w-5"/>Fake Detected</Badge>;
    }
    return <Badge variant="secondary" className="text-lg py-1 px-4"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Initializing</Badge>;
  }

  return (
    <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="truncate font-headline" title={file.name}>{file.name}</CardTitle>
                {getResultBadge()}
            </div>
            {isVerifying && <StagedVerificationProgress currentStage={currentStage} />}
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Master Document */}
                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2"><BookMarked className="h-5 w-5 text-primary" /> Master Document</h3>
                    <div className="aspect-w-4 aspect-h-3 relative rounded-md border p-1 bg-white h-60">
                       {isVerifying && !result?.masterDocumentDataUri && (
                           <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                               <Loader2 className="h-8 w-8 animate-spin mb-2" />
                               <p className="text-sm font-medium">Searching Database...</p>
                           </div>
                       )}
                       {!isVerifying && !result?.masterDocumentDataUri && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                                <XCircle className="h-8 w-8 text-destructive mb-2" />
                                <p className="text-sm font-medium">No Master Found</p>
                                <p className="text-xs">No matching master document was found in the database.</p>
                            </div>
                       )}
                       {result?.masterDocumentDataUri && (
                           <Image
                                src={result.masterDocumentDataUri}
                                alt="Master Document"
                                fill
                                className="object-contain"
                           />
                       )}
                    </div>
                    <CardDescription>Official master document from the database.</CardDescription>
                </div>

                {/* Uploaded Document */}
                <div className="space-y-3">
                     <h3 className="font-semibold flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Uploaded Document</h3>
                     <div className="aspect-w-4 aspect-h-3 relative rounded-md border p-1 bg-white h-60">
                        <Image
                            src={file.preview}
                            alt={file.name}
                            fill
                            className="object-contain"
                            onLoad={() => URL.revokeObjectURL(file.preview)}
                        />
                    </div>
                    <CardDescription>The document image you uploaded for verification.</CardDescription>
                </div>
            </div>

            {/* Verification Details */}
            {(result || error) && !isVerifying && (
                 <div className="pt-6 mt-6 border-t">
                    {result && !error && (
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-5 w-5"/> AI Verification Summary:</h4>
                             <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md space-y-2">
                                <pre className="whitespace-pre-wrap font-mono">{result.verificationDetails}</pre>
                                <h5 className="font-semibold pt-2 border-t">Full Extracted Text:</h5>
                                <pre className="whitespace-pre-wrap font-mono text-xs">{result.extractedText || "No text could be extracted."}</pre>
                             </div>
                        </div>
                    )}
                    {error && (
                        <div>
                            <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Error Details:</h4>
                            <p className="text-sm text-destructive-foreground bg-destructive/20 p-3 rounded-md">{error}</p>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
    </Card>
  );
}

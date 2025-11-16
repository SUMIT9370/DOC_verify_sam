'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StagedVerificationProgress, type VerificationStage } from '../verify/staged-verification-progress';
import { verifyDocument, type VerifyDocumentOutput } from '@/ai/flows/document-verification-ai';
import { FileText, AlertTriangle } from 'lucide-react';

interface ReVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    documentName: string;
    documentUrl: string; // This is a Base64 Data URI
  };
}

export function ReVerificationDialog({ isOpen, onClose, item }: ReVerificationDialogProps) {
  const [currentStage, setCurrentStage] = useState<VerificationStage>('pending');
  const [result, setResult] = useState<VerifyDocumentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog is closed
      setCurrentStage('pending');
      setResult(null);
      setError(null);
      return;
    }

    const runVerification = async () => {
      try {
        setCurrentStage('analyzing');
        
        // The item.documentUrl is already a Data URI
        const aiResult = await verifyDocument({ documentDataUri: item.documentUrl });

        setResult(aiResult);
        setCurrentStage('complete');
      } catch (e: any) {
        console.error('Re-verification failed:', e);
        setError(e.message || 'An unexpected error occurred during re-verification.');
        setCurrentStage('failed');
      }
    };

    runVerification();
  }, [isOpen, item]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Re-Verifying: {item.documentName}</DialogTitle>
          <DialogDescription>A new analysis is being performed on the selected document.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
          <div className="relative border rounded-md bg-white p-2 h-full">
            <Image src={item.documentUrl} alt={item.documentName} layout="fill" objectFit="contain" />
          </div>
          <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
            <StagedVerificationProgress currentStage={currentStage} />

            {(currentStage === 'complete' || currentStage === 'failed') && (
              <div className="pt-4">
                {result && !error && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> New AI Verification Summary:
                    </h4>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md space-y-2">
                      <pre className="whitespace-pre-wrap font-mono">{result.verificationDetails}</pre>
                    </div>
                  </div>
                )}
                {error && (
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Error Details:
                    </h4>
                    <p className="text-sm text-destructive-foreground bg-destructive/20 p-3 rounded-md">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

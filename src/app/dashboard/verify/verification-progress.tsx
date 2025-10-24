'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  FileText,
  ScanQrCode,
  AlignHorizontalDistributeCenter,
  BadgeCheck,
  Stamp,
  Loader2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { VerifyDocumentOutput } from '@/ai/flows/document-verification-ai';
import { verifyDocument } from '@/ai/flows/document-verification-ai';
import { cn } from '@/lib/utils';

interface VerificationProgressProps {
  file: File & { preview: string };
  autoStart: boolean;
}

type VerificationStep = {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  icon: React.ReactNode;
};

const initialSteps: VerificationStep[] = [
  { name: 'Extracting Text (OCR)', status: 'pending', icon: <FileText className="h-5 w-5" /> },
  { name: 'Verifying QR/Barcode', status: 'pending', icon: <ScanQrCode className="h-5 w-5" /> },
  { name: 'Analyzing Text Alignment', status: 'pending', icon: <AlignHorizontalDistributeCenter className="h-5 w-5" /> },
  { name: 'Detecting Watermark', status: 'pending', icon: <BadgeCheck className="h-5 w-5" /> },
  { name: 'Validating Hallmark/Stamp', status: 'pending', icon: <Stamp className="h-5 w-5" /> },
];

export function VerificationProgress({ file, autoStart }: VerificationProgressProps) {
  const [steps, setSteps] = useState<VerificationStep[]>(initialSteps);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VerifyDocumentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(autoStart);

  useEffect(() => {
    if (!autoStart) return;

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const runVerification = async () => {
      try {
        const dataUri = await fileToDataUri(file);
        
        // Simulate step-by-step progress for better UX
        for (let i = 0; i < initialSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
          setSteps(prev => {
            const newSteps = [...prev];
            if(i > 0) newSteps[i-1].status = 'completed';
            newSteps[i].status = 'running';
            return newSteps;
          });
          setProgress((i + 1) * (100 / (initialSteps.length + 1) ));
        }

        const aiResult = await verifyDocument({ documentDataUri: dataUri });
        
        setResult(aiResult);
        setProgress(100);
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));

      } catch (e) {
        console.error('Verification failed:', e);
        setError('An unexpected error occurred during verification.');
        setSteps(prev => prev.map(step => (step.status === 'running' ? { ...step, status: 'failed' } : step)));
      } finally {
        setIsVerifying(false);
      }
    };

    runVerification();

  }, [autoStart, file]);

  const getStepIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getResultBadge = () => {
    if (error) {
        return <Badge variant="destructive" className="text-lg py-1 px-4"><AlertTriangle className="mr-2 h-5 w-5"/>Error</Badge>;
    }
    if (!result) {
        return <Badge variant="secondary" className="text-lg py-1 px-4"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Verifying</Badge>;
    }
    if (result.isAuthentic) {
        return <Badge className="text-lg py-1 px-4 bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2 h-5 w-5"/>Authentic</Badge>;
    } else {
        return <Badge variant="destructive" className="text-lg py-1 px-4"><XCircle className="mr-2 h-5 w-5"/>Fake Detected</Badge>;
    }
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="truncate font-headline" title={file.name}>{file.name}</CardTitle>
            {getResultBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="aspect-w-1 aspect-h-1 relative">
            <Image
              src={file.preview}
              alt={file.name}
              fill
              className="object-contain rounded-md border p-1"
              onLoad={() => URL.revokeObjectURL(file.preview)}
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
            <div>
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground mt-2">{isVerifying ? 'Verification in progress...' : `Verification ${error ? 'failed' : 'complete'}.`}</p>
            </div>
            
            <div className="space-y-3">
                {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 text-sm">
                    {getStepIcon(step.status)}
                    <span className={cn(
                        "font-medium",
                        step.status === 'pending' && 'text-muted-foreground',
                        step.status === 'completed' && 'line-through text-muted-foreground',
                        step.status === 'failed' && 'text-destructive'
                    )}>
                    {step.name}
                    </span>
                </div>
                ))}
            </div>

            {result && !error && (
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Verification Details:</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{result.verificationDetails}</p>
                </div>
            )}
            {error && (
                 <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-destructive">Error Details:</h4>
                    <p className="text-sm text-destructive-foreground bg-destructive/80 p-3 rounded-md">{error}</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

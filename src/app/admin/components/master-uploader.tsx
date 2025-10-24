'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { extractDocumentData, type ExtractDocumentDataOutput } from '@/ai/flows/extract-document-data';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type FileWithPreview = File & {
  preview: string;
};

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function MasterUploader() {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractDocumentDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const acceptedFile = acceptedFiles[0];
      setFile(
        Object.assign(acceptedFile, {
          preview: URL.createObjectURL(acceptedFile),
        })
      );
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    maxSize: 1024 * 1024 * 5, // 5MB
    multiple: false,
  });

  const handleProcessAndSave = async () => {
    if (!file || !firestore) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const dataUri = await fileToDataUri(file);
      const extractedData = await extractDocumentData({ documentDataUri: dataUri });
      setResult(extractedData);

      // Save to Firestore, including the data URI of the image
      const mastersCollection = collection(firestore, 'document_masters');
      const dataToSave = {
        documentType: extractedData.documentType,
        documentData: extractedData.documentData,
        documentDataUri: dataUri 
      };

      addDoc(mastersCollection, dataToSave)
        .then(() => {
          toast({
            title: 'Success!',
            description: 'Document master has been processed and saved.',
            variant: 'default',
          });
          setFile(null);
          setIsProcessing(false);
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: mastersCollection.path,
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
            // We don't need to set local error state here as the global listener will throw
            setIsProcessing(false);
        });

    } catch (e: any) {
      // This will catch errors from the AI flow or file reading
      console.error(e);
      setError('Failed to process the document with AI. Please try again.');
       toast({
          title: 'Processing Error',
          description: 'Failed to process the document with AI. Please try again.',
          variant: 'destructive',
        });
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  }

  if (isProcessing) {
      return (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center h-full">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="font-semibold">Processing Document...</p>
              <p className="text-sm text-muted-foreground">The AI is extracting key information. Please wait.</p>
          </div>
      )
  }

  if (result && !isProcessing) {
    return (
        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center h-full bg-green-50 dark:bg-green-900/20 border-green-500">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
            <p className="font-semibold text-lg">Processing Complete & Saved</p>
            <p className="text-sm text-muted-foreground mb-4">The document master has been added to the database.</p>
            <Button onClick={handleReset} variant="outline">Upload Another</Button>
        </div>
    )
  }
  
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center h-full bg-red-50 dark:bg-red-900/20 border-red-500">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
            <p className="font-semibold text-lg">An Error Occurred</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleReset} variant="destructive">Try Again</Button>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps({
          className: `relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-border'
          }`,
        })}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-muted-foreground" />
        <p className="mt-4 text-center font-semibold">
          {isDragActive
            ? 'Drop the file here...'
            : "Drag 'n' drop a master document, or click to select a file"}
        </p>
        <p className="text-xs text-muted-foreground">Image files up to 5MB</p>
      </div>
      
      {file && (
          <div className="space-y-4">
            <div className="border rounded-lg p-2 flex items-center gap-4 bg-card shadow-sm">
                <FileIcon className="w-8 h-8 text-muted-foreground shrink-0"/>
                <div className='overflow-hidden'>
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
            </div>
             <Button onClick={handleProcessAndSave} disabled={isProcessing} size="lg">
                Process & Save Master
            </Button>
          </div>

      )}
    </div>
  );
}

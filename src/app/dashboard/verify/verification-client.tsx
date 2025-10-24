'use client';

import { useState, useCallback, useId } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VerificationProgress } from './verification-progress';

type FileWithPreview = File & {
  preview: string;
  id: string;
};

export function VerificationClient() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const componentId = useId();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setFiles((previousFiles) => [
        ...previousFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            id: `${componentId}-${file.name}-${Math.random()}`,
          })
        ),
      ]);
    }
  }, [componentId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    maxSize: 1024 * 1024 * 5, // 5MB
  });

  const removeFile = (id: string) => {
    setFiles((previousFiles) => previousFiles.filter((file) => file.id !== id));
  };
  
  const handleStartVerification = () => {
    if (files.length > 0) {
      setIsVerifying(true);
    }
  };
  
  const handleReset = () => {
    setFiles([]);
    setIsVerifying(false);
  };

  return (
    <div className="space-y-6">
      {!isVerifying && (
        <div
          {...getRootProps({
            className: `relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border'
            }`,
          })}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">
            {isDragActive
              ? 'Drop the files here...'
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports bulk image uploads (PNG, JPG, etc.) up to 5MB each.
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline">Uploaded Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group border rounded-lg p-2 flex flex-col items-center gap-2 bg-card shadow-sm">
                 <FileIcon className="w-10 h-10 text-muted-foreground"/>
                 <p className="text-sm font-medium text-center truncate w-full" title={file.name}>{file.name}</p>
                 <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                 {!isVerifying && (
                    <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                    }}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                 )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 pt-4">
            <Button onClick={handleStartVerification} disabled={isVerifying || files.length === 0} size="lg">
              {isVerifying ? 'Verifying...' : 'Start Verification'}
            </Button>
            {isVerifying && (
                 <Button onClick={handleReset} variant="outline" size="lg">
                    Verify More Documents
                 </Button>
            )}
          </div>
        </div>
      )}

      {isVerifying && (
        <div className="space-y-6">
          {files.map((file, index) => (
            <VerificationProgress key={file.id} file={file} autoStart={true} />
          ))}
        </div>
      )}
    </div>
  );
}

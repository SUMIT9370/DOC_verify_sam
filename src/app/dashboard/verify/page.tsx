import { VerificationClient } from './verification-client';

export default function VerificationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Document Verification</h1>
        <p className="text-muted-foreground">
          Upload documents in bulk to begin the AI-powered verification process.
        </p>
      </div>
      <VerificationClient />
    </div>
  );
}

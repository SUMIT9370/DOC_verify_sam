'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { documentTypes, type DocumentTypeConfig } from './document-types';
import { cn } from '@/lib/utils';

// Base schema for the initial document type selection
const baseSchema = z.object({
  documentType: z.string().min(1, { message: 'Please select a document type.' }),
});

// Specific Zod schemas for each document type
const domicileSchema = baseSchema.extend({
    fullName: z.string().min(1, "Full Name is required."),
    fatherName: z.string().min(1, "Father's Name is required."),
    dateOfBirth: z.string().min(1, "Date of Birth is required."),
    placeOfBirth: z.string().min(1, "Place of Birth is required."),
    certificateNumber: z.string().min(1, "Certificate Number is required."),
    dateOfIssue: z.string().min(1, "Date of Issue is required."),
});

const incomeCertificateSchema = baseSchema.extend({
    applicantName: z.string().min(1, "Applicant Name is required."),
    guardianName: z.string().min(1, "Guardian's Name is required."),
    annualIncome: z.coerce.number().positive("Annual Income must be a positive number."),
    certificateNumber: z.string().min(1, "Certificate Number is required."),
    dateOfIssue: z.string().min(1, "Date of Issue is required."),
});

const degreeCertificateSchema = baseSchema.extend({
    studentName: z.string().min(1, "Student Name is required."),
    universityName: z.string().min(1, "University Name is required."),
    degreeName: z.string().min(1, "Degree Name is required."),
    major: z.string().min(1, "Major/Branch is required."),
    rollNumber: z.string().min(1, "Roll/Seat Number is required."),
    dateOfIssue: z.string().min(1, "Date of Issue is required."),
    grade: z.string().min(1, "Grade/Class is required."),
});

const hscMarksheetSchema = baseSchema.extend({
    studentName: z.string().min(1, "Student Name is required."),
    mothersName: z.string().min(1, "Mother's Name is required."),
    seatNumber: z.string().min(1, "Seat Number is required."),
    schoolName: z.string().min(1, "School/College Name is required."),
    boardName: z.string().min(1, "Board Name is required."),
    passingYear: z.coerce.number().int().min(1900).max(new Date().getFullYear(), "Invalid year."),
    marksSubject1: z.coerce.number().min(0).max(100),
    marksSubject2: z.coerce.number().min(0).max(100),
    marksSubject3: z.coerce.number().min(0).max(100),
    marksSubject4: z.coerce.number().min(0).max(100),
    marksSubject5: z.coerce.number().min(0).max(100),
    totalMarks: z.coerce.number().positive(),
    percentage: z.coerce.number().min(0).max(100),
});

const sscMarksheetSchema = baseSchema.extend({
    studentName: z.string().min(1, "Student Name is required."),
    mothersName: z.string().min(1, "Mother's Name is required."),
    seatNumber: z.string().min(1, "Seat Number is required."),
    schoolName: z.string().min(1, "School Name is required."),
    boardName: z.string().min(1, "Board Name is required."),
    passingYear: z.coerce.number().int().min(1900).max(new Date().getFullYear(), "Invalid year."),
    marksMath: z.coerce.number().min(0).max(100),
    marksScience: z.coerce.number().min(0).max(100),
    marksEnglish: z.coerce.number().min(0).max(100),
    totalMarks: z.coerce.number().positive(),
    percentage: z.coerce.number().min(0).max(100),
});

const leavingCertificateSchema = baseSchema.extend({
    studentName: z.string().min(1, "Student Name is required."),
    dateOfBirth: z.string().min(1, "Date of Birth is required."),
    lastAttended: z.string().min(1, "Last Class Attended is required."),
    dateOfLeaving: z.string().min(1, "Date of Leaving is required."),
    schoolName: z.string().min(1, "School/College Name is required."),
});

const feeReceiptSchema = baseSchema.extend({
    studentName: z.string().min(1, "Student Name is required."),
    receiptNumber: z.string().min(1, "Receipt Number is required."),
    amountPaid: z.coerce.number().positive(),
    paymentDate: z.string().min(1, "Date of Payment is required."),
    academicYear: z.string().min(1, "Academic Year is required."),
});

// A map to associate document type values with their schemas
const schemaMap: Record<string, z.ZodObject<any>> = {
    'domicile': domicileSchema,
    'income_certificate': incomeCertificateSchema,
    'degree_certificate': degreeCertificateSchema,
    'hsc_marksheet': hscMarksheetSchema,
    'ssc_marksheet': sscMarksheetSchema,
    'leaving_certificate': leavingCertificateSchema,
    'fee_receipt': feeReceiptSchema,
};


export function IssueDocumentForm() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeConfig | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
        documentType: '',
    },
  });
  
  const { isSubmitting } = form.formState;
  const watchedDocType = useWatch({ control: form.control, name: 'documentType' });

  // Update form fields and validation when a document type is selected
  useEffect(() => {
    const newDocType = documentTypes.find(doc => doc.value === watchedDocType) || null;
    setSelectedDocType(newDocType);

    // Reset form values for the dynamic fields
    const newDefaultValues: { [key: string]: any } = { documentType: watchedDocType };
    if (newDocType) {
        newDocType.fields.forEach(field => {
            newDefaultValues[field.name] = '';
        });
    }
    form.reset(newDefaultValues);
    
    // Update the resolver
    form.trigger(); // This helps in re-validating the form
    // @ts-ignore
    form.resolver = zodResolver(newDocType ? schemaMap[newDocType.value] : baseSchema);

  }, [watchedDocType, form]);


  async function onSubmit(values: z.infer<z.ZodObject<any>>) {
    if (!firestore) {
      toast({
        title: 'Error',
        description: 'Database not available. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedDocType) {
        toast({
            title: 'Error',
            description: 'Invalid document type selected.',
            variant: 'destructive',
          });
          return;
    }

    // Prepare data for Firestore by separating the document type from the rest of the data
    const { documentType, ...documentData } = values;
    const dataToSave = {
      documentType: selectedDocType.label, // Use the user-friendly label
      documentData: documentData,
    };

    const mastersCollection = collection(firestore, 'document_masters');
    addDoc(mastersCollection, dataToSave)
      .then(() => {
        toast({
          title: 'Success!',
          description: 'New document master has been issued and saved.',
        });
        // Reset the form completely, including the documentType selector
        form.reset({ documentType: '' });
        setSelectedDocType(null);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: mastersCollection.path,
          operation: 'create',
          requestResourceData: dataToSave,
        });

        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a document type to issue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypes.map(docType => (
                    <SelectItem key={docType.value} value={docType.value}>
                      {docType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className={cn("space-y-4 transition-opacity duration-300", selectedDocType ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none overflow-hidden')}>
            {selectedDocType?.fields.map(fieldConfig => (
                <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{fieldConfig.label}</FormLabel>
                            <FormControl>
                                <Input
                                    type={fieldConfig.type}
                                    placeholder={fieldConfig.placeholder}
                                    {...field}
                                />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
        </div>

        <Button type="submit" disabled={isSubmitting || !selectedDocType} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Issue Document Master
        </Button>
      </form>
    </Form>
  );
}

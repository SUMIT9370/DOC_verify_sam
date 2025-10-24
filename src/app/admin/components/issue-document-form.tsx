'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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

// Create a a Zod object from the config
const generateSchema = (docType: DocumentTypeConfig) => {
    const fieldsSchema = docType.fields.reduce((schema, field) => {
        let fieldValidation;
        switch (field.type) {
          case 'number':
            fieldValidation = z.coerce.number().min(1, `${field.label} is required.`);
            break;
          default:
            fieldValidation = z.string().min(1, `${field.label} is required.`);
            break;
        }
        return schema.extend({ [field.name]: fieldValidation });
      }, z.object({}));

      return baseSchema.merge(fieldsSchema);
}


export function IssueDocumentForm() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeConfig | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(selectedDocType ? generateSchema(selectedDocType) : baseSchema),
    defaultValues: {
        documentType: '',
    }
  });

  const { isSubmitting } = form.formState;
  const watchedDocType = useWatch({ control: form.control, name: 'documentType' });

  // Effect to update the form fields when a new document type is selected
  useEffect(() => {
    const newDocType = documentTypes.find(doc => doc.value === watchedDocType);
    setSelectedDocType(newDocType || null);
    // Keep the documentType value but clear out the old dynamic fields
    const currentValues = form.getValues();
    const newDefaults = { documentType: currentValues.documentType };
    form.reset(newDefaults);

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
        form.reset({ documentType: selectedDocType.value });
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
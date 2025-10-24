'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  studentName: z.string().min(1, { message: 'Student name is required.' }),
  universityName: z.string().min(1, { message: 'University name is required.' }),
  degreeName: z.string().min(1, { message: 'Degree name is required.' }),
  dateOfIssue: z.string().min(1, { message: 'Date of issue is required.' }),
});

export function IssueDocumentForm() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      universityName: '',
      degreeName: '',
      dateOfIssue: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            title: 'Error',
            description: 'Database not available. Please try again later.',
            variant: 'destructive',
        });
        return;
    }

    const mastersCollection = collection(firestore, 'document_masters');
    addDoc(mastersCollection, values)
      .then(() => {
        toast({
          title: 'Success!',
          description: 'New document master has been issued and saved.',
        });
        form.reset();
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: mastersCollection.path,
          operation: 'create',
          requestResourceData: values,
        });

        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Anjali Sharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="universityName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University / Institution Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., University of Delhi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="degreeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree / Certificate Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bachelor of Technology in Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfIssue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Issue</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Issue Document Master
        </Button>
      </form>
    </Form>
  );
}

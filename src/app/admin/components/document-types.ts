// Defines the structure for a single form field
type FormFieldConfig = {
  name: string; // The key for the data object
  label: string; // The user-facing label
  placeholder: string; // The placeholder text for the input
  type: 'text' | 'date' | 'number'; // The input type
};

// Defines the structure for a document type, including its fields
export type DocumentTypeConfig = {
  value: string; // A unique identifier for the document type
  label: string; // The user-facing name in the dropdown
  fields: FormFieldConfig[]; // An array of fields for this document's form
};

// An array of all supported document type configurations
export const documentTypes: DocumentTypeConfig[] = [
  {
    value: 'domicile',
    label: 'Domicile Certificate',
    fields: [
      { name: 'fullName', label: 'Full Name', placeholder: 'e.g., Priya Sharma', type: 'text' },
      { name: 'fatherName', label: 'Father\'s Name', placeholder: 'e.g., Rajesh Sharma', type: 'text' },
      { name: 'dateOfBirth', label: 'Date of Birth', placeholder: '', type: 'date' },
      { name: 'placeOfBirth', label: 'Place of Birth', placeholder: 'e.g., Mumbai, Maharashtra', type: 'text' },
      { name: 'certificateNumber', label: 'Certificate Number', placeholder: 'e.g., DOM/2024/12345', type: 'text' },
      { name: 'dateOfIssue', label: 'Date of Issue', placeholder: '', type: 'date' },
    ],
  },
  {
    value: 'income_certificate',
    label: 'Income Certificate',
    fields: [
      { name: 'applicantName', label: 'Applicant Name', placeholder: 'e.g., Rohan Verma', type: 'text' },
      { name: 'guardianName', label: 'Guardian\'s Name', placeholder: 'e.g., Anil Verma', type: 'text' },
      { name: 'annualIncome', label: 'Annual Income (INR)', placeholder: 'e.g., 500000', type: 'number' },
      { name: 'certificateNumber', label: 'Certificate Number', placeholder: 'e.g., INC/2024/54321', type: 'text' },
      { name: 'dateOfIssue', label: 'Date of Issue', placeholder: '', type: 'date' },
    ],
  },
  {
    value: 'hsc_marksheet',
    label: 'HSC (Class 12) Marklist',
    fields: [
      { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Anjali Singh', type: 'text' },
      { name: 'seatNumber', label: 'Seat Number', placeholder: 'e.g., M123456', type: 'text' },
      { name: 'schoolName', label: 'School/College Name', placeholder: 'e.g., Delhi Public School, R.K. Puram', type: 'text' },
      { name: 'boardName', label: 'Board Name', placeholder: 'e.g., CBSE', type: 'text' },
      { name: 'passingYear', label: 'Passing Year', placeholder: 'e.g., 2023', type: 'number' },
    ],
  },
  {
    value: 'ssc_marksheet',
    label: 'SSC (Class 10) Marklist',
    fields: [
        { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Sameer Khan', type: 'text' },
        { name: 'seatNumber', label: 'Seat Number', placeholder: 'e.g., P654321', type: 'text' },
        { name: 'schoolName', label: 'School Name', placeholder: 'e.g., St. Xavier\'s High School, Fort', type: 'text' },
        { name: 'boardName', label: 'Board Name', placeholder: 'e.g., Maharashtra State Board', type: 'text' },
        { name: 'passingYear', label: 'Passing Year', placeholder: 'e.g., 2021', type: 'number' },
    ],
  },
  {
    value: 'leaving_certificate',
    label: 'Leaving Certificate (LC)',
    fields: [
        { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Aisha Patel', type: 'text' },
        { name: 'dateOfBirth', label: 'Date of Birth', placeholder: '', type: 'date' },
        { name: 'lastAttended', label: 'Last Class Attended', placeholder: 'e.g., Class X', type: 'text' },
        { name: 'dateOfLeaving', label: 'Date of Leaving', placeholder: '', type: 'date' },
        { name: 'schoolName', label: 'School/College Name', placeholder: 'e.g., Modern School, Barakhamba', type: 'text' },
    ],
  },
  // Add other document types based on the user's list
  {
    value: 'fee_receipt',
    label: 'Fee Receipt',
    fields: [
        { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Vikram Rathore', type: 'text' },
        { name: 'receiptNumber', label: 'Receipt Number', placeholder: 'e.g., 2024-25/00123', type: 'text' },
        { name: 'amountPaid', label: 'Amount Paid (INR)', placeholder: 'e.g., 75000', type: 'number' },
        { name: 'paymentDate', label: 'Date of Payment', placeholder: '', type: 'date' },
    ],
  },
];

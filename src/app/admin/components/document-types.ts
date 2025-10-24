'use client';

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
      { name: 'fullName', label: 'Full Name', placeholder: 'e.g., Sumit Sharma', type: 'text' },
      { name: 'fatherName', label: "Father's Name", placeholder: 'e.g., Rajesh Sharma', type: 'text' },
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
      { name: 'applicantName', label: 'Applicant Name', placeholder: 'e.g., Sumit Verma', type: 'text' },
      { name: 'guardianName', label: "Guardian's Name", placeholder: 'e.g., Anil Verma', type: 'text' },
      { name: 'annualIncome', label: 'Annual Income (INR)', placeholder: 'e.g., 500000', type: 'number' },
      { name: 'certificateNumber', label: 'Certificate Number', placeholder: 'e.g., INC/2024/54321', type: 'text' },
      { name: 'dateOfIssue', label: 'Date of Issue', placeholder: '', type: 'date' },
    ],
  },
    {
    value: 'degree_certificate',
    label: 'Degree Certificate',
    fields: [
      { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Sumit Singh', type: 'text' },
      { name: 'universityName', label: 'University Name', placeholder: 'e.g., University of Mumbai', type: 'text' },
      { name: 'degreeName', label: 'Degree Name', placeholder: 'e.g., Bachelor of Engineering', type: 'text' },
      { name: 'major', label: 'Major/Branch', placeholder: 'e.g., Computer Engineering', type: 'text' },
      { name: 'rollNumber', label: 'Roll/Seat Number', placeholder: 'e.g., C19-1024', type: 'text' },
      { name: 'dateOfIssue', label: 'Date of Issue', placeholder: '', type: 'date' },
      { name: 'grade', label: 'Grade/Class', placeholder: 'e.g., First Class with Distinction', type: 'text' },
    ],
  },
  {
    value: 'hsc_marksheet',
    label: 'HSC (Class 12) Marksheet',
    fields: [
      { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Sumit Singh', type: 'text' },
      { name: 'mothersName', label: "Mother's Name", placeholder: 'e.g., Sunita Singh', type: 'text' },
      { name: 'seatNumber', label: 'Seat Number', placeholder: 'e.g., M123456', type: 'text' },
      { name: 'schoolName', label: 'School/College Name', placeholder: 'e.g., Delhi Public School, R.K. Puram', type: 'text' },
      { name: 'boardName', label: 'Board Name', placeholder: 'e.g., CBSE', type: 'text' },
      { name: 'passingYear', label: 'Passing Year', placeholder: 'e.g., 2023', type: 'number' },
      { name: 'marksSubject1', label: 'Subject 1 Marks', placeholder: 'e.g., 95', type: 'number' },
      { name: 'marksSubject2', label: 'Subject 2 Marks', placeholder: 'e.g., 88', type: 'number' },
      { name: 'marksSubject3', label: 'Subject 3 Marks', placeholder: 'e.g., 92', type: 'number' },
      { name: 'marksSubject4', label: 'Subject 4 Marks', placeholder: 'e.g., 85', type: 'number' },
      { name: 'marksSubject5', label: 'Subject 5 Marks', placeholder: 'e.g., 90', type: 'number' },
      { name: 'totalMarks', label: 'Total Marks', placeholder: 'e.g., 450', type: 'number' },
      { name: 'percentage', label: 'Percentage', placeholder: 'e.g., 90.00', type: 'number' },
    ],
  },
  {
    value: 'ssc_marksheet',
    label: 'SSC (Class 10) Marksheet',
    fields: [
        { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Sumit Khan', type: 'text' },
        { name: 'mothersName', label: "Mother's Name", placeholder: 'e.g., Fatima Khan', type: 'text' },
        { name: 'seatNumber', label: 'Seat Number', placeholder: 'e.g., P654321', type: 'text' },
        { name: 'schoolName', label: 'School Name', placeholder: 'e.g., St. Xavier\'s High School, Fort', type: 'text' },
        { name: 'boardName', label: 'Board Name', placeholder: 'e.g., Maharashtra State Board', type: 'text' },
        { name: 'passingYear', label: 'Passing Year', placeholder: 'e.g., 2021', type: 'number' },
        { name: 'marksMath', label: 'Mathematics Marks', placeholder: 'e.g., 98', type: 'number' },
        { name: 'marksScience', label: 'Science Marks', placeholder: 'e.g., 92', type: 'number' },
        { name: 'marksEnglish', label: 'English Marks', placeholder: 'e.g., 89', type: 'number' },
        { name: 'totalMarks', label: 'Total Marks', placeholder: 'e.g., 480', type: 'number' },
        { name: 'percentage', label: 'Percentage', placeholder: 'e.g., 96.00', type: 'number' },
    ],
  },
  {
    value: 'leaving_certificate',
    label: 'Leaving Certificate (LC)',
    fields: [
        { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Sumit Patel', type: 'text' },
        { name: 'dateOfBirth', label: 'Date of Birth', placeholder: '', type: 'date' },
        { name: 'lastAttended', label: 'Last Class Attended', placeholder: 'e.g., Class X', type: 'text' },
        { name: 'dateOfLeaving', label: 'Date of Leaving', placeholder: '', type: 'date' },
        { name: 'schoolName', label: 'School/College Name', placeholder: 'e.g., Modern School, Barakhamba', type: 'text' },
    ],
  },
  {
    value: 'fee_receipt',
    label: 'Fee Receipt',
    fields: [
        { name: 'studentName', label: 'Student Name', placeholder: 'e.g., Sumit Rathore', type: 'text' },
        { name: 'receiptNumber', label: 'Receipt Number', placeholder: 'e.g., 2024-25/00123', type: 'text' },
        { name: 'amountPaid', label: 'Amount Paid (INR)', placeholder: 'e.g., 75000', type: 'number' },
        { name: 'paymentDate', label: 'Date of Payment', placeholder: '', type: 'date' },
        { name: 'academicYear', label: 'Academic Year', placeholder: 'e.g., 2024-25', type: 'text' },
    ],
  },
];

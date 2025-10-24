# DocVerify - Digital Document Verification Platform

DocVerify is a secure and reliable platform built with Next.js and Firebase for digital document verification. It leverages AI to analyze and authenticate documents, helping to combat fraud in education and employment sectors.

## Key Features

*   **AI-Powered Verification**: Upload a document image, and the AI analyzes it against master records to determine authenticity.
*   **Manual Master Document Creation**: An admin-only feature to manually create and manage official master document templates in the database.
*   **AI-Powered Master Upload**: Admins can also upload an image of a master document, and the AI will automatically extract key data to create a new template.
*   **User Roles**: Supports different user types (Student, University, Company) with a secure authentication system.
*   **Verification History**: Users can view a detailed history of all their past document verifications, including the verification result and a snapshot of the uploaded document.
*   **Admin Dashboard**: A protected area for administrators to issue new document masters and view platform statistics.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **AI & Generative AI:** [Google Gemini](https://ai.google.dev/), [Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.

## Getting Started

To get the project up and running on your local machine, follow these steps.

### 1. Firebase Setup

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Services**: In your new project, go to the "Build" section and enable the following services:
    *   **Authentication**: Add the "Email/Password" and "Google" sign-in providers.
    *   **Firestore Database**: Create a new Firestore database.
    *   **Storage**: Enable Cloud Storage.
3.  **Get Project Credentials:**
    *   In your Firebase project settings (click the gear icon ⚙️), go to the "Your apps" section.
    *   Create a new **Web app**.
    *   After creation, Firebase will provide you with a `firebaseConfig` object. You'll need these values.
4.  **Update Firebase Config:**
    *   Open the `src/firebase/config.ts` file in this project.
    *   Replace the placeholder values in the `firebaseConfig` object with the credentials you just copied from your Firebase project.

### 2. Genkit (Google AI) Setup

1.  **Get a Gemini API Key**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to generate an API key for the Gemini model.
2.  **Set Environment Variable**:
    *   Open the `.env` file in the root of this project.
    *   Replace `"YOUR_GEMINI_API_KEY"` with the key you just generated.

### 3. Local Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:** You will need two terminals running simultaneously.

    *   **Terminal 1: Next.js App**
        ```bash
        npm run dev
        ```
        The application will be available at `http://localhost:9002`.

    *   **Terminal 2: Genkit AI Server**
        ```bash
        npm run genkit:dev
        ```
        This starts the Genkit development server, which is required for all AI-powered features.

## How to Access the Application

*   **Homepage**: `http://localhost:9002/`
*   **Sign Up / Login**: `http://localhost:9002/signup` and `http://localhost:9002/login`
*   **User Dashboard**: `http://localhost:9002/dashboard` (Requires login)
*   **Admin Panel Login**: `http://localhost:9002/admin/login` (Requires a separate admin account)
*   **Admin Dashboard**: `http://localhost:9002/admin` (Requires admin login)

> **Note**: To create an admin user, you must manually set the `isAdmin` field to `true` for a user document in your Firestore database under the `users` collection.

## Available Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the project files.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit server in watch mode.

## Project Structure

-   `src/app/`: Contains all pages and layouts for the Next.js App Router.
    - `(auth)` & `(main)` folders are route groups.
-   `src/components/`: Shared React components.
    -   `src/components/ui/`: UI components from ShadCN.
-   `src/firebase/`: Firebase configuration, providers, and custom hooks.
-   `src/ai/`: Genkit AI flows and configurations.
-   `src/lib/`: Utility functions and libraries.
-   `docs/`: Backend configuration and schema definitions (`backend.json`).
-   `public/`: Static assets like images and logos.

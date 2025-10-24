# DocVerify - Digital Document Verification Platform

DocVerify is a secure and reliable platform built with Next.js and Firebase for digital document verification. It leverages AI to analyze and authenticate documents, helping to combat fraud in education and employment sectors.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **AI & Generative AI:** [Google Gemini](https://ai.google.dev/), [Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

To get the project up and running on your local machine, follow these steps.

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Firebase Setup

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click **"Add project"**.
    *   **Crucially**, when prompted for an "Analytics location", select a region compatible with the free tier, such as **`us-central1` (United States)**. This is required for Firebase Storage to work correctly on the free plan.
    *   Complete the project creation process.

2.  **Get Project Credentials:**
    *   In your new Firebase project, go to **Project settings** (click the gear icon ⚙️ next to "Project Overview").
    *   In the "General" tab, under "Your apps", create a new **Web app**.
    *   After creating the web app, Firebase will provide you with a `firebaseConfig` object. You will need these values to connect your application.

3.  **Environment Variables:**
    *   The application uses the `src/firebase/config.ts` file to configure Firebase. You will need to replace the placeholder values in that file with the credentials from your new Firebase project.
    *   Enable **Authentication** (with Email/Password and Google providers), **Firestore**, and **Storage** in the Firebase console for your project.

### Local Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Run the application:**
    *   **Next.js App:**
        ```bash
        npm run dev
        ```
        The application will be available at `http://localhost:9002`.

    *   **Genkit AI Server:** (In a separate terminal)
        ```bash
        npm run genkit:dev
        ```
        This starts the Genkit development server, which is required for AI-powered features.

## Available Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the project files.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit server in watch mode.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.

## Project Structure

-   `src/app/`: Contains all pages and layouts for the Next.js App Router.
-   `src/components/`: Shared React components.
    -   `src/components/ui/`: UI components from ShadCN.
-   `src/firebase/`: Firebase configuration, providers, and custom hooks.
-   `src/ai/`: Genkit AI flows and configurations.
-   `src/lib/`: Utility functions and libraries.
-   `docs/`: Backend configuration and schema definitions.
-   `public/`: Static assets like images and logos.

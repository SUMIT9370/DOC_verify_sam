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
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Setup:**
    This project is configured to work with Firebase. The necessary configuration is located in `src/firebase/config.ts`. Ensure your Firebase project has **Authentication**, **Firestore**, and **Storage** enabled.

### Running the Application

1.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

2.  **Run the Genkit AI flows (for AI features):**
    In a separate terminal, run:
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit development server, which is required for AI-powered features like document verification and data extraction.

## Available Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the project files.
-   `npm run genkit:dev`: Starts the Genkit development server.

## Project Structure

-   `src/app/`: Contains all the pages and layouts for the Next.js App Router.
-   `src/components/`: Shared React components used across the application.
    -   `src/components/ui/`: UI components from ShadCN.
-   `src/firebase/`: Firebase configuration, providers, and custom hooks.
-   `src/ai/`: Contains all Genkit AI flows and configurations.
-   `src/lib/`: Utility functions and libraries.
-   `docs/`: Contains backend configuration and schema definitions.
-   `public/`: Static assets like images and logos.
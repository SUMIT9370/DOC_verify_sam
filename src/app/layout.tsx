import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Lexend, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { FirebaseClientRoot } from '@/components/firebase-client-root';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-code',
});

export const metadata: Metadata = {
  title: 'DocVerify | Government of India',
  description:
    'Official Document Verification System of the Government of India to ensure authenticity and combat fraud.',
  icons: {
    icon: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          inter.variable,
          lexend.variable,
          sourceCodePro.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientRoot>
            {children}
          </FirebaseClientRoot>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

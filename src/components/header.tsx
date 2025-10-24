import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { GovIndiaLogo } from './icons/gov-india-logo';

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
        <GovIndiaLogo className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold font-headline">DuckVerify</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="#features"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Features
        </Link>
        <Link
          href="#about"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          About
        </Link>
        <Button asChild variant="outline">
          <Link href="/login" prefetch={false}>
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/signup" prefetch={false}>
            Sign Up
          </Link>
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  );
}

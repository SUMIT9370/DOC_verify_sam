import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
        <div className="bg-white rounded-full p-1">
          <Image src="/logo.png" alt="DocVerify Logo" width={40} height={40} />
        </div>
        <span className="text-xl font-bold font-headline">DocVerify</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Button asChild variant="default">
          <Link href="/login" prefetch={false}>
            Sign In
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup" prefetch={false}>
            Sign Up
          </Link>
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  );
}

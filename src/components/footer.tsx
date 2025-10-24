import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
        <div className='container py-8'>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Link href="/" className="flex items-center gap-2" prefetch={false}>
                        <div className="bg-white rounded-full p-1">
                          <Image src="/logo.png" alt="DocVerify Logo" width={32} height={32} />
                        </div>
                        <span className="text-xl font-bold font-headline">DocVerify</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} DocVerify. All rights reserved.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">About DocVerify</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Support</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary">Help & Support</Link></li>
                    </ul>
                </div>
                <div>
                     <h3 className="font-semibold mb-2">Get Our App</h3>
                     <p className='text-sm text-muted-foreground'>Download the DocVerify app from the Google Play and Apple App Store.</p>
                </div>
            </div>
             <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
                <p>Content Owned, Maintained and Updated by the Government of India.</p>
             </div>
        </div>
    </footer>
  );
}

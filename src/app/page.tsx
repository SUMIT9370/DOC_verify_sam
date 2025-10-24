import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  BarChart,
  Building,
  GraduationCap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const howItWorks = [
  {
    icon: <UserCheck className="h-10 w-10 text-primary" />,
    title: '1. Sign Up',
    description: 'Create your secure account by choosing your role - Student, University, or Company.',
  },
  {
    icon: <FileCheck2 className="h-10 w-10 text-primary" />,
    title: '2. Upload & Verify',
    description: 'Upload your documents. Our AI system performs multi-point checks for authenticity.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: '3. Get Verified Status',
    description: 'Receive a real-time, trustworthy verification status for your documents.',
  },
];

const stats = [
    {
        icon: <BarChart className="h-10 w-10 text-primary" />,
        value: "6.2 Billion+",
        label: "Documents Verified"
    },
    {
        icon: <Building className="h-10 w-10 text-primary" />,
        label: "Institutions Onboarded",
        value: "2,500+"
    },
    {
        icon: <GraduationCap className="h-10 w-10 text-primary" />,
        label: "Registered Users",
        value: "25 Crore+"
    }
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Authentic, Digital, Verified.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    DuckVerify is India&apos;s secure platform for digital document verification. Your documents, anytime, anywhere.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="font-bold">
                    <Link href="/signup">
                      Sign Up Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src={PlaceHolderImages.find(img => img.id === 'hero')?.imageUrl || "/placeholder.svg"}
                width={600}
                height={400}
                alt="Digital Document Verification"
                data-ai-hint="document verification abstract"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A simple and secure process to get your documents verified in three easy steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              {howItWorks.map((feature, index) => (
                 <div key={index} className="flex flex-col items-center text-center gap-4 p-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
             <div className="mx-auto grid max-w-5xl items-center gap-8 sm:grid-cols-3 md:gap-12">
                 {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center text-center gap-2">
                        {stat.icon}
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-muted-foreground">{stat.label}</p>
                    </div>
                 ))}
             </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                About DuckVerify
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                DuckVerify is a flagship initiative under the Digital India program, designed to combat document fraud in the education and employment sectors. By providing a unified, secure, and technologically advanced platform, we aim to uphold the integrity of credentials issued within the country.
              </p>
            </div>
            <div className="flex space-x-4 lg:justify-end">
              <Image
                src={PlaceHolderImages.find(img => img.id === 'about1')?.imageUrl || "/placeholder.svg"}
                width={300}
                height={300}
                alt="Digital India Logo"
                data-ai-hint="digital india"
                className="overflow-hidden rounded-lg object-cover"
              />
               <Image
                src={PlaceHolderImages.find(img => img.id === 'about2')?.imageUrl || "/placeholder.svg"}
                width={300}
                height={300}
                alt="Man using laptop"
                data-ai-hint="secure technology"
                className="overflow-hidden rounded-lg object-cover"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  FileScan,
  History,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <FileScan className="h-10 w-10 text-primary" />,
    title: 'Bulk Verification',
    description: 'Upload and verify multiple documents at once with our efficient bulk processing system.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Analysis',
    description: 'Leverages advanced AI to perform multi-level checks including OCR, watermarks, and alignment.',
  },
  {
    icon: <BadgeCheck className="h-10 w-10 text-primary" />,
    title: 'Real-time Status',
    description: 'Track the verification status of your documents in real-time with a clear and interactive interface.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Multi-User Support',
    description: 'Dedicated dashboards for Students, Universities, and Companies with role-specific features.',
  },
  {
    icon: <History className="h-10 w-10 text-primary" />,
    title: 'Secure History',
    description: 'Maintain a secure, auditable history of all your document verification activities.',
  },
];

const schemeImages = PlaceHolderImages.filter(img => img.id.startsWith("scheme"));


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-100 dark:bg-gray-800/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                   <Badge variant="outline" className="border-primary/50 text-primary">From the Government of India</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    DuckVerify: Ensuring Document Authenticity
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A secure, AI-driven platform for students, universities, and industries to verify educational and official documents with confidence.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="font-bold">
                    <Link href="/dashboard">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-bold">
                    <Link href="#features">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src={PlaceHolderImages.find(img => img.id === 'hero')?.imageUrl || "/placeholder.svg"}
                width={600}
                height={400}
                alt="Hero"
                data-ai-hint="document verification abstract"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Core Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides a comprehensive suite of tools to ensure the integrity and authenticity of your documents.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                 <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800/20">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-5xl font-headline mb-12">
              Government Schemes & Initiatives
            </h2>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent>
                {schemeImages.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className="flex aspect-video items-center justify-center p-0">
                          <Image
                            src={image.imageUrl}
                            width={600}
                            height={400}
                            alt={image.description}
                            data-ai-hint={image.imageHint}
                            className="object-cover w-full h-full"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
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

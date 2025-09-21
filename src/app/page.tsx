
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, BotMessageSquare, Sun, Camera, TrendingUp, Wallet, Calculator, Users, Languages, CalendarDays, UserCheck, WifiOff, CheckCircle, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const features = [
    {
      icon: Leaf,
      title: 'Personalized Advisory',
      description: 'Tailored advice based on your specific crop, soil, and weather.',
    },
    {
      icon: Camera,
      title: 'AI Disease Detection',
      description: 'Instantly detect crop diseases with a single photo and get solutions.',
    },
     {
      icon: TrendingUp,
      title: 'Market Price Tracking',
      description: 'Stay updated with the latest mandi prices to maximize your profits.',
    },
     {
      icon: Wallet,
      title: 'Expense Tracker',
      description: 'Easily manage your farm\'s income and expenses for better financial health.',
    },
    {
      icon: BotMessageSquare,
      title: '24/7 AI Chatbot',
      description: 'Get instant answers to your farming questions, anytime you need.',
    },
    {
      icon: CalendarDays,
      title: 'Activity Calendar',
      description: 'Schedule and get reminders for important farming activities.',
    },
     {
      icon: Calculator,
      title: 'Farming Calculators',
      description: 'Calculate fertilizer, seed, and pesticide requirements with ease.',
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with a network of fellow farmers to share knowledge.',
    },
    {
      icon: Languages,
      title: 'Multi-Language Support',
      description: 'Use the app in English, Hindi, and many regional languages.',
    },
];

const testimonials = [
    {
        name: 'Rajinder Singh',
        location: 'Punjab',
        quote: 'eKheti\'s disease detection saved my wheat crop! The advice was timely and accurate. It\'s a must-have for every farmer.',
        avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
        name: 'Sunita Patil',
        location: 'Maharashtra',
        quote: 'The market price tracker helped me sell my onions at the best possible rate. My profits have increased by over 20% this season.',
        avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
        name: 'Arjun Reddy',
        location: 'Andhra Pradesh',
        quote: 'Managing expenses was always a hassle. The expense tracker is so simple to use and has given me a clear picture of my finances.',
        avatar: 'https://i.pravatar.cc/150?img=3'
    },
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4 text-primary"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-primary/5">
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-6">
                <div className="inline-block rounded-lg bg-accent/10 px-3 py-1 text-sm text-accent font-semibold">
                    Your AI Farming Partner
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary">
                    Smart Farming for a Better Harvest
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                    eKheti provides AI-powered insights for disease detection, crop advisory, and market pricing to help you increase yield and profitability.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Start Farming Smarter
                    </Link>
                  </Button>
                   <Button asChild size="lg" variant="outline">
                    <Link href="#features">
                      Explore Features
                    </Link>
                  </Button>
                </div>
            </div>
            <div className="mt-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-10"></div>
                <Image
                    src="https://picsum.photos/seed/dashboard/1200/600"
                    width="1000"
                    height="500"
                    alt="eKheti Dashboard Preview"
                    data-ai-hint="app dashboard"
                    className="mx-auto rounded-xl object-cover shadow-2xl ring-1 ring-border"
                />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Easy as 1-2-3</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">Get started in minutes and transform your farming practices.</p>
                </div>
                 <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-3">
                    <div className="relative flex flex-col items-center text-center">
                        <div className="absolute top-10 left-[calc(50%_+_2rem)] hidden w-full border-t-2 border-dashed border-border md:block"></div>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                            <span className="text-3xl font-bold text-primary">1</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sign Up & Setup</h3>
                        <p className="text-muted-foreground">Create your account and add basic details about your farm and crops.</p>
                    </div>
                     <div className="relative flex flex-col items-center text-center">
                        <div className="absolute top-10 left-[calc(50%_+_2rem)] hidden w-full border-t-2 border-dashed border-border md:block"></div>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                             <span className="text-3xl font-bold text-primary">2</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Get AI Insights</h3>
                        <p className="text-muted-foreground">Use our tools to get instant advisories, detect diseases, and track market prices.</p>
                    </div>
                     <div className="relative flex flex-col items-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                             <span className="text-3xl font-bold text-primary">3</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Boost Your Yield</h3>
                        <p className="text-muted-foreground">Make informed decisions to increase efficiency, reduce losses, and improve profits.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">All-In-One Platform</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features for the Modern Farmer</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                eKheti brings cutting-edge technology to your fingertips, simplifying every aspect of farm management.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
         <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">From Our Farmers</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Farmers Across India</h2>
                </div>
                <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map(t => (
                        <Card key={t.name} className="flex flex-col">
                            <CardContent className="pt-6 flex-1">
                                <p className="text-muted-foreground">"{t.quote}"</p>
                            </CardContent>
                             <CardHeader className="flex-row gap-4 items-center border-t mt-4 pt-6">
                                <Avatar>
                                    <AvatarImage src={t.avatar} alt={t.name} />
                                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{t.name}</p>
                                    <p className="text-sm text-muted-foreground">{t.location}</p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

         {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Transform Your Farm?</h2>
                    <p className="max-w-xl text-muted-foreground">Join thousands of farmers who are building a more profitable and sustainable future with eKheti.</p>
                     <Button asChild size="lg" className="mt-4">
                        <Link href="/signup">
                           Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>
      <footer className="bg-background border-t">
         <div className="container flex flex-col gap-4 sm:flex-row py-6 items-center justify-between px-4 md:px-6">
            <Logo />
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} eKheti. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6">
                <Link href="#" className="text-xs hover:underline underline-offset-4">
                    Terms of Service
                </Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4">
                    Privacy Policy
                </Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}


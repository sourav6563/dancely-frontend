import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { Video, Play, Users, ArrowRight, Upload, Heart, Sparkles, UserPlus } from 'lucide-react';

/**
 * Landing Page for Unauthenticated Users
 * Centered layout with premium typography and no mock data
 */
export function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-purple-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-20 md:py-32 px-4 text-center overflow-hidden bg-white dark:bg-black z-10">
        {/* Modern Grid Background - Darker lines for better visibility in light mode */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-50/30 to-white dark:via-purple-900/10 dark:to-black pointer-events-none" />
        
        <div className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-700 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className={`inline-flex items-center justify-center p-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-full transition-all duration-700 delay-100 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="bg-linear-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 tracking-wide uppercase">New</span>
            <span className="text-purple-700 dark:text-purple-300 text-sm font-medium pr-2">The #1 Platform for Dancers</span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-all duration-700 delay-200 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Share Your <br />
            <span className="bg-linear-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent italic pr-2 animate-gradient bg-size-[200%_auto]">
              Dance Moves
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            Upload, share, and discover incredible dance performances from creators around the globe.
          </p>
          
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 transition-all duration-700 delay-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}>
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-300 dark:hover:shadow-purple-800/50 rounded-full">
                Join for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium bg-white/80 backdrop-blur-sm border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-500/30 dark:hover:text-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 rounded-full">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Glass Bar */}
      <section className="relative z-20 -mt-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-gray-300 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center divide-x divide-gray-300 dark:divide-gray-800/50 text-gray-800 dark:text-gray-200">
              <StatItem icon={<Video className="h-5 w-5" />} label="Video Upload" />
              <StatItem icon={<UserPlus className="h-5 w-5" />} label="Follow System" />
              <StatItem icon={<Heart className="h-5 w-5" />} label="Like & Share" />
              <StatItem icon={<Users className="h-5 w-5" />} label="Community" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Professional tools designed specifically for dancers and creators.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Play className="h-6 w-6 text-white" />}
              color="bg-purple-600"
              title="Watch & Learn"
              description="Explore dance videos and discover new moves from creators worldwide."
            />
            <FeatureCard 
              icon={<Upload className="h-6 w-6 text-white" />}
              color="bg-blue-600"
              title="Share Content"
              description="Upload high-quality videos with custom thumbnails and descriptions."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-indigo-600"
              title="Build Community"
              description="Follow dancers, engage with content, and grow your audience."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-gray-950 border-b border-gray-300 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Get Started in 3 Steps</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple and quick setup</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-purple-300 via-blue-300 to-indigo-300 dark:from-purple-600 dark:via-blue-600 dark:to-indigo-600" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <StepCard 
                number="1"
                title="Create Account"
                description="Sign up free in 30 seconds"
                delay={0}
              />
              <StepCard 
                number="2"
                title="Upload Videos"
                description="Share your dance performances"
                delay={200}
              />
              <StepCard 
                number="3"
                title="Grow Audience"
                description="Connect with community"
                delay={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - V2 Style with Image Overlay */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-purple-900 to-blue-900 opacity-90 dark:opacity-50" />
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=3456&auto=format&fit=crop')] bg-cover mix-blend-overlay opacity-20"
          style={{ backgroundPosition: '50% 35%' }}
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            Ready to hit the stage?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join the fastest growing dance community today. It&apos;s free to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-white text-purple-900 hover:bg-gray-100 border-0 shadow-2xl hover:scale-105 transition-transform">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all duration-300 hover:scale-105">
      <div className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/20 p-3 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-500/30 transition-colors">
        {icon}
      </div>
      <span className="text-gray-700 dark:text-gray-200 font-semibold text-sm tracking-wide group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }: { icon: React.ReactNode; color: string; title: string; description: string }) {
  return (
    <div className="group relative p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-purple-100 dark:hover:shadow-purple-900/20 hover:-translate-y-1 overflow-hidden">

      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${color} shadow-lg shadow-purple-500/20 mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

function StepCard({ number, title, description, delay = 0 }: { number: string; title: string; description: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col items-center text-center space-y-4 relative z-10 transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="h-16 w-16 rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:scale-110 transition-all duration-300">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

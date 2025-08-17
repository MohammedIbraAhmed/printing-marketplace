'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, Clock, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroProps {
  className?: string
}

export function HeroSection({ className }: HeroProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'creators' | 'shops'>('students')

  const content = {
    students: {
      badge: 'For Students',
      headline: 'Get your educational materials printed locally, same day',
      subtext: 'Skip the 3-5 day wait of online printing services. Find quality print shops near your campus and get your study materials printed the same day.',
      cta: 'Find Print Shops',
      ctaHref: '/browse',
      stats: [
        { icon: Clock, label: 'Same-day printing', value: '24hrs' },
        { icon: MapPin, label: 'Local print shops', value: '500+' },
        { icon: Users, label: 'Happy students', value: '10k+' },
      ]
    },
    creators: {
      badge: 'For Creators',
      headline: 'Monetize your educational content through print-on-demand',
      subtext: 'Turn your educational materials into passive income. Reach students who prefer physical materials with no upfront costs or inventory management.',
      cta: 'Start Creating',
      ctaHref: '/creators',
      stats: [
        { icon: Clock, label: 'Average monthly earnings', value: '$500' },
        { icon: MapPin, label: 'Active content pieces', value: '1000+' },
        { icon: Users, label: 'Creator community', value: '250+' },
      ]
    },
    shops: {
      badge: 'For Print Shops',
      headline: 'Connect with students and educational institutions',
      subtext: 'Increase your customer base with digital orders from local students and institutions. Professional tools for seamless order management.',
      cta: 'Join as Print Shop',
      ctaHref: '/print-shops',
      stats: [
        { icon: Clock, label: 'Average order value', value: '$25' },
        { icon: MapPin, label: 'Partner print shops', value: '500+' },
        { icon: Users, label: 'Monthly orders', value: '5k+' },
      ]
    }
  }

  const currentContent = content[activeTab]

  return (
    <section className={cn('relative min-h-[90vh] flex items-center', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(content).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] min-w-[120px]',
                  activeTab === key
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {value.badge}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {currentContent.badge}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {currentContent.headline}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {currentContent.subtext}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="min-h-[56px] px-8 text-lg">
                <Link href={currentContent.ctaHref}>
                  {currentContent.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="min-h-[56px] px-8 text-lg group"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
            {currentContent.stats.map((stat, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50"
              >
                <stat.icon className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground text-center">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by students at leading universities
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Stanford', 'MIT', 'Harvard', 'UC Berkeley', 'Yale'].map((university) => (
                <div key={university} className="text-lg font-semibold text-muted-foreground">
                  {university}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
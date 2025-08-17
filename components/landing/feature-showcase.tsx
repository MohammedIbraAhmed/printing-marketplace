'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MapPin, 
  Shield, 
  Users, 
  FileText,
  CheckCircle,
  ArrowRight 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FeatureShowcaseProps {
  className?: string
}

const features = [
  {
    icon: Clock,
    title: 'Same-Day Printing',
    description: 'Get your educational materials printed locally within hours, not days. Perfect for last-minute study sessions and urgent assignments.',
    benefits: ['Order by 2 PM for same-day pickup', 'Track printing progress in real-time', 'Emergency printing options available'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Users,
    title: 'Creator Marketplace',
    description: 'Access thousands of high-quality educational materials from verified content creators and earn money from your own content.',
    benefits: ['10,000+ educational resources', 'Verified creator content only', 'Earn 40% on every print'],
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Every print shop is vetted and every print job is guaranteed. Get exactly what you ordered with our satisfaction guarantee.',
    benefits: ['Vetted print shop partners', '100% satisfaction guarantee', 'Quality control standards'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
]

const processSteps = [
  {
    step: '01',
    title: 'Browse or Upload',
    description: 'Find educational content or upload your own materials to the marketplace.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Select Print Shop',
    description: 'Choose from local verified print shops with real-time pricing and availability.',
    icon: MapPin,
  },
  {
    step: '03',
    title: 'Get Your Prints',
    description: 'Pick up your professionally printed materials the same day or get them delivered.',
    icon: CheckCircle,
  },
]

export function FeatureShowcase({ className }: FeatureShowcaseProps) {
  return (
    <section className={cn('py-24 bg-muted/30', className)}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need for educational printing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From instant access to quality materials to same-day local printing, 
            we&apos;ve built the complete solution for educational content printing.
          </p>
        </div>

        {/* Main Features Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24"
          data-testid="feature-grid"
        >
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-8 space-y-6">
                {/* Icon */}
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', feature.bgColor)}>
                  <feature.icon className={cn('h-8 w-8', feature.color)} />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Benefits List */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className={cn('h-4 w-4 mt-0.5 flex-shrink-0', feature.color)} />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple 3-step process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get from idea to printed materials in just a few clicks. 
              Our streamlined process makes educational printing effortless.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection Line (Desktop Only) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-10">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                )}

                <div className="text-center space-y-6 relative z-20">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center pt-12">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Ready to get started?
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Join thousands of students, creators, and print shops already using PrintMarket.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="min-h-[56px] px-8 text-lg">
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="min-h-[56px] px-8 text-lg">
                  <Link href="/how-it-works">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
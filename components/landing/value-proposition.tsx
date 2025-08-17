'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  PenTool, 
  Store,
  ArrowRight,
  Clock,
  DollarSign,
  Users,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ValuePropositionProps {
  className?: string
}

const segments = [
  {
    id: 'students',
    icon: GraduationCap,
    title: 'For Students',
    headline: 'Get study materials printed locally, same day',
    description: 'Skip the long waits of online printing. Find quality print shops near your campus and get your educational materials printed when you need them.',
    benefits: [
      { icon: Clock, text: 'Same-day printing available', highlight: 'Order by 2 PM' },
      { icon: DollarSign, text: 'Competitive local pricing', highlight: 'Best rates' },
      { icon: Store, text: '500+ verified print shops', highlight: 'Near you' },
      { icon: Star, text: 'Quality guaranteed materials', highlight: '100% satisfaction' },
    ],
    cta: 'Find Print Shops',
    ctaHref: '/browse',
    color: 'blue',
    bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'creators',
    icon: PenTool,
    title: 'For Content Creators',
    headline: 'Monetize your educational content',
    description: 'Turn your knowledge into passive income. Upload educational materials and earn money every time someone prints them, with no upfront costs.',
    benefits: [
      { icon: DollarSign, text: 'Earn 40% on every print', highlight: 'Passive income' },
      { icon: Users, text: '10,000+ active students', highlight: 'Ready audience' },
      { icon: Clock, text: 'Upload once, earn forever', highlight: 'No inventory' },
      { icon: Star, text: 'Professional content review', highlight: 'Quality assured' },
    ],
    cta: 'Start Creating',
    ctaHref: '/creators',
    color: 'green',
    bgGradient: 'from-green-500/10 via-green-500/5 to-transparent',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'shops',
    icon: Store,
    title: 'For Print Shops',
    headline: 'Grow your business with digital orders',
    description: 'Connect with local students and institutions. Increase your customer base with our platform while maintaining your quality standards.',
    benefits: [
      { icon: Users, text: 'Access to student market', highlight: 'Local customers' },
      { icon: DollarSign, text: 'Average $25 order value', highlight: 'Higher margins' },
      { icon: Clock, text: 'Streamlined order management', highlight: 'Save time' },
      { icon: Star, text: 'Quality certification program', highlight: 'Build trust' },
    ],
    cta: 'Join as Print Shop',
    ctaHref: '/print-shops',
    color: 'purple',
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
]

const testimonials = [
  {
    quote: "PrintMarket saved me during finals week. I got my study guides printed the same day when I needed them most.",
    author: "Sarah Chen",
    role: "Stanford Student",
    avatar: "SC",
    segment: "students"
  },
  {
    quote: "I've earned over $2,000 from my calculus worksheets. It's amazing to see my content helping students while earning passive income.",
    author: "Dr. Mike Rodriguez",
    role: "Math Professor & Creator",
    avatar: "MR",
    segment: "creators"
  },
  {
    quote: "Our order volume increased 40% since joining PrintMarket. The platform brings us consistent student customers.",
    author: "Lisa Park",
    role: "Campus Copy Shop Owner",
    avatar: "LP",
    segment: "shops"
  },
]

export function ValueProposition({ className }: ValuePropositionProps) {
  return (
    <section className={cn('py-24', className)}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Value Propositions
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Built for every part of the ecosystem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re a student needing materials, a creator sharing knowledge, 
            or a print shop growing business, PrintMarket has you covered.
          </p>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {segments.map((segment, index) => (
            <Card 
              key={segment.id}
              className={cn(
                'group relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
                segment.borderColor
              )}
            >
              {/* Background Gradient */}
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', segment.bgGradient)} />
              
              <CardContent className="relative p-8 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      segment.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/50',
                      segment.color === 'green' && 'bg-green-100 dark:bg-green-900/50',
                      segment.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/50'
                    )}>
                      <segment.icon className={cn(
                        'h-6 w-6',
                        segment.color === 'blue' && 'text-blue-600',
                        segment.color === 'green' && 'text-green-600',
                        segment.color === 'purple' && 'text-purple-600'
                      )} />
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">
                      {segment.title}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold leading-tight">
                    {segment.headline}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {segment.description}
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  {segment.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-start space-x-3">
                      <benefit.icon className={cn(
                        'h-4 w-4 mt-0.5 flex-shrink-0',
                        segment.color === 'blue' && 'text-blue-600',
                        segment.color === 'green' && 'text-green-600',
                        segment.color === 'purple' && 'text-purple-600'
                      )} />
                      <div className="text-sm">
                        <span className="text-foreground">{benefit.text}</span>
                        <span className={cn(
                          'ml-2 font-medium',
                          segment.color === 'blue' && 'text-blue-600',
                          segment.color === 'green' && 'text-green-600',
                          segment.color === 'purple' && 'text-purple-600'
                        )}>
                          {benefit.highlight}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button 
                  asChild 
                  className={cn(
                    'w-full min-h-[44px] group-hover:scale-105 transition-transform',
                    segment.color === 'blue' && 'bg-blue-600 hover:bg-blue-700',
                    segment.color === 'green' && 'bg-green-600 hover:bg-green-700',
                    segment.color === 'purple' && 'bg-purple-600 hover:bg-purple-700'
                  )}
                >
                  <Link href={segment.ctaHref}>
                    {segment.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Customer Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Loved by our community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how PrintMarket is making a difference for students, creators, and print shops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
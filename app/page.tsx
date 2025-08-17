import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureShowcase } from '@/components/landing/feature-showcase'
import { ValueProposition } from '@/components/landing/value-proposition'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <FeatureShowcase />
        <ValueProposition />
      </main>
      
      <Footer />
    </div>
  )
}
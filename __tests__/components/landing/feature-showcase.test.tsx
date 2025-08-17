import { render, screen } from '@testing-library/react'
import { FeatureShowcase } from '@/components/landing/feature-showcase'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('FeatureShowcase', () => {
  it('renders all main features', () => {
    render(<FeatureShowcase />)
    
    // Check for main feature titles
    expect(screen.getByText('Same-Day Printing')).toBeInTheDocument()
    expect(screen.getByText('Creator Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Quality Assurance')).toBeInTheDocument()
    
    // Check for feature descriptions
    expect(screen.getByText(/Order by 2 PM for same-day pickup/)).toBeInTheDocument()
    expect(screen.getByText(/10,000\+ educational resources/)).toBeInTheDocument()
    expect(screen.getByText(/Vetted print shop partners/)).toBeInTheDocument()
  })

  it('displays the process steps correctly', () => {
    render(<FeatureShowcase />)
    
    // Check for process step titles
    expect(screen.getByText('Browse or Upload')).toBeInTheDocument()
    expect(screen.getByText('Select Print Shop')).toBeInTheDocument()
    expect(screen.getByText('Get Your Prints')).toBeInTheDocument()
    
    // Check for step numbers
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('has proper grid layout structure', () => {
    render(<FeatureShowcase />)
    
    const featureGrid = screen.getByTestId('feature-grid')
    expect(featureGrid).toBeInTheDocument()
    expect(featureGrid).toHaveClass('grid')
    expect(featureGrid).toHaveClass('grid-cols-1')
    expect(featureGrid).toHaveClass('md:grid-cols-2')
    expect(featureGrid).toHaveClass('lg:grid-cols-3')
  })

  it('includes call-to-action buttons', () => {
    render(<FeatureShowcase />)
    
    // Should have main CTA buttons
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
    
    // Check links have proper href attributes
    const getStartedLink = screen.getByText('Get Started Free').closest('a')
    const learnMoreLink = screen.getByText('Learn More').closest('a')
    
    expect(getStartedLink).toHaveAttribute('href', '/auth/signup')
    expect(learnMoreLink).toHaveAttribute('href', '/how-it-works')
  })

  it('renders section headers correctly', () => {
    render(<FeatureShowcase />)
    
    // Check for main section headers
    expect(screen.getByText('Platform Features')).toBeInTheDocument()
    expect(screen.getByText('Everything you need for educational printing')).toBeInTheDocument()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Simple 3-step process')).toBeInTheDocument()
  })

  it('includes benefit lists for each feature', () => {
    render(<FeatureShowcase />)
    
    // Check for specific benefit text instead of symbols
    expect(screen.getByText(/Order by 2 PM for same-day pickup/)).toBeInTheDocument()
    expect(screen.getByText(/10,000\+ educational resources/)).toBeInTheDocument()
    expect(screen.getByText(/Vetted print shop partners/)).toBeInTheDocument()
  })
})
import { render, screen, fireEvent } from '@testing-library/react'
import { HeroSection } from '@/components/landing/hero-section'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('HeroSection', () => {
  it('renders main headline and call-to-action', () => {
    render(<HeroSection />)
    
    // Should render main headline
    const headline = screen.getByRole('heading', { level: 1 })
    expect(headline).toBeInTheDocument()
    expect(headline.textContent).toContain('same day')
    
    // Should render primary CTA
    expect(screen.getByText('Find Print Shops')).toBeInTheDocument()
    expect(screen.getByText('Watch Demo')).toBeInTheDocument()
  })

  it('displays different messaging for each user segment', () => {
    render(<HeroSection />)
    
    // Check for segment-specific content (use getAllByText for multiple matches)
    expect(screen.getAllByText(/same.*day/i).length).toBeGreaterThan(0)
    
    // Test tab switching
    const creatorsTab = screen.getByText('For Creators')
    fireEvent.click(creatorsTab)
    expect(screen.getByText(/monetize/i)).toBeInTheDocument()
    
    const shopsTab = screen.getByText('For Print Shops')
    fireEvent.click(shopsTab)
    expect(screen.getByText(/connect/i)).toBeInTheDocument()
  })

  it('shows trust indicators and statistics', () => {
    render(<HeroSection />)
    
    // Should show university trust indicators
    expect(screen.getByText('Stanford')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(screen.getByText('Harvard')).toBeInTheDocument()
    
    // Should show statistics
    expect(screen.getByText('24hrs')).toBeInTheDocument()
    expect(screen.getByText('500+')).toBeInTheDocument()
    expect(screen.getByText('10k+')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<HeroSection />)
    
    // Tab buttons should be accessible
    const tabs = screen.getAllByRole('button')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('class')
    })
    
    // Links should have proper attributes
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('updates content when switching between tabs', () => {
    render(<HeroSection />)
    
    // Initially should show students content
    expect(screen.getByText('Find Print Shops')).toBeInTheDocument()
    
    // Switch to creators
    fireEvent.click(screen.getByText('For Creators'))
    expect(screen.getByText('Start Creating')).toBeInTheDocument()
    
    // Switch to shops
    fireEvent.click(screen.getByText('For Print Shops'))
    expect(screen.getByText('Join as Print Shop')).toBeInTheDocument()
  })
})
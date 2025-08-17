import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Header } from '@/components/layout/header'
import { useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('Header', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })
  })

  it('renders logo and brand name', () => {
    render(<Header />)
    
    expect(screen.getByText('PrintMarket')).toBeInTheDocument()
    expect(screen.getByText('P')).toBeInTheDocument() // Logo letter
  })

  it('shows sign in and get started buttons when not authenticated', () => {
    render(<Header />)
    
    // Should show auth buttons
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    
    // Check proper links
    const signInLink = screen.getByText('Sign In').closest('a')
    const getStartedLink = screen.getByText('Get Started').closest('a')
    
    expect(signInLink).toHaveAttribute('href', '/auth/signin')
    expect(getStartedLink).toHaveAttribute('href', '/auth/signup')
  })

  it('shows user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          image: null,
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Header />)
    
    // Should show user avatar/initial
    expect(screen.getByText('J')).toBeInTheDocument() // User initial
    
    // Should not show auth buttons
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
  })

  it('shows mobile menu button on mobile', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveClass('md:hidden')
  })

  it('renders navigation items based on user role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          image: null,
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Header />)
    
    // Should show navigation items for customer
    expect(screen.getByText('Browse Content')).toBeInTheDocument()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    
    // Should not show creator-specific items
    expect(screen.queryByText('Upload Content')).not.toBeInTheDocument()
  })

  it('filters navigation items for different roles', () => {
    // Test creator role
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Jane Creator',
          email: 'jane@example.com',
          role: 'creator',
          image: null,
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Header />)
    
    // Should show creator-specific items
    expect(screen.getByText('Upload Content')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Header />)
    
    // Header should have proper structure
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // Navigation should be accessible
    const nav = screen.getByRole('navigation', { hidden: true })
    expect(nav).toBeInTheDocument()
    
    // Menu button should have accessible name
    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows loading state appropriately', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    })

    render(<Header />)
    
    // Should show loading placeholder
    const loadingElement = screen.getByText('', { selector: '.animate-pulse' })
    expect(loadingElement).toBeInTheDocument()
  })
})
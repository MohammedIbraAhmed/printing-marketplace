# UI/UX Architecture & Design System
## Printing Marketplace Platform

### Executive Summary

This document outlines the comprehensive UI/UX architecture for the three-sided printing marketplace, focusing on design consistency, user experience optimization, and scalable component implementation using shadcn/ui as the foundation. The design system ensures seamless experiences across customer, creator, and print shop interfaces while maintaining visual hierarchy and accessibility standards.

---

## Design System Foundation

### Core Design Principles

```typescript
// Design Philosophy
const designPrinciples = {
  // Mobile-first approach for student demographic
  mobilePriority: "Touch-optimized interface with thumb-friendly navigation",
  
  // Progressive disclosure for complex workflows
  informationArchitecture: "Essential info first, detailed options on demand",
  
  // Visual clarity for urgent printing needs
  visualHierarchy: "Clear status indicators, ratings, and availability",
  
  // Role-specific optimization
  contextualDesign: "Customized interfaces for each user segment",
  
  // Efficiency for repeat users
  streamlinedActions: "One-touch actions for common tasks"
}
```

### shadcn/ui Configuration & Setup

```bash
# Initial shadcn/ui setup
npx shadcn-ui@latest init

# Core components installation
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add table
npx shadcn-ui@latest add pagination
```

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand colors for printing marketplace
        primary: {
          50: "#eff6ff",
          100: "#dbeafe", 
          500: "#3b82f6", // Primary blue
          600: "#2563eb",
          900: "#1e3a8a"
        },
        // Status colors for order tracking
        status: {
          pending: "#f59e0b",    // amber-500
          progress: "#3b82f6",   // blue-500
          ready: "#10b981",      // emerald-500
          completed: "#059669",  // emerald-600
          cancelled: "#ef4444"   // red-500
        },
        // Role-specific accent colors
        roles: {
          customer: "#3b82f6",   // blue-500
          creator: "#8b5cf6",    // violet-500
          printShop: "#f59e0b",  // amber-500
          admin: "#6b7280"       // gray-500
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## Component Architecture

### Base Component Library Structure

```
components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   └── ...
├── layout/                 # Layout components
│   ├── header.tsx
│   ├── navigation.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
├── marketplace/            # Business logic components
│   ├── content-card.tsx
│   ├── shop-directory.tsx
│   ├── order-tracker.tsx
│   └── price-calculator.tsx
├── forms/                  # Form components
│   ├── upload-form.tsx
│   ├── order-form.tsx
│   └── profile-form.tsx
├── dashboards/            # Role-specific dashboards
│   ├── customer/
│   ├── creator/
│   ├── print-shop/
│   └── admin/
└── shared/                # Shared utility components
    ├── file-upload.tsx
    ├── image-gallery.tsx
    ├── rating-display.tsx
    └── status-indicator.tsx
```

### Custom Component Extensions

```typescript
// components/marketplace/content-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Download, Eye } from "lucide-react"

interface ContentCardProps {
  content: {
    id: string
    title: string
    description: string
    creator: string
    subject: string
    gradeLevel: string[]
    rating: number
    price: number
    thumbnail?: string
    downloadCount: number
    viewCount: number
  }
  onSelect?: (id: string) => void
  variant?: "grid" | "list"
}

export function ContentCard({ content, onSelect, variant = "grid" }: ContentCardProps) {
  return (
    <Card className={`
      group cursor-pointer transition-all duration-200 
      hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
      ${variant === "list" ? "flex flex-row" : ""}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2">
              {content.title}
            </h3>
            <p className="text-xs text-muted-foreground">by {content.creator}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {content.subject}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {content.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {content.gradeLevel.map((grade) => (
            <Badge key={grade} variant="outline" className="text-xs">
              {grade}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {content.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {content.downloadCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {content.viewCount}
            </span>
          </div>
          <span className="font-semibold text-base text-foreground">
            ${content.price.toFixed(2)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          onClick={() => onSelect?.(content.id)}
          className="w-full text-sm"
          size="sm"
        >
          Select for Printing
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Order Status Component

```typescript
// components/marketplace/order-tracker.tsx
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Printer, Package } from "lucide-react"

interface OrderStatus {
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'completed'
  estimatedCompletion?: Date
  progress: number
}

export function OrderTracker({ status, estimatedCompletion, progress }: OrderStatus) {
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: "bg-amber-500", 
      label: "Pending", 
      description: "Waiting for print shop confirmation" 
    },
    accepted: { 
      icon: CheckCircle, 
      color: "bg-blue-500", 
      label: "Accepted", 
      description: "Print shop confirmed your order" 
    },
    in_progress: { 
      icon: Printer, 
      color: "bg-blue-500", 
      label: "Printing", 
      description: "Your order is being printed" 
    },
    ready: { 
      icon: Package, 
      color: "bg-emerald-500", 
      label: "Ready", 
      description: "Ready for pickup/delivery" 
    },
    completed: { 
      icon: CheckCircle, 
      color: "bg-emerald-600", 
      label: "Completed", 
      description: "Order completed successfully" 
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.color} text-white`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <Badge variant="secondary">{config.label}</Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
        
        {estimatedCompletion && (
          <div className="text-right">
            <p className="text-sm font-medium">Estimated completion</p>
            <p className="text-xs text-muted-foreground">
              {estimatedCompletion.toLocaleDateString()} at{" "}
              {estimatedCompletion.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute:'2-digit' 
              })}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  )
}
```

---

## Navigation Architecture

### Role-Based Navigation System

```typescript
// components/layout/navigation.tsx
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  roles: string[]
}

const navigationItems: NavigationItem[] = [
  {
    label: "Browse Content",
    href: "/browse",
    roles: ["customer"]
  },
  {
    label: "My Orders",
    href: "/orders",
    roles: ["customer", "creator", "printShop"]
  },
  {
    label: "Upload Content",
    href: "/creator/upload",
    roles: ["creator"]
  },
  {
    label: "My Content",
    href: "/creator/content",
    roles: ["creator"]
  },
  {
    label: "Analytics",
    href: "/creator/analytics",
    roles: ["creator"]
  },
  {
    label: "Shop Dashboard",
    href: "/shop/dashboard",
    roles: ["printShop"]
  },
  {
    label: "Order Queue",
    href: "/shop/orders",
    roles: ["printShop"]
  },
  {
    label: "Admin Panel",
    href: "/admin",
    roles: ["admin"]
  }
]

export function Navigation() {
  const { data: session } = useSession()
  const userRole = session?.user?.role

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(userRole || '')
  )

  return (
    <NavigationMenu>
      {visibleItems.map((item) => (
        <NavigationMenuItem key={item.href}>
          <NavigationMenuLink href={item.href}>
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenu>
  )
}
```

### Mobile Navigation

```typescript
// components/layout/mobile-navigation.tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <nav className="flex flex-col space-y-4">
          {/* Navigation items */}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

---

## Dashboard Layouts

### Role-Specific Dashboard Components

```typescript
// components/dashboards/customer/customer-dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentOrders } from "./recent-orders"
import { QuickActions } from "./quick-actions"
import { RecommendedContent } from "./recommended-content"

export function CustomerDashboard() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <QuickActions />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 in progress, 1 ready for pickup
            </p>
          </CardContent>
        </Card>
        
        {/* More stats cards */}
      </div>
      
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="content">Recommended Content</TabsTrigger>
          <TabsTrigger value="shops">Nearby Shops</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <RecentOrders />
        </TabsContent>
        
        <TabsContent value="content">
          <RecommendedContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Creator Dashboard

```typescript
// components/dashboards/creator/creator-dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, TrendingUp, DollarSign, Eye } from "lucide-react"

export function CreatorDashboard() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Creator Studio</h1>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Content
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        {/* More stats */}
      </div>
      
      {/* Content management interface */}
    </div>
  )
}
```

---

## Form Architecture

### Multi-Step Form Components

```typescript
// components/forms/order-form.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { StepIndicator } from "./step-indicator"

const steps = [
  { id: 1, title: "Content Selection", description: "Choose your files" },
  { id: 2, title: "Print Options", description: "Configure printing" },
  { id: 3, title: "Shop Selection", description: "Choose print shop" },
  { id: 4, title: "Review", description: "Confirm order" }
]

export function OrderForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const form = useForm({
    resolver: zodResolver(orderSchema),
    mode: "onChange"
  })

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>
      
      <Form {...form}>
        <form className="space-y-6">
          {currentStep === 1 && <ContentSelectionStep />}
          {currentStep === 2 && <PrintOptionsStep />}
          {currentStep === 3 && <ShopSelectionStep />}
          {currentStep === 4 && <ReviewStep />}
          
          <div className="flex justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <Button 
              type="button"
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              {currentStep === steps.length ? "Place Order" : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
```

---

## Responsive Design System

### Breakpoint Strategy

```typescript
// lib/utils/responsive.ts
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
} as const

// Mobile-first utility classes
export const responsiveClasses = {
  // Grid systems
  grid: {
    mobile: "grid-cols-1",
    tablet: "md:grid-cols-2", 
    desktop: "lg:grid-cols-3",
    large: "xl:grid-cols-4"
  },
  
  // Typography
  heading: {
    mobile: "text-2xl",
    tablet: "md:text-3xl",
    desktop: "lg:text-4xl"
  },
  
  // Spacing
  container: {
    mobile: "px-4",
    tablet: "md:px-6",
    desktop: "lg:px-8"
  }
}
```

### Touch-Optimized Components

```typescript
// components/ui/touch-button.tsx
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TouchButtonProps extends ButtonProps {
  touchOptimized?: boolean
}

export function TouchButton({ 
  touchOptimized = true, 
  className, 
  children, 
  ...props 
}: TouchButtonProps) {
  return (
    <Button
      className={cn(
        touchOptimized && [
          "min-h-[44px]", // Apple's recommended touch target
          "min-w-[44px]",
          "active:scale-95",
          "transition-transform duration-100"
        ],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
```

---

## Accessibility Implementation

### WCAG AA Compliance

```typescript
// components/ui/accessible-card.tsx
import { Card, CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AccessibleCardProps extends CardProps {
  ariaLabel?: string
  focusable?: boolean
  interactive?: boolean
}

export function AccessibleCard({ 
  ariaLabel,
  focusable = false,
  interactive = false,
  className,
  children,
  ...props 
}: AccessibleCardProps) {
  return (
    <Card
      role={interactive ? "button" : undefined}
      tabIndex={focusable ? 0 : undefined}
      aria-label={ariaLabel}
      className={cn(
        // Ensure sufficient color contrast
        "border-border/50",
        
        // Focus indicators
        focusable && [
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-primary",
          "focus:ring-offset-2"
        ],
        
        // Interactive states
        interactive && [
          "cursor-pointer",
          "hover:bg-muted/50",
          "transition-colors"
        ],
        
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
```

### Screen Reader Optimization

```typescript
// components/shared/screen-reader-text.tsx
interface ScreenReaderTextProps {
  children: React.ReactNode
}

export function ScreenReaderText({ children }: ScreenReaderTextProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Usage in components
export function OrderStatus({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant(status)}>
        {status}
      </Badge>
      <ScreenReaderText>
        Order status is {status}. 
        {status === 'ready' && 'Your order is ready for pickup.'}
      </ScreenReaderText>
    </div>
  )
}
```

---

## Dark Mode Implementation

### Theme Configuration

```typescript
// components/theme/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

### Theme Toggle Component

```typescript
// components/theme/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

---

## Animation & Interaction

### Micro-Interactions

```typescript
// components/ui/animated-button.tsx
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AnimatedButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "transition-all duration-200",
        "hover:scale-105 hover:shadow-lg",
        "active:scale-95",
        "focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
```

### Loading States

```typescript
// components/ui/loading-card.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-8 w-full mt-4" />
      </CardContent>
    </Card>
  )
}
```

---

## Design Token System

### Consistent Spacing & Typography

```typescript
// lib/design-tokens.ts
export const designTokens = {
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
  },
  
  typography: {
    // Font sizes
    xs: "0.75rem",   // 12px
    sm: "0.875rem",  // 14px
    base: "1rem",    // 16px
    lg: "1.125rem",  // 18px
    xl: "1.25rem",   // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
  },
  
  borderRadius: {
    sm: "0.25rem",   // 4px
    md: "0.375rem",  // 6px
    lg: "0.5rem",    // 8px
    xl: "0.75rem",   // 12px
  },
  
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  }
}
```

---

## Performance Optimization

### Component Lazy Loading

```typescript
// lib/components/lazy-loading.ts
import { lazy, Suspense } from "react"
import { LoadingCard } from "@/components/ui/loading-card"

// Lazy load heavy components
export const LazyCreatorDashboard = lazy(() => 
  import("@/components/dashboards/creator/creator-dashboard")
)

export const LazyOrderForm = lazy(() => 
  import("@/components/forms/order-form")
)

// Wrapper with loading state
export function LazyComponent({ 
  Component, 
  fallback = <LoadingCard /> 
}: {
  Component: React.ComponentType
  fallback?: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
}
```

### Image Optimization

```typescript
// components/ui/optimized-image.tsx
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("rounded-lg object-cover", className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

---

## Testing Strategy

### Component Testing

```typescript
// __tests__/components/content-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { ContentCard } from "@/components/marketplace/content-card"

const mockContent = {
  id: "1",
  title: "Math Worksheet",
  description: "Basic algebra problems",
  creator: "John Doe",
  subject: "Mathematics",
  gradeLevel: ["Grade 9", "Grade 10"],
  rating: 4.5,
  price: 2.99,
  downloadCount: 120,
  viewCount: 1500
}

describe("ContentCard", () => {
  it("renders content information correctly", () => {
    render(<ContentCard content={mockContent} />)
    
    expect(screen.getByText("Math Worksheet")).toBeInTheDocument()
    expect(screen.getByText("by John Doe")).toBeInTheDocument()
    expect(screen.getByText("$2.99")).toBeInTheDocument()
    expect(screen.getByText("4.5")).toBeInTheDocument()
  })

  it("calls onSelect when button is clicked", () => {
    const mockOnSelect = jest.fn()
    render(<ContentCard content={mockContent} onSelect={mockOnSelect} />)
    
    fireEvent.click(screen.getByText("Select for Printing"))
    expect(mockOnSelect).toHaveBeenCalledWith("1")
  })
})
```

---

## Conclusion

This comprehensive UI/UX architecture leverages shadcn/ui as the foundation while providing:

🎨 **Consistent Design System**
- Brand-aligned color palette and typography
- Role-specific styling for three user types
- Dark mode support with system preference detection

📱 **Mobile-First Responsive Design**
- Touch-optimized components for student demographic
- Progressive disclosure for complex workflows
- Thumb-friendly navigation patterns

♿ **Accessibility Excellence**
- WCAG AA compliance throughout
- Screen reader optimization
- Keyboard navigation support

🚀 **Performance Optimization**
- Lazy loading for heavy components
- Optimized images with Next.js Image
- Efficient component architecture

🧪 **Testing Foundation**
- Component testing with Jest and React Testing Library
- Accessibility testing integration
- Visual regression testing setup

This design system ensures consistent, accessible, and performant user experiences across all three sides of the marketplace while maintaining design consistency and scalability for future feature development.
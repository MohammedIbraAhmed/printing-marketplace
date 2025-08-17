# Printing Marketplace Platform - UX/UI Specifications

## Executive Summary

This document provides comprehensive UX/UI specifications for the three-sided printing marketplace platform, supporting the MVP goals outlined in the PRD. The specifications prioritize mobile-first design for the student demographic while ensuring efficient workflows for content creators and print shop owners.

### Key Design Goals
- **Same-day fulfillment enablement** through streamlined order workflows
- **Mobile-first student experience** optimized for discovery and ordering
- **Efficient multi-role management** with clear role-based interfaces
- **Trust and quality indicators** throughout user journeys
- **Responsive design** across all device types

### Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Components**: shadcn/ui component library for consistency
- **Accessibility**: WCAG AA compliance
- **Design System**: Mobile-first responsive breakpoints

---

## User Personas & Journey Maps

### Student/Customer Persona
**Primary User**: College students aged 18-25, mobile-first, price-conscious, need quick printing solutions

**Journey Flow**:
```
Landing → Browse/Search → Content Detail → Print Shop Selection → Order Config → Payment → Tracking
```

### Content Creator Persona
**Primary User**: Educators and content creators, desktop/mobile hybrid usage, revenue-focused

**Journey Flow**:
```
Dashboard → Upload Content → Set Metadata → Configure Pricing → Monitor Performance → Track Revenue
```

### Print Shop Owner Persona
**Primary User**: Small business owners, desktop primary with mobile monitoring, efficiency-focused

**Journey Flow**:
```
Dashboard → Order Queue → Order Details → Status Updates → Communication → Analytics
```

---

## Information Architecture

### Site Structure
```
/
├── / (Landing Page)
├── /browse (Content Discovery)
├── /content/[id] (Content Detail)
├── /shops (Print Shop Directory)
├── /shop/[id] (Shop Profile)
├── /order/configure (Order Configuration)
├── /checkout (Payment Flow)
├── /dashboard (Multi-role Dashboard)
├── /orders (Order Management)
├── /upload (Content Upload)
├── /analytics (Performance Analytics)
├── /profile (User Profile)
└── /admin (Platform Administration)
```

### Navigation Structure
- **Primary Navigation**: Role-based top navigation with user context
- **Secondary Navigation**: Contextual sidebar navigation for complex workflows
- **Mobile Navigation**: Collapsible drawer with touch-optimized menu items

---

## Priority Area 1: Mobile-First Student Journey

### 1.1 Landing Page Wireframe

```
┌─────────────────────────┐
│ [Logo] [Login] [Sign Up]│ <- Header (sticky)
├─────────────────────────┤
│                         │
│    HERO SECTION         │ <- Value proposition
│  "Print Educational     │
│   Materials Locally"    │
│  [Get Started CTA]      │
│                         │
├─────────────────────────┤
│  HOW IT WORKS          │ <- 3-step process
│  [📚] [🖨️] [📦]        │
├─────────────────────────┤
│  FEATURED CONTENT      │ <- Content carousel
│  [Card][Card][Card]    │
├─────────────────────────┤
│  LOCAL PRINT SHOPS     │ <- Shop directory preview
│  [Shop][Shop][Shop]    │
├─────────────────────────┤
│  FOOTER                │ <- Links and legal
└─────────────────────────┘
```

#### Component Specifications

**Header Component**
```typescript
// Header.tsx
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

// Mobile-first responsive header
// Tailwind: "sticky top-0 z-50 bg-white/95 backdrop-blur border-b"
```

**Hero Section Component**
```typescript
// HeroSection.tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Large hero with CTA button
// Tailwind: "py-16 px-4 text-center bg-gradient-to-b from-blue-50"
// CTA Button: variant="default" size="lg"
```

**Feature Cards Component**
```typescript
// FeatureCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// 3-column grid on desktop, stacked on mobile
// Tailwind: "grid grid-cols-1 md:grid-cols-3 gap-6"
```

### 1.2 Content Discovery Page Wireframe

```
┌─────────────────────────┐
│ [Search Bar with Filter]│ <- Search interface
├─────────────────────────┤
│ Active Filters: [X][X]  │ <- Filter chips
├─────────────────────────┤
│ Sort: [Newest] [Grid▼]  │ <- Sort and view options
├─────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │[img]│ │[img]│ │[img]│ │ <- Content grid
│ │Title│ │Title│ │Title│ │
│ │★★★★☆│ │★★★☆☆│ │★★★★★│ │
│ │$2.50│ │$1.75│ │$3.00│ │
│ └─────┘ └─────┘ └─────┘ │
├─────────────────────────┤
│ [Load More] or [Pagination] │
└─────────────────────────┘
```

#### Component Specifications

**Search Interface**
```typescript
// SearchInterface.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

// Advanced filtering with price range, subject, grade level
// Search input with autocomplete suggestions
```

**Content Grid Component**
```typescript
// ContentGrid.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Responsive grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
// Cards with hover effects and quick action buttons
```

**Filter Panel**
```typescript
// FilterPanel.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

// Mobile: Full-screen sheet, Desktop: Sidebar
// Price range slider, category checkboxes, grade level select
```

### 1.3 Content Detail Page Wireframe

```
┌─────────────────────────┐
│ [← Back] [Share] [♡]    │ <- Navigation and actions
├─────────────────────────┤
│ ┌─────────────┐ Content │
│ │   Preview   │ Title   │ <- Preview and title
│ │   Image     │ by Creator│
│ │             │ ★★★★☆   │
│ └─────────────┘ (4.2/5) │
├─────────────────────────┤
│ Description text here   │ <- Content description
│ Subject: Mathematics    │
│ Grade Level: 10-12      │
│ Pages: 25              │
├─────────────────────────┤
│ Print Options:          │ <- Print configuration
│ ○ B&W ($2.50)          │
│ ● Color ($4.50)        │
│ Binding: [Stapled ▼]   │
│ Quantity: [- 1 +]      │
├─────────────────────────┤
│ [Select Print Shop]     │ <- Shop selection CTA
└─────────────────────────┘
```

#### Component Specifications

**Content Preview Component**
```typescript
// ContentPreview.tsx
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

// Large preview image with thumbnail carousel
// Full-screen preview on tap (mobile)
```

**Print Options Form**
```typescript
// PrintOptionsForm.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Real-time price calculation based on options
// Quantity selector with + / - buttons
```

**Creator Info Card**
```typescript
// CreatorInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Creator profile with rating and verification badges
// Link to creator's other content
```

### 1.4 Print Shop Selection Wireframe

```
┌─────────────────────────┐
│ Find Print Shops Near You│ <- Page title
├─────────────────────────┤
│ [📍] Your Location      │ <- Location selector
│ [Map/List Toggle]       │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ PrintShop A         │ │ <- Shop card
│ │ ★★★★☆ (4.2) • 0.8mi│ │
│ │ Color: $4.50        │ │
│ │ Ready in: 2-3 hours │ │
│ │ [Select Shop]       │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ PrintShop B         │ │
│ │ ★★★★★ (4.8) • 1.2mi│ │
│ │ Color: $4.25        │ │
│ │ Ready in: 1-2 hours │ │
│ │ [Select Shop]       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Component Specifications

**Shop Selection List**
```typescript
// ShopSelectionList.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Star } from "lucide-react"

// Distance-sorted list with filtering options
// Real-time availability and pricing
```

**Location Selector**
```typescript
// LocationSelector.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// GPS location or manual address entry
// Google Maps integration for location services
```

**Map View Component**
```typescript
// MapView.tsx
import { Card } from "@/components/ui/card"

// Interactive map with shop markers
// Toggle between map and list view
// Shop details popup on marker click
```

### 1.5 Order Tracking Dashboard Wireframe

```
┌─────────────────────────┐
│ My Orders               │ <- Page title
├─────────────────────────┤
│ [Active] [Completed]    │ <- Order status tabs
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Order #1234         │ │ <- Active order card
│ │ Math Workbook       │ │
│ │ PrintShop A         │ │
│ │ ●●●○○ In Progress   │ │
│ │ Ready: ~2 hours     │ │
│ │ [Contact Shop]      │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Order #1233         │ │ <- Completed order
│ │ Science Notes       │ │
│ │ PrintShop B         │ │
│ │ ✓ Completed         │ │
│ │ [Reorder] [Review]  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Component Specifications

**Order Status Card**
```typescript
// OrderStatusCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Order progress visualization
// Real-time status updates
// Quick action buttons
```

**Order Timeline**
```typescript
// OrderTimeline.tsx
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Visual timeline showing order progress
// Estimated completion times
// Status change notifications
```

---

## Priority Area 2: Print Shop Management Workflows

### 2.1 Print Shop Dashboard Wireframe

```
┌─────────────────────────┐
│ PrintShop Dashboard     │ <- Page title with shop name
├─────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 8   │ │ 3   │ │ 12  │ │ <- Key metrics cards
│ │Queue│ │Today│ │Week │ │
│ └─────┘ └─────┘ └─────┘ │
├─────────────────────────┤
│ Incoming Orders         │ <- Order queue section
│ [New] [Accepted] [All]  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [●] Order #1234     │ │ <- Order item with priority
│ │     Math Workbook   │ │
│ │     Color, 2 copies │ │
│ │     Due: 3:00 PM    │ │
│ │     [Accept][View]  │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [○] Order #1235     │ │ <- Another order item
│ │     Science Guide   │ │
│ │     B&W, 1 copy     │ │
│ │     Due: 5:00 PM    │ │
│ │     [Accept][View]  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Component Specifications

**Metrics Cards**
```typescript
// MetricsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, DollarSign } from "lucide-react"

// Real-time business metrics
// Visual indicators for trends
// Quick access to detailed analytics
```

**Order Queue Component**
```typescript
// OrderQueue.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Filterable order list with priority indicators
// Bulk actions for order management
// Real-time updates for new orders
```

**Quick Actions Toolbar**
```typescript
// QuickActionsToolbar.tsx
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Bulk order actions (accept multiple, update status)
// Quick filters (urgent, high-value, repeat customers)
// Notification settings toggle
```

### 2.2 Order Detail Management Wireframe

```
┌─────────────────────────┐
│ [← Back] Order #1234    │ <- Navigation and order ID
├─────────────────────────┤
│ Customer: John Smith    │ <- Customer information
│ Phone: (555) 123-4567   │
│ Email: john@email.com   │
├─────────────────────────┤
│ Content: Math Workbook  │ <- Order details
│ Pages: 25               │
│ Print: Color, Stapled   │
│ Quantity: 2 copies      │
│ Due: Today 3:00 PM      │
├─────────────────────────┤
│ Status: [Accepted ▼]    │ <- Status management
│ ○ Submitted             │
│ ● Accepted              │
│ ○ In Progress           │
│ ○ Ready                 │
│ ○ Completed             │
├─────────────────────────┤
│ [📁 View Files]         │ <- File access
│ [💬 Message Customer]   │ <- Communication
│ [📸 Add Photos]         │ <- Quality assurance
├─────────────────────────┤
│ [Update Status]         │ <- Primary action
└─────────────────────────┘
```

#### Component Specifications

**Order Detail Card**
```typescript
// OrderDetailCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Comprehensive order information display
// Customer contact information
// File preview and download
```

**Status Management**
```typescript
// StatusManagement.tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Visual status progression
// Estimated completion time updates
// Automatic customer notifications
```

**Customer Communication**
```typescript
// CustomerCommunication.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// Direct messaging interface
// Pre-written message templates
// Photo attachments for quality confirmation
```

---

## Priority Area 3: Content Creator Upload Experience

### 3.1 Content Upload Interface Wireframe

```
┌─────────────────────────┐
│ Upload New Content      │ <- Page title
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │     Drag & Drop     │ │ <- File upload area
│ │     Files Here      │ │
│ │   or [Browse Files] │ │
│ │                     │ │
│ │ Supported: PDF, DOC,│ │
│ │ DOCX, Images        │ │
│ │ Max size: 50MB      │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [📄] math-guide.pdf │ │ <- Uploaded file
│ │ [●●●●○] 80% uploaded│ │
│ │ 2.5MB / 3.1MB       │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ [Continue to Details]   │ <- Next step button
└─────────────────────────┘
```

#### Component Specifications

**File Upload Component**
```typescript
// FileUploadComponent.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"

// Drag and drop interface with visual feedback
// File validation and error handling
// Upload progress visualization
```

**Upload Progress Tracker**
```typescript
// UploadProgressTracker.tsx
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Individual file progress tracking
// Error state handling
// Retry mechanism for failed uploads
```

### 3.2 Content Metadata Form Wireframe

```
┌─────────────────────────┐
│ Content Details         │ <- Form title
├─────────────────────────┤
│ Title*                  │
│ [_________________]     │ <- Required title field
├─────────────────────────┤
│ Description*            │
│ [_________________ ]    │ <- Description textarea
│ [              ___]     │
├─────────────────────────┤
│ Subject*                │
│ [Mathematics    ▼]      │ <- Subject dropdown
├─────────────────────────┤
│ Grade Level*            │
│ [9-12           ▼]      │ <- Grade level select
├─────────────────────────┤
│ Tags (comma separated)  │
│ [algebra, worksheets]   │ <- Tags input
├─────────────────────────┤
│ Curriculum Alignment    │
│ [Common Core    ▼]      │ <- Optional curriculum
├─────────────────────────┤
│ [< Back] [Continue >]   │ <- Navigation buttons
└─────────────────────────┘
```

#### Component Specifications

**Metadata Form**
```typescript
// MetadataForm.tsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Multi-step form with validation
// Auto-save draft functionality
// Curriculum standards integration
```

**Tag Input Component**
```typescript
// TagInput.tsx
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

// Dynamic tag creation and removal
// Tag suggestions based on existing content
// Category-based tag organization
```

### 3.3 Pricing Configuration Wireframe

```
┌─────────────────────────┐
│ Set Pricing             │ <- Pricing configuration
├─────────────────────────┤
│ Base Price per Page     │
│ $[0.10] USD             │ <- Base pricing input
├─────────────────────────┤
│ Print Markups:          │
│ ├ B&W Printing          │
│ │ + $[0.05] per page    │ <- Print option markups
│ ├ Color Printing        │
│ │ + $[0.15] per page    │
│ ├ Binding Options       │
│ │ + $[0.50] per book    │
│ └ Premium Paper         │
│   + $[0.10] per page    │
├─────────────────────────┤
│ Revenue Split Preview:  │
│ ├ Your Earnings: 65%    │ <- Revenue breakdown
│ ├ Print Shop: 20%       │
│ └ Platform Fee: 15%     │
├─────────────────────────┤
│ [Save Draft] [Publish]  │ <- Action buttons
└─────────────────────────┘
```

#### Component Specifications

**Pricing Configuration**
```typescript
// PricingConfiguration.tsx
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

// Real-time pricing calculations
// Revenue split visualization
// Competitive pricing suggestions
```

**Revenue Split Visualization**
```typescript
// RevenueSplitVisualization.tsx
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Visual breakdown of revenue distribution
// Dynamic calculations based on pricing
// Comparison with market averages
```

### 3.4 Creator Analytics Dashboard Wireframe

```
┌─────────────────────────┐
│ Creator Analytics       │ <- Dashboard title
├─────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │$45  │ │ 23  │ │4.7★ │ │ <- Key metrics
│ │Week │ │Sales│ │Avg  │ │
│ └─────┘ └─────┘ └─────┘ │
├─────────────────────────┤
│ Top Performing Content  │
│ ┌─────────────────────┐ │
│ │ Math Workbook       │ │ <- Performance list
│ │ 15 sales • $22.50   │ │
│ │ ★★★★☆               │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Science Guide       │ │
│ │ 8 sales • $18.00    │ │
│ │ ★★★★★               │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ [View All Content]      │ <- View all link
│ [Download Report]       │ <- Export functionality
└─────────────────────────┘
```

#### Component Specifications

**Analytics Overview**
```typescript
// AnalyticsOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Star, DollarSign } from "lucide-react"

// Key performance indicators
// Trend visualization
// Comparative performance metrics
```

**Performance Table**
```typescript
// PerformanceTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Sortable content performance data
// Quick action buttons for optimization
// Export capabilities for detailed analysis
```

---

## Responsive Design Guidelines

### Breakpoint System
```css
/* Mobile First Approach */
/* Base styles: 320px+ (mobile) */
.container {
  @apply px-4 mx-auto;
}

/* Small devices: 640px+ (large mobile) */
@media (min-width: 640px) {
  .container {
    @apply px-6;
  }
}

/* Medium devices: 768px+ (tablet) */
@media (min-width: 768px) {
  .container {
    @apply px-8 max-w-6xl;
  }
}

/* Large devices: 1024px+ (desktop) */
@media (min-width: 1024px) {
  .container {
    @apply px-12;
  }
}
```

### Navigation Patterns

**Mobile Navigation (< 768px)**
```typescript
// MobileNavigation.tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

// Hamburger menu with slide-out drawer
// Full-screen navigation overlay
// Touch-optimized menu items
```

**Desktop Navigation (>= 768px)**
```typescript
// DesktopNavigation.tsx
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"

// Horizontal navigation bar
// Dropdown menus for complex sections
// Breadcrumb navigation for deep pages
```

### Component Responsive Behavior

**Card Layouts**
```typescript
// Responsive grid patterns
// Mobile: 1 column
// Tablet: 2 columns  
// Desktop: 3-4 columns

const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```

**Form Layouts**
```typescript
// Mobile: Stacked form fields
// Desktop: Multi-column forms where appropriate

const formClasses = "grid grid-cols-1 lg:grid-cols-2 gap-4"
```

---

## Accessibility Guidelines (WCAG AA)

### Color and Contrast
- **Primary colors**: Ensure 4.5:1 contrast ratio minimum
- **Interactive elements**: 3:1 contrast ratio minimum
- **Focus indicators**: High-contrast focus rings on all interactive elements

### Keyboard Navigation
```typescript
// Focus management for complex components
import { useFocusRing } from "@react-aria/focus"

// All interactive elements must be keyboard accessible
// Modal dialogs trap focus appropriately
// Skip navigation links for screen readers
```

### Screen Reader Support
```typescript
// Semantic HTML with appropriate ARIA labels
<button aria-label="Add item to cart" aria-describedby="price-info">
  Add to Cart
</button>

// Status updates announced to screen readers
<div role="status" aria-live="polite">
  Order status updated to "In Progress"
</div>
```

### Touch Targets
- **Minimum size**: 44px x 44px for touch targets
- **Spacing**: 8px minimum between adjacent touch targets
- **Touch feedback**: Visual feedback for all touch interactions

---

## Component Implementation Examples

### 1. Search Interface Component

```typescript
// components/SearchInterface.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Search, Filter } from "lucide-react"

interface SearchInterfaceProps {
  onSearch: (query: string, filters: SearchFilters) => void
  className?: string
}

interface SearchFilters {
  subjects: string[]
  gradeLevels: string[]
  priceRange: [number, number]
}

export function SearchInterface({ onSearch, className }: SearchInterfaceProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    subjects: [],
    gradeLevels: [],
    priceRange: [0, 50]
  })

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search educational content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            {/* Filter content */}
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        onClick={() => onSearch(query, filters)}
        className="w-full md:w-auto"
      >
        Search
      </Button>
    </div>
  )
}
```

### 2. Order Status Card Component

```typescript
// components/OrderStatusCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, MessageCircle } from "lucide-react"

interface OrderStatusCardProps {
  order: {
    id: string
    title: string
    shopName: string
    status: "submitted" | "accepted" | "in_progress" | "ready" | "completed"
    estimatedCompletion?: string
    totalPrice: number
  }
  onContact: (orderId: string) => void
  onReorder?: (orderId: string) => void
}

const statusConfig = {
  submitted: { label: "Submitted", progress: 20, color: "blue" },
  accepted: { label: "Accepted", progress: 40, color: "blue" },
  in_progress: { label: "In Progress", progress: 60, color: "yellow" },
  ready: { label: "Ready for Pickup", progress: 80, color: "green" },
  completed: { label: "Completed", progress: 100, color: "green" }
}

export function OrderStatusCard({ order, onContact, onReorder }: OrderStatusCardProps) {
  const config = statusConfig[order.status]
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.title}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {order.shopName}
            </p>
          </div>
          <Badge variant={config.color === "green" ? "default" : "secondary"}>
            Order #{order.id}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{config.label}</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>
        
        {order.estimatedCompletion && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Ready in: {order.estimatedCompletion}
          </p>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onContact(order.id)}
            className="flex-1"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Contact Shop
          </Button>
          
          {order.status === "completed" && onReorder && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onReorder(order.id)}
              className="flex-1"
            >
              Reorder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. File Upload Component

```typescript
// components/FileUploadComponent.tsx
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void
  maxFileSize?: number
  acceptedFileTypes?: string[]
  className?: string
}

interface UploadFile extends File {
  id: string
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
}

export function FileUploadComponent({ 
  onFilesUploaded, 
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  className 
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "uploading" as const
    }))
    
    setUploadFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id)
    })
    
    onFilesUploaded(acceptedFiles)
  }, [onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
  })

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = file.progress + 10
          if (newProgress >= 100) {
            clearInterval(interval)
            return { ...file, progress: 100, status: "completed" }
          }
          return { ...file, progress: newProgress }
        }
        return file
      }))
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </h3>
            <p className="text-gray-500 mb-4">
              or{" "}
              <Button variant="link" className="p-0 h-auto font-medium">
                browse files
              </Button>
            </p>
            <p className="text-sm text-gray-400">
              Supported: PDF, DOC, DOCX, Images • Max size: 50MB
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploading Files</h4>
          {uploadFiles.map(file => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={file.progress} className="flex-1 h-1" />
                      <span className="text-xs text-gray-500">
                        {file.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "completed" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Technical Implementation Notes

### State Management
- Use React Context for global state (user auth, cart, preferences)
- Local component state for UI interactions
- Server state management with TanStack Query for API calls

### Performance Optimization
- Implement lazy loading for content images
- Use Next.js Image component for automatic optimization
- Implement virtual scrolling for large lists
- Code splitting at route level

### Error Handling
- Global error boundary for unhandled errors
- Form validation with react-hook-form
- Network error handling with retry logic
- Graceful degradation for offline scenarios

### Testing Strategy
- Unit tests for utility functions and hooks
- Component tests with React Testing Library
- Integration tests for complete user flows
- E2E tests with Playwright for critical paths

---

## Next Steps for Implementation

1. **Setup Phase**
   - Initialize Next.js project with TypeScript
   - Configure shadcn/ui and Tailwind CSS
   - Set up development environment

2. **Foundation Phase**
   - Implement responsive layout components
   - Create authentication system
   - Build navigation components

3. **Feature Development**
   - Student journey components (Priority 1)
   - Print shop management (Priority 2)  
   - Content creator tools (Priority 3)

4. **Integration Phase**
   - API integration
   - Payment system integration
   - Real-time features implementation

5. **Testing & Optimization**
   - Comprehensive testing
   - Performance optimization
   - Accessibility compliance verification

This specification provides a complete foundation for implementing the printing marketplace platform with a mobile-first, accessible, and user-centered design approach.
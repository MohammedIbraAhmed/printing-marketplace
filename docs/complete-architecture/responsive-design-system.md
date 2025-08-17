# Responsive Design System

## Breakpoint Strategy
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

## Touch-Optimized Components
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

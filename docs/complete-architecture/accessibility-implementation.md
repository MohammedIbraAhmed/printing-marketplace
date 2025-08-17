# Accessibility Implementation

## WCAG AA Compliance
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

## Screen Reader Optimization
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

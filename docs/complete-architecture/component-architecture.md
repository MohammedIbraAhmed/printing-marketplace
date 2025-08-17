# Component Architecture

## Base Component Library Structure
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

## Custom Component Extensions
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

## Order Status Component
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

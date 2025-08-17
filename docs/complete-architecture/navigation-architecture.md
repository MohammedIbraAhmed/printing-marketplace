# Navigation Architecture

## Role-Based Navigation System
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

## Mobile Navigation
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

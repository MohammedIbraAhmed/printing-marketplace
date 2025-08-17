# Performance & Monitoring

## Performance Optimization
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', '@/lib']
  },
  images: {
    domains: [process.env.R2_CUSTOM_DOMAIN],
    formats: ['image/webp', 'image/avif']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
```

## Health Check API
```typescript
// /api/monitoring/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    // Database connectivity
    mongoose.connection.readyState === 1,
    
    // R2 connectivity
    r2Client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME })),
    
    // SMTP2GO connectivity
    fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY! }
    })
  ])

  const health = {
    status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: checks[0].status === 'fulfilled',
      storage: checks[1].status === 'fulfilled',
      email: checks[2].status === 'fulfilled'
    }
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  })
}
```

## Component Lazy Loading
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

---

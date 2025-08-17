# Security Architecture

## Input Validation with Zod
```typescript
// lib/validations/orders.ts
import { z } from 'zod'

export const OrderCreateSchema = z.object({
  items: z.array(z.object({
    contentId: z.string().optional(),
    fileUrl: z.string().url(),
    fileName: z.string().min(1),
    specifications: z.object({
      quantity: z.number().min(1).max(1000),
      colorOption: z.enum(['bw', 'color']),
      paperSize: z.enum(['A4', 'A3', 'Letter', 'Legal']),
      binding: z.enum(['none', 'staple', 'spiral', 'perfect']).optional(),
      customInstructions: z.string().max(500).optional()
    }),
    pricing: z.object({
      contentCost: z.number().min(0),
      printingCost: z.number().min(0),
      total: z.number().min(0)
    })
  })).min(1),
  printShopId: z.string(),
  delivery: z.object({
    method: z.enum(['pickup', 'delivery']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      postalCode: z.string(),
      country: z.string()
    }).optional(),
    instructions: z.string().max(200).optional()
  })
})
```

## Rate Limiting
```typescript
// lib/security/rate-limiting.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true
})

// API route protection
export async function withRateLimit(
  request: NextRequest,
  handler: Function
) {
  const identifier = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    )
  }
  
  return handler()
}
```

---

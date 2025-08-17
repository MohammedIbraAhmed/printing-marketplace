# API Architecture

## Core API Routes Structure
```
/api/
├── auth/           # NextAuth.js endpoints
├── users/          # User management
│   ├── profile     # GET, PUT /api/users/profile
│   ├── [id]        # GET /api/users/[id]
│   └── verification # POST /api/users/verification
├── content/        # Content management
│   ├── upload      # POST /api/content/upload
│   ├── [id]        # GET, PUT, DELETE /api/content/[id]
│   ├── search      # GET /api/content/search
│   └── moderate    # PUT /api/content/moderate (admin only)
├── orders/         # Order management
│   ├── create      # POST /api/orders/create
│   ├── [id]        # GET, PUT /api/orders/[id]
│   ├── status      # PUT /api/orders/[id]/status
│   └── history     # GET /api/orders/history
├── payments/       # Payment processing
│   ├── intent      # POST /api/payments/intent
│   ├── confirm     # POST /api/payments/confirm
│   ├── webhooks    # POST /api/payments/webhooks
│   └── payouts     # GET, POST /api/payments/payouts
├── shops/          # Print shop management
│   ├── directory   # GET /api/shops/directory
│   ├── [id]        # GET /api/shops/[id]
│   ├── capacity    # GET, PUT /api/shops/[id]/capacity
│   └── onboard     # POST /api/shops/onboard
├── admin/          # Administrative functions
│   ├── analytics   # GET /api/admin/analytics
│   ├── users       # GET /api/admin/users
│   └── moderation  # GET, PUT /api/admin/moderation
└── monitoring/     # Health and monitoring
    ├── health      # GET /api/monitoring/health
    └── metrics     # GET /api/monitoring/metrics
```

## Sample API Route Implementation
```typescript
// /api/orders/create/route.ts
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/services/orders"
import { OrderCreateSchema } from "@/lib/validations/orders"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = OrderCreateSchema.parse(body)
    
    const order = await createOrder({
      ...validatedData,
      customerId: session.user.id
    })

    return NextResponse.json({ order }, { status: 201 })
    
  } catch (error) {
    console.error("Order creation failed:", error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

---

# Testing Strategy

## API Route Testing
```typescript
// __tests__/api/orders.test.ts
import { POST } from '@/app/api/orders/create/route'
import { auth } from '@/auth'

jest.mock('@/auth')
const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('/api/orders/create', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-123', role: 'customer' }
    } as any)
  })

  it('creates order successfully', async () => {
    const request = new Request('http://localhost:3000/api/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        items: [{
          fileUrl: 'https://example.com/file.pdf',
          fileName: 'document.pdf',
          specifications: {
            quantity: 10,
            colorOption: 'bw',
            paperSize: 'A4'
          },
          pricing: {
            contentCost: 0,
            printingCost: 5.00,
            total: 5.00
          }
        }],
        printShopId: 'shop-123',
        delivery: {
          method: 'pickup'
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.order).toBeDefined()
  })
})
```

## Component Testing
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

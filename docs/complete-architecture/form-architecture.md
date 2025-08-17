# Form Architecture

## Multi-Step Form Components
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

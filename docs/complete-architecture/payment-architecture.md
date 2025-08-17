# Payment Architecture

## Stripe Connect Implementation
```typescript
// lib/payments/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function createConnectedAccount(
  email: string,
  businessType: 'individual' | 'company',
  country: string = 'US'
) {
  return await stripe.accounts.create({
    type: 'express',
    email,
    business_type: businessType,
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  })
}

export async function createPaymentIntentWithSplit(
  amount: number,
  currency: string,
  customerId: string,
  transfers: {
    destination: string // Connected account ID
    amount: number      // Amount to transfer (excluding platform fee)
  }[]
) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method_types: ['card'],
    transfer_group: `order_${Date.now()}`,
    application_fee_amount: amount - transfers.reduce((sum, t) => sum + t.amount, 0),
    metadata: {
      orderType: 'printing'
    }
  })
}

export async function createTransfer(
  amount: number,
  currency: string,
  destination: string,
  sourceTransaction: string
) {
  return await stripe.transfers.create({
    amount,
    currency,
    destination,
    source_transaction: sourceTransaction
  })
}
```

## Revenue Splitting Logic
```typescript
// lib/services/payment-splitting.ts
interface OrderPayment {
  totalAmount: number
  contentCreatorId?: string
  printShopId: string
  platformFeePercentage: number // 15-20%
}

export function calculateRevenueSplit(payment: OrderPayment) {
  const { totalAmount, platformFeePercentage } = payment
  
  const platformFee = Math.round(totalAmount * (platformFeePercentage / 100))
  const remainingAmount = totalAmount - platformFee
  
  // Split remaining between creator and print shop
  const creatorFee = payment.contentCreatorId 
    ? Math.round(remainingAmount * 0.3) // 30% to creator
    : 0
  
  const printShopFee = remainingAmount - creatorFee
  
  return {
    platformFee,
    creatorFee,
    printShopFee,
    transfers: [
      ...(payment.contentCreatorId ? [{
        destination: payment.contentCreatorId,
        amount: creatorFee
      }] : []),
      {
        destination: payment.printShopId,
        amount: printShopFee
      }
    ]
  }
}
```

---

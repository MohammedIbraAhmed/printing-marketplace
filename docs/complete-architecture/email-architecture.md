# Email Architecture

## SMTP2GO Integration
```typescript
// lib/email/smtp2go.ts
interface EmailTemplate {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  customHeaders?: Record<string, string>
}

export async function sendEmail(template: EmailTemplate) {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY!
    },
    body: JSON.stringify({
      api_key: process.env.SMTP2GO_API_KEY,
      to: [template.to],
      sender: process.env.FROM_EMAIL,
      subject: template.subject,
      html_body: template.htmlBody,
      text_body: template.textBody,
      custom_headers: template.customHeaders
    })
  })

  if (!response.ok) {
    throw new Error(`Email sending failed: ${response.statusText}`)
  }

  return await response.json()
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (order: Order) => ({
    subject: `Order Confirmation - ${order.orderNumber}`,
    htmlBody: `
      <h1>Order Confirmed</h1>
      <p>Your order ${order.orderNumber} has been confirmed.</p>
      <p>Estimated completion: ${order.printShop.estimatedCompletion}</p>
    `,
    textBody: `Order ${order.orderNumber} confirmed. Estimated completion: ${order.printShop.estimatedCompletion}`
  }),

  orderStatusUpdate: (order: Order, newStatus: string) => ({
    subject: `Order Update - ${order.orderNumber}`,
    htmlBody: `
      <h1>Order Status Update</h1>
      <p>Your order ${order.orderNumber} is now: ${newStatus}</p>
    `,
    textBody: `Order ${order.orderNumber} status: ${newStatus}`
  })
}
```

---

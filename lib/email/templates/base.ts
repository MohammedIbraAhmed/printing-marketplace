// Base email template utilities and types

export interface EmailTemplateData {
  // Common data available to all templates
  recipient: {
    name?: string
    email: string
  }
  sender: {
    name: string
    email: string
  }
  // Additional template-specific data
  [key: string]: any
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Color palette for email templates
export const EmailColors = {
  primary: '#2563eb', // Blue
  primaryDark: '#1d4ed8',
  secondary: '#64748b', // Slate
  success: '#16a34a', // Green
  warning: '#d97706', // Orange
  danger: '#dc2626', // Red
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
  }
}

// Base CSS styles for email templates
export const getBaseEmailStyles = () => `
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${EmailColors.text.primary};
      background-color: ${EmailColors.surface};
      margin: 0;
      padding: 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${EmailColors.background};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .email-header {
      background-color: ${EmailColors.primary};
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    
    .email-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    
    .email-body {
      padding: 32px 24px;
    }
    
    .email-footer {
      background-color: ${EmailColors.surface};
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: ${EmailColors.text.secondary};
      border-top: 1px solid ${EmailColors.border};
    }
    
    h1, h2, h3 {
      margin: 0 0 16px 0;
      font-weight: 600;
    }
    
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 18px; }
    
    p {
      margin: 0 0 16px 0;
      line-height: 1.6;
    }
    
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${EmailColors.primary};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
      text-align: center;
    }
    
    .button:hover {
      background-color: ${EmailColors.primaryDark};
    }
    
    .button-secondary {
      background-color: ${EmailColors.secondary};
    }
    
    .button-success {
      background-color: ${EmailColors.success};
    }
    
    .button-warning {
      background-color: ${EmailColors.warning};
    }
    
    .button-danger {
      background-color: ${EmailColors.danger};
    }
    
    .alert {
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
    }
    
    .alert-info {
      background-color: #dbeafe;
      border: 1px solid #93c5fd;
      color: #1e40af;
    }
    
    .alert-success {
      background-color: #dcfce7;
      border: 1px solid #86efac;
      color: #166534;
    }
    
    .alert-warning {
      background-color: #fef3c7;
      border: 1px solid #fcd34d;
      color: #92400e;
    }
    
    .alert-danger {
      background-color: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }
    
    .divider {
      height: 1px;
      background-color: ${EmailColors.border};
      margin: 24px 0;
    }
    
    .text-center { text-align: center; }
    .text-small { font-size: 14px; }
    .text-muted { color: ${EmailColors.text.muted}; }
    
    /* Mobile responsive */
    @media only screen and (max-width: 640px) {
      .email-container {
        margin: 0;
        box-shadow: none;
      }
      
      .email-header,
      .email-body,
      .email-footer {
        padding: 24px 16px;
      }
      
      .button {
        display: block;
        width: 100%;
      }
    }
  </style>
`

// Generate base email template structure
export const generateBaseTemplate = (data: EmailTemplateData, content: string) => {
  const currentYear = new Date().getFullYear()
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PrintMarket</title>
  ${getBaseEmailStyles()}
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>PrintMarket</h1>
    </div>
    
    <!-- Body Content -->
    <div class="email-body">
      ${content}
    </div>
    
    <!-- Footer -->
    <div class="email-footer">
      <p class="text-small">
        <strong>PrintMarket</strong><br>
        Connecting content creators with quality print shops
      </p>
      <div class="divider"></div>
      <p class="text-small text-muted">
        © ${currentYear} PrintMarket. All rights reserved.<br>
        This email was sent to ${data.recipient.email}
      </p>
      <p class="text-small">
        <a href="{{unsubscribe_url}}" style="color: ${EmailColors.text.muted};">Unsubscribe</a> | 
        <a href="{{preferences_url}}" style="color: ${EmailColors.text.muted};">Email Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Generate plain text version from HTML content
export const generateTextVersion = (htmlContent: string): string => {
  // Simple HTML to text conversion
  return htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Template compilation function
export const compileTemplate = (
  templateContent: string,
  data: EmailTemplateData
): string => {
  let compiled = templateContent
  
  // Replace template variables with actual data
  const replaceVariable = (key: string, value: any) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    compiled = compiled.replace(regex, String(value || ''))
  }

  // Replace nested object properties
  const replaceNestedVariables = (obj: any, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        replaceNestedVariables(value, fullKey)
      } else {
        replaceVariable(fullKey, value)
      }
    }
  }

  replaceNestedVariables(data)
  
  return compiled
}

// Utility function to create email template
export const createEmailTemplate = (
  content: string,
  subject: string,
  data: EmailTemplateData
): EmailTemplate => {
  const compiledContent = compileTemplate(content, data)
  const html = generateBaseTemplate(data, compiledContent)
  const text = generateTextVersion(compiledContent)
  const compiledSubject = compileTemplate(subject, data)
  
  return {
    subject: compiledSubject,
    html: compileTemplate(html, data),
    text: compileTemplate(text, data),
  }
}
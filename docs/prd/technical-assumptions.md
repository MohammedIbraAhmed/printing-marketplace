# Technical Assumptions

## Repository Structure: Monorepo

**Decision**: Single Next.js application with clear component/page/api separation  
**Rationale**: Next.js App Router provides excellent organization for full-stack applications. Single repository simplifies deployment and development workflow while maintaining clear separation between frontend components, API routes, and database models.

## Service Architecture

**Decision**: Next.js Full-Stack Application with API Routes and MongoDB microservices pattern  
**Rationale**: Next.js API routes provide serverless-ready backend functionality perfect for MVP development speed. MongoDB's document structure naturally fits the multi-role user system and flexible content metadata requirements. Serverless architecture scales automatically and reduces operational complexity.

**Core API Route Structure**:
- `/api/auth/*` - NextAuth.js authentication endpoints
- `/api/users/*` - User management and profile operations
- `/api/content/*` - Content upload, management, and discovery
- `/api/orders/*` - Order creation, tracking, and fulfillment
- `/api/payments/*` - Payment processing and revenue splitting
- `/api/admin/*` - Platform administration and analytics
- `/api/monitoring/*` - Health checks and performance metrics
- `/api/support/*` - Customer support and dispute resolution

## Testing Requirements

**Decision**: Unit + Integration testing with Playwright for E2E and Jest for API routes  
**Rationale**: Next.js ecosystem provides excellent testing tools. Critical payment flows and multi-user interactions require comprehensive testing. Playwright handles the complex multi-role user journeys while Jest covers API route business logic.

## Additional Technical Assumptions and Requests

**Frontend Technology Stack**:
- Next.js 14+ with App Router for modern React development and automatic optimization
- shadcn/ui components with Tailwind CSS for rapid, accessible UI development
- TypeScript throughout for type safety across complex multi-role interfaces
- React Hook Form for complex multi-step order workflows with client-side validation

**Backend Technology Stack**:
- Next.js API Routes for serverless backend functionality
- MongoDB Atlas with Mongoose ODM for flexible document-based data modeling
- NextAuth.js v5 for authentication supporting multiple providers and role-based access
- Cloudflare R2 for cost-effective, global file storage and CDN delivery

**Infrastructure & Deployment**:
- Vercel for seamless Next.js deployment with automatic scaling
- MongoDB Atlas for managed database with automatic backups and scaling
- Cloudflare R2 integrated with Cloudflare CDN for global content delivery
- GitHub Actions for CI/CD pipeline and automated testing

**Third-Party Integrations**:
- Stripe Connect for marketplace payment processing (unchanged - best solution for multi-party payments)
- Cloudflare R2 for secure file storage with global CDN distribution
- SMTP2GO for reliable transactional email delivery
- NextAuth providers for OAuth (Google, GitHub) plus email/password authentication

**Security & Compliance**:
- NextAuth.js built-in security features (CSRF, session management, OAuth flows)
- MongoDB field-level encryption for sensitive data
- Cloudflare security features (DDoS protection, Web Application Firewall)
- File upload validation and virus scanning through Cloudflare Workers
- Role-based access control with granular permissions system
- Input validation using Zod schemas across all API endpoints
- Security headers and Content Security Policy (CSP) configuration
- Comprehensive audit logging for all user actions

**Scalability Considerations**:
- Vercel's automatic scaling and edge network optimization
- MongoDB Atlas auto-scaling and global clusters for multi-country expansion
- Cloudflare R2's global distribution for fast file access
- Next.js API routes scale automatically with serverless architecture

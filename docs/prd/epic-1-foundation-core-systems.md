# Epic 1: Foundation & Core Systems

**Expanded Goal:** Establish complete technical foundation including database schema, authentication, file storage, and notification systems that enable all future marketplace functionality. This epic delivers a production-ready responsive platform with multi-role user management and all core infrastructure components operational.

## Story 1.1: Project Infrastructure & Database Setup

As a **developer**,  
I want **complete project setup with database schema and CI/CD pipeline**,  
so that **all future development can build on solid foundations**.

### Acceptance Criteria

1. **Next.js Project Setup**: Monorepo structure with TypeScript, shadcn/ui, and Tailwind CSS configured
2. **MongoDB Atlas Integration**: Database connection with Mongoose ODM and environment configuration
3. **Core Database Schema**: User, PrintShop, Content, Order, and Payment collection schemas defined and deployed
4. **Development Environment**: Local setup with hot reload, environment variables, and development database
5. **CI/CD Pipeline**: GitHub Actions for automated testing, linting, and Vercel deployment
6. **Code Quality Tools**: ESLint, Prettier, TypeScript, and pre-commit hooks configured
7. **Health Check API**: `/api/health` endpoint for monitoring database connectivity and service status

## Story 1.2: Authentication & File Storage Systems

As a **platform user**,  
I want **secure authentication and file upload capabilities**,  
so that **I can safely access the platform and upload content**.

### Acceptance Criteria

1. **NextAuth.js v5 Setup**: Authentication with email/password and OAuth providers (Google, GitHub)
2. **Role-Based Authentication**: User roles (customer, creator, printShop, admin) with session management
3. **Cloudflare R2 Integration**: File upload system with presigned URLs and CDN configuration
4. **SMTP2GO Email Service**: Transactional email setup for verification and notifications
5. **Password Security**: Bcrypt hashing, complexity requirements, and secure reset functionality
6. **File Upload Validation**: Size limits (50MB), format restrictions (PDF, DOC, images), and security scanning
7. **Responsive Auth UI**: Mobile-first login/register forms using shadcn/ui components

## Story 1.3: Responsive Landing Page with Registration

As a **potential user**,  
I want **an engaging responsive landing page with easy registration**,  
so that **I can understand the platform value and get started quickly**.

### Acceptance Criteria

1. **Mobile-First Design**: Responsive layout working perfectly on mobile (320px+), tablet (768px+), desktop (1024px+)
2. **Value Proposition**: Clear messaging for students, creators, and print shops with benefits highlighted
3. **Hero Section**: Compelling headline, subtext, and prominent call-to-action leading to registration
4. **Feature Showcase**: Three-column responsive layout with platform features, icons, and descriptions
5. **Registration Flow**: Seamless responsive registration with role selection and email verification
6. **Navigation**: Mobile-optimized header with hamburger menu and touch-friendly footer
7. **Performance**: <2 second load time on mobile with optimized images and minimal JavaScript

## Story 1.4: Multi-Role User Profiles & Admin Access

As a **registered user**,  
I want **role-specific profiles with appropriate features and admin oversight**,  
so that **I can manage my account and administrators can oversee the platform**.

### Acceptance Criteria

1. **Role-Specific Profiles**: Custom profile fields for each role (location for customers, business info for print shops, bio for creators)
2. **Profile Management**: Responsive profile editing with image upload to Cloudflare R2
3. **Verification System**: Print shop business document upload and admin approval workflow
4. **Admin Authentication**: Special admin role with access to user management interfaces
5. **Account Settings**: Password changes, email preferences, notification settings, and account deactivation
6. **Data Validation**: Comprehensive form validation with clear error messages and requirements
7. **Privacy Controls**: User settings for public profile visibility and data sharing preferences

## Story 1.5: Email Notification Foundation

As a **platform user**,  
I want **to receive email notifications for important platform events**,  
so that **I stay informed about orders, account changes, and platform updates**.

### Acceptance Criteria

1. **Email Template System**: Responsive HTML email templates for different notification types
2. **SMTP2GO Integration**: Reliable email delivery with bounce handling and delivery tracking
3. **Notification Types**: Welcome emails, email verification, password reset, and system notifications
4. **Email Queue System**: Background email processing to prevent blocking user interactions
5. **Unsubscribe Management**: One-click unsubscribe with granular notification preferences
6. **Admin Email Tools**: Admin notifications for new user registrations and system events
7. **Testing Framework**: Email testing in development environment with email capture and preview

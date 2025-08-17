# Epic 2: Marketplace & Orders

**Expanded Goal:** Build the complete three-sided marketplace with print shop directory, content upload/discovery systems, and end-to-end order workflow. This epic establishes all marketplace functionality including basic quality assurance when orders begin, creating a fully operational platform ready for payment integration.

## Story 2.1: Print Shop Directory & Onboarding

As a **print shop owner and customer**,  
I want **a comprehensive print shop directory with onboarding and discovery features**,  
so that **print shops can join the platform and customers can find local shops**.

### Acceptance Criteria

1. **Shop Registration**: Print shop onboarding with business verification and equipment details
2. **Shop Directory**: Searchable list and map view of registered print shops with filters
3. **Location Services**: GPS-based distance calculation and proximity sorting for customers
4. **Shop Profiles**: Detailed profiles with capabilities, specializations, hours, and contact information
5. **Pricing Display**: Transparent pricing for different print options (color, binding, paper types)
6. **Availability Status**: Real-time capacity indicators and current workload display
7. **Admin Approval**: Print shop verification workflow with document review and approval process

## Story 2.2: Content Creator Upload System

As a **content creator**,  
I want **to upload educational materials with metadata and pricing**,  
so that **students can discover and order printed versions of my content**.

### Acceptance Criteria

1. **File Upload Interface**: Drag-and-drop upload to Cloudflare R2 with progress indicators
2. **Content Metadata**: Form fields for title, description, subject, grade level, curriculum alignment, and tags
3. **Pricing Configuration**: Base pricing and markup percentages for different print options
4. **File Processing**: Automatic preview generation and format validation using existing infrastructure
5. **Content Library**: Creator dashboard to view, edit, and manage all uploaded content
6. **Draft System**: Save content as drafts before publishing with revision tracking
7. **Admin Moderation**: Content approval workflow with admin review before publication

## Story 2.3: Educational Content Discovery System

As a **student/customer**,  
I want **to search and browse educational materials effectively**,  
so that **I can find relevant content for my printing needs**.

### Acceptance Criteria

1. **Search Functionality**: Text search across titles, descriptions, and tags with autocomplete
2. **Advanced Filters**: Filter by subject, grade level, content type, price range, and creator ratings
3. **Content Display**: Responsive grid and list views with thumbnails, titles, creators, and pricing
4. **Content Detail Pages**: Comprehensive view with description, preview, creator info, and print options
5. **Rating System**: Display average ratings and customer reviews with sorting capabilities
6. **Recommendations**: Algorithm-based content suggestions based on viewing history
7. **Mobile Optimization**: Touch-friendly browse experience optimized for mobile discovery

## Story 2.4: Basic Order Creation

As a **customer**,  
I want **to create orders with print specifications and shop selection**,  
so that **I can get my materials printed according to my requirements**.

### Acceptance Criteria

1. **Content Selection**: Choose from uploaded content or customer files with preview
2. **Print Configuration**: Select quantity, color options, paper type, and binding preferences
3. **Shop Selection**: Choose from available print shops with pricing and turnaround estimates
4. **Order Summary**: Clear breakdown of content costs, printing fees, and total pricing
5. **Delivery Options**: Choose pickup or delivery with address and time preferences
6. **Order Validation**: Comprehensive validation of order details before submission
7. **Order Creation**: Submit order and generate unique order ID with initial status

## Story 2.5: Order Assignment & Management

As a **print shop owner**,  
I want **to receive and manage digital orders efficiently**,  
so that **I can fulfill customer orders and maintain shop operations**.

### Acceptance Criteria

1. **Order Queue**: Print shop dashboard showing incoming orders with priority sorting
2. **Order Details**: Full order information including files, specifications, and customer details
3. **Order Acceptance**: Accept or decline orders with capacity and capability validation
4. **Estimated Completion**: Provide and update estimated completion times for customers
5. **Status Management**: Update order status through workflow (Accepted, In Progress, Ready, Completed)
6. **Customer Contact**: Direct communication channel for order-specific questions
7. **Shop Analytics**: Basic metrics on order volume, completion times, and customer ratings

## Story 2.6: Order Tracking & Communication

As a **customer and print shop**,  
I want **real-time order status updates and communication**,  
so that **I can track progress and coordinate pickup/delivery**.

### Acceptance Criteria

1. **Status Pipeline**: Clear order statuses with timestamps and progress indicators
2. **Email Notifications**: Automated email alerts for status changes using existing notification system
3. **Real-Time Updates**: Dashboard updates for order status changes and completion estimates
4. **Communication System**: Direct messaging between customers and print shops for specific orders
5. **Pickup Coordination**: Notifications when orders are ready with shop contact information
6. **Order History**: Complete history of all orders with status tracking and reorder functionality
7. **Issue Reporting**: Basic interface for reporting problems during order fulfillment

## Story 2.7: Basic Quality Assurance

As a **platform user**,  
I want **basic quality standards and issue resolution**,  
so that **I can trust the platform and resolve problems when they occur**.

### Acceptance Criteria

1. **Quality Standards**: Basic quality metrics for print shops with rating system
2. **Issue Reporting**: Customer interface for reporting quality problems with photo upload
3. **Basic Dispute Process**: Simple workflow for handling quality complaints and resolutions
4. **Rating System**: Post-order rating and review system for both content and print quality
5. **Print Shop Monitoring**: Quality score tracking with warnings for poor performance
6. **Admin Oversight**: Basic admin tools for reviewing and resolving customer complaints
7. **Resolution Tracking**: Simple tracking of issue types and resolution outcomes

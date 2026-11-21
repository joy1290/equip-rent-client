# EquipRent – Equipment Rental Platform

EquipRent is a full-stack equipment rental platform that allows equipment owners to list their equipment for rent and enables customers to browse, book, and rent equipment for a specific period. The system includes equipment management, rental booking, secure online payments, and administrative management.

## Project Purpose

The Equipment Rental Platform connects equipment owners and customers through a transparent and secure rental marketplace where users can easily find and rent equipment based on their requirements.

## Live Demo

**Live Website:** https://equip-rent-client.vercel.app/

## Repositories

- **Frontend:** [GitHub Repository](https://github.com/your-username/equip-rent-client)
- **Backend:** [GitHub Repository](https://github.com/your-username/equip-rent-server)

## Key Features

### Authentication & Authorization
- **Email/Password Registration:** Name, email, photo (direct link or imgbb upload), password with validation (must have uppercase, lowercase, minimum 6 characters). Error toast shown for invalid passwords. Success toast/SweetAlert on successful registration.
- **Google Social Login:** Default role: Customer for Google registrants.
- **JWT-based Authentication:** Access token generated upon successful login to manage user sessions securely.
- **Role-Based Access Control (RBAC):** Three roles - Customer, Owner, Admin with middleware to check user roles and permissions. Private routes protected based on role permissions.
- **Reload Protection:** Logged-in users remain authenticated on route reload without redirecting to Login page.

### Home Page (Public Route)
- **Navbar:** Logo, Website Name, Home, All Equipment, About Us, Contact Us, How it Works, Login/Register (or Dashboard/Logout when logged in)
- **Banner Section:** High-quality image, attractive title, short platform purpose description
- **Featured Equipment Section:** 6 approved equipment items via MongoDB limit, card layout with "View Details" (redirects to Login if logged out, or Equipment Details if logged in)
- **Categories Section:** Construction Equipment, Photography Equipment, Vehicles & Transportation, Agriculture Equipment, Electronics, Event Equipment
- **Why Choose Us Section:** Affordable rental prices, verified equipment owners, flexible rental periods, secure payments
- **Customer Reviews Section:** At least 4 reviews with customer name, rating, and review comments
- **Extra Sections:** At least 2 relevant sections (Popular Equipment, How It Works)
- **Framer Motion Animations:** Banner, Featured Equipment, Categories Section, and optional sections

### All Equipment Page (Public Route)
- **3-column Card Grid:** Equipment Image, Name, Category, Rental Price, Rental Type, Location, Availability Status, View Details Button
- **Server-Side Search:** By equipment name/title and location
- **Filters:** Equipment Category, Rental Type, Price Range, Availability
- **Sorting:** Price Low to High, Price High to Low, Recently Added
- **Pagination** for data in manageable sections

### Equipment Details Page (Private Route)
- **Full Details:** Equipment Name, Description, Category, Rental Price, Rental Type (Daily/Weekly/Monthly), Location, Available Quantity, Equipment Image
- **Owner Information:** Owner details and contact
- **Rental Terms and Conditions**
- **Add/Remove Favorites:** Persisted in database, display in Customer Dashboard
- **Book Now Modal:** Rental Start Date, Rental End Date, Required Quantity, Contact Number, Delivery Address, Additional Notes
- **Availability Check:** Equipment availability validated
- **Total Amount Calculation:** Based on rental duration and quantity (supports daily, weekly, monthly rental types)
- **Stripe Payment Integration:** Redirect to Stripe Checkout, on payment success create booking record and payment transaction, redirect to payment success page

### Dashboards (Responsive + Charts/Analytics)

#### Customer Dashboard (Private Route)
- **My Rentals Table:** Equipment Name, Rental Start Date, Rental End Date, Booking Date, Total Amount, Payment Status, Booking Status
- **Favorites Table:** View Details, Remove Favorite actions
- **Profile Page:** Name, Email, Profile Image, Phone Number, Address - editable by user
- **Quick Access:** My Bookings, Payment History, Browse Equipment, My Favorites

#### Owner Dashboard (Private Route)
- **Add Equipment Form:** Equipment Name, Description, Category (Dropdown), Location, Rental Price, Rental Type (Daily/Weekly/Monthly), Available Quantity, Equipment Condition, Brand, Model, Equipment Image (imgbb upload), Rental Terms and Conditions, Status (Pending default)
- **My Equipment Table:** Equipment Name, Category, Rental Price, Available Quantity, Status (default pending) - with Update, Delete, View Details actions
- **My Equipment Rental Table:** Customer Information, Equipment Information, Rental Duration, Required Quantity, Booking Amount, Payment Status, Booking Status
- **Profile Page:** Update profile information
- **Analytics:** Total listed equipment, completed rentals, total & monthly earnings
- **Business Analytics Charts:** Recharts-based KPI cards and graphs

#### Admin Dashboard (Private Route)
- **All Users Table:** Name, Email, Role, Registration Date - with Change Role (Customer, Owner, Admin) and Manage Users actions (backend implementation required)
- **All Equipment Table:** All equipment items with Approve, Reject, Update, Delete actions. Status: Pending, Approved, Rejected
- **All Rentals Table:** Customer Information, Owner Information, Equipment Name, Rental Duration, Booking Amount, Payment Status, Booking Status
- **Admin Analytics:** Total users, total equipment, total bookings, pending approvals, completed rentals, total revenue, monthly booking statistics
- **Profile Page:** Update profile information

### Payment Integration
- **Stripe Payment Gateway:** Secure online payments via Stripe Checkout
- **Booking Creation:** Booking record created, then Stripe Checkout session created
- **Payment Success:** After successful payment, booking status updated to "Confirmed" and payment transaction recorded
- **Payment Success Page:** Redirect after successful payment

### UI/UX Design
- **Unique Design:** Custom design not similar to module examples
- **Color Contrast:** Pleasing to the eye, proper alignment and spacing
- **No Gobindo Design:** Professional, modern UI
- **Consistent Heading Style:** Same font, size, color across all sections
- **Balanced Paragraph Spacing:** Text easily readable
- **Uniform Image Sizes:** Same height/width for cards and equipment images
- **Grid Layout:** Equal image sizes, especially in equipment grid
- **New X Logo:** Instead of old Twitter bird, matches latest rebrand
- **Consistent Button Style:** Same style as home page throughout
- **Responsive Design:** Works on mobile, tablet, and desktop views
- **Dashboard UI:** Responsive design for mobile and tablet, consistent color theme, full-width dashboards, charts and graphs for quick data visualization

### Error & Loading Pages
- **Loading Page:** Shown during data fetching, proper skeleton states
- **Error Page:** "Something went wrong" with retry button
- **404/Route Protection:** No errors on reloading from any routes
- **Private Route Reload:** Logged-in users stay authenticated on private route reload

### Environment Security
- **Env Variables:** All secrets (API keys, database credentials) secured using environment variables
- **Better Auth Configuration:** OAuth state and session cookies handled same-origin
- **API Proxy:** `/api/*` requests proxied through Next.js to backend

### Technologies Used
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Better Auth, Base UI, Framer Motion, Recharts, Lucide React, React Hot Toast, Stripe
- **Backend:** Express JS, MongoDB, TypeScript/JavaScript
- **Authentication:** Better Auth with MongoDB Adapter, JWT with Role-Based Authentication
- **Deployment:** Vercel

### Installation and Setup

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/equip-rent-client.git
```

#### 2. Navigate to the project directory
```bash
cd equip-rent-client
```

#### 3. Install dependencies
```bash
npm install
```

#### 4. Configure environment variables
Copy `.env.example` to `.env.local` in the project root:

```env
# Backend the dev server proxies /api/* to (see next.config.ts)
BACKEND_URL=http://localhost:5000
# API base used in the browser — must stay relative so auth cookies are first-party
NEXT_PUBLIC_API_URL=/api
```

Both values have working defaults for local development, so this step is optional on your machine. For production, set them in Vercel:

```env
BACKEND_URL=https://equip-rent-server.vercel.app
NEXT_PUBLIC_API_URL=/api
```

> **Why a proxy?** All `/api/*` traffic is forwarded to the backend by Next.js so the browser only ever talks to one origin. Better Auth's OAuth state and session cookies are `SameSite=Lax`, which browsers refuse to send across sites — calling the backend directly made Google login fail with `error=state_mismatch`.

#### 5. Run the development server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build for Production
```bash
npm run build
npm start
```

## Deployment
The frontend is deployed on Vercel.

**Live URL:** https://equip-rent-client.vercel.app/

## Backend Repository
https://github.com/your-username/equip-rent-server

## License
This project is developed for learning and portfolio purposes.
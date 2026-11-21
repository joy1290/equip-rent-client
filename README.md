# EquipRent – Equipment Rental Platform

EquipRent is a full-stack equipment rental platform that allows users to explore equipment, manage bookings, and make secure online payments.

## Project Purpose

EquipRent allows equipment owners to list their equipment for rent and enables customers to browse, book and rent equipment for a specific period — with secure online payments and administrative management. This repository contains the Next.js (App Router) frontend.

## Live Demo

**Live Website:** https://equip-rent-client.vercel.app/

**Backend API:** https://equip-rent-server.vercel.app/

## Repositories

- **Frontend:** https://github.com/joy1290/equip-rent-client
- **Backend:** https://github.com/joy1290/equip-rent-server

## Features

- Home page with hero banner, 6 featured equipment items (MongoDB `limit(6)`), popular categories, Why Choose Us, customer reviews and extra animated sections
- Browse all approved equipment in a 3-column card grid
- **Server-side search, filters, sorting and pagination** on All Equipment (search by name/category/location, category, rental type, price range, availability, price sort)
- Equipment details page (private) with owner information, favorites and a booking modal
- User registration and login (email/password with password-policy validation)
- Google authentication
- Add and manage favorite equipment
- Create and manage rental bookings with Stripe Checkout payments
- Role-based dashboards (Customer, Owner, Admin) built as responsive data tables
- Admin & Owner analytics dashboards with KPI cards and recharts graphs (monthly bookings, revenue and earnings)
- Profile page with editable name, photo, phone and address (imgbb image upload)
- Booking history and All Equipment pagination
- Dark / light **theme toggle** saved in localStorage (no flash on load)
- Loading, error and 404 pages, responsive UI, About & Contact pages, X (new logo) socials in the footer

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Better Auth
- Base UI
- Framer Motion
- Recharts
- Lucide React
- React Hot Toast
- Stripe integration

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/joy1290/equip-rent-client.git
```

### 2. Navigate to the project directory

```bash
cd equip-rent-client
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Copy `.env.example` to `.env.local` in the project root:

```env
# Backend the dev server proxies /api/* to (see next.config.ts)
BACKEND_URL=http://localhost:5000
# API base used in the browser — must stay relative so auth cookies are first-party
NEXT_PUBLIC_API_URL=/api
```

Both values have working defaults for local development, so this step is
optional on your machine. For production, set them in Vercel:

```env
BACKEND_URL=https://equip-rent-server.vercel.app
NEXT_PUBLIC_API_URL=/api
```

> **Why a proxy?** All `/api/*` traffic is forwarded to the backend by
> Next.js so the browser only ever talks to one origin. Better Auth's OAuth
> state and session cookies are `SameSite=Lax`, which browsers refuse to
> send across sites — calling the backend directly made Google login fail
> with `error=state_mismatch`.

### 5. Run the development server

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

https://github.com/joy1290/equip-rent-server

## License

This project is developed for learning and portfolio purposes.
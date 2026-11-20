# EquipRent – Equipment Rental Platform

EquipRent is a full-stack equipment rental platform that allows users to explore equipment, manage bookings, and make secure online payments.

## Live Demo

**Live Website:** https://equip-rent-client.vercel.app/

**Backend API:** https://equip-rent-server.vercel.app/

## Repositories

- **Frontend:** https://github.com/joy1290/equip-rent-client
- **Backend:** https://github.com/joy1290/equip-rent-server

## Features

- Browse available rental equipment
- User registration and login
- Google authentication
- Equipment search and filtering
- Add and manage favorite equipment
- Create and manage rental bookings
- Secure online payments with Stripe Checkout
- User account and booking management
- Responsive user interface

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Better Auth
- Base UI
- Framer Motion
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

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, use your deployed backend URL:

```env
NEXT_PUBLIC_API_URL=https://equip-rent-server.vercel.app/api
```

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
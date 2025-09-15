# AI Agent Club Website

A portfolio website for the AI Agent Workshop Club, built with Next.js, TypeScript, and Supabase.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

3. Run the development server:
```bash
npm run dev
```

## Features

- 🏠 Homepage with club overview
- 📚 Project library with contribution tracking
- 👥 Member profiles and skills
- 🔐 Admin dashboard for content management
- 📱 Responsive design with modern UI
- 🚀 Built with Next.js 14 App Router

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **UI**: Lucide Icons, Custom Components
- **Charts**: Recharts
- **Video**: React Player

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Utilities and configurations
└── types/            # TypeScript type definitions
```

## Database Schema

See `supabase/migrations/` for the complete database schema including:
- User profiles and roles
- Projects and contributions
- Authentication policies
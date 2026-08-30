# DigiResult — Academic Result Portal

A Next.js 14 academic result portal for single-institute use. Students look up their result by Roll Number + Date of Birth. Administrators manage examinations, students, and results through a protected panel.

## Project Structure

```
d:\Result.DIgi\
├── app/                        # Next.js App Router (pages + routes)
│   ├── layout.tsx              # Root layout (fonts, global providers)
│   ├── page.tsx                # Public homepage (student lookup form)
│   ├── globals.css             # Global styles + Tailwind base
│   ├── result/
│   │   └── page.tsx            # Result display page (PDF download)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (sidebar wrapper)
│   │   ├── login/page.tsx      # Admin login page
│   │   ├── dashboard/          # Dashboard + stats
│   │   ├── examinations/       # Manage examinations + subjects
│   │   ├── results/            # View + publish student results
│   │   ├── import/             # Bulk Excel/CSV import
│   │   └── settings/           # Institute settings
│   └── api/
│       ├── result/lookup/      # Public: student result lookup
│       └── admin/seed/         # Protected: seed demo data
│
├── components/
│   ├── shared/
│   │   └── Logo.tsx            # Reusable logo (sm/md/lg/xl, protected)
│   └── admin/
│       └── AdminSidebar.tsx    # Admin navigation sidebar
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser-side Supabase client
│   │   └── server.ts           # Server-side Supabase client + admin client
│   ├── types.ts                # TypeScript interfaces (Student, Result, etc.)
│   ├── utils.ts                # Grade calculation, date formatting, helpers
│   └── mock-data.ts            # Demo mode mock data (used when Supabase unconfigured)
│
├── public/
│   └── logo.png                # Institute logo (served statically)
│
├── supabase/
│   ├── schema.sql              # Database schema, RLS policies, lookup function
│   └── seed.sql                # Sample seed data for testing
│
├── middleware.ts               # Auth guard: /admin/* → redirect to / if unauthenticated
├── next.config.js              # Next.js config + security headers
├── server.js                   # Hostinger Node.js startup file
├── tailwind.config.js          # Tailwind theme + custom animations
├── .env.example                # Environment variable template (no secrets)
└── .gitignore                  # Excludes .env*, node_modules, .next, build artifacts
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public anon key (safe for browser)
SUPABASE_SERVICE_ROLE_KEY=      # Secret — server-only, never expose
```

## Development

```bash
npm install
npm run dev       # http://localhost:3000
```

## Production (Hostinger)

```bash
npm install && npm run build
npm start         # uses server.js
```

## Supabase Setup

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Create admin user: Authentication → Users → Add User

## Demo Mode

When `NEXT_PUBLIC_SUPABASE_URL` is not configured, the app runs in Demo Mode using `lib/mock-data.ts` with sample student data.

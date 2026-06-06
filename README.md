# Blog CMS Headless

Fullstack blog platform built with Next.js App Router, tRPC, Prisma, NextAuth & Socket.io real-time comments.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| API | tRPC v11 + Zod validation |
| Database ORM | Prisma + PostgreSQL |
| Auth | NextAuth.js v4 (GitHub, Google) |
| Real-time | Socket.io (live comments) |
| Type-safety | TypeScript end-to-end |

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── trpc/[trpc]/          # tRPC handler
│   │   └── socket/               # Socket.io init endpoint
│   ├── blog/
│   │   ├── page.tsx              # Posts listing
│   │   └── [slug]/page.tsx       # Post detail + live comments
│   ├── dashboard/
│   │   ├── page.tsx              # Admin overview
│   │   ├── posts/page.tsx        # Post management
│   │   └── posts/new/page.tsx    # Rich text editor
│   └── auth/
│       └── signin/page.tsx       # Custom sign-in page
├── components/
│   ├── ui/                       # Button, Input, Card, Badge…
│   ├── editor/                   # Rich text editor (Tiptap)
│   ├── comments/                 # Live comment feed + form
│   └── layout/                   # Navbar, Sidebar, Footer
├── lib/
│   ├── trpc/router.ts            # All tRPC routers
│   ├── prisma/client.ts          # Prisma singleton
│   ├── auth/options.ts           # NextAuth config
│   └── socket/server.ts          # Socket.io server init
└── hooks/
    ├── useCommentSocket.ts        # Real-time comment hook
    └── useTRPC.ts                 # tRPC client hooks
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, OAuth credentials

# 3. Set up database
npm run db:generate
npm run db:migrate

# 4. Start dev server
npm run dev
```

## Key Features

- **Headless CMS** — Rich text editor (Tiptap), draft/publish workflow
- **Auth** — OAuth with GitHub & Google, role-based (READER, AUTHOR, ADMIN)
- **Real-time comments** — Socket.io rooms per post, live feed without polling
- **tRPC** — Fully type-safe API, no REST boilerplate, automatic type inference
- **Infinite scroll** — Cursor-based pagination on post listings
- **SEO** — Dynamic metadata with Next.js `generateMetadata`

## Data Model

```
User ──< Post ──< Comment ──< Comment (replies)
          │
          ├──< Category
          └──< Tag
```

## Deployment

```bash
# Build
npm run build

# Database migration in production
DATABASE_URL="..." npm run db:migrate -- --name init
```

Recommended: **Vercel** (Next.js) + **Supabase** or **Neon** (PostgreSQL).

> Socket.io requires a Node.js server — use Vercel with the `@vercel/node` runtime or deploy to Railway/Fly.io.

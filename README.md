# Reach OS

> **The all-in-one creative studio operating system.** Portfolio builder, business proposal generator, client project rooms, and business intelligence — unified in a single, beautifully crafted platform.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

Reach OS is a self-hosted SaaS platform purpose-built for **creative professionals, freelancers, and boutique studios** who need to manage their entire business from one place. Instead of juggling a dozen disconnected tools for portfolios, proposals, client communication, invoicing, and analytics, Reach OS consolidates everything into a single, cohesive interface.

Think of it as the **operating system for your creative business** — each module is a dedicated "app" within a unified workspace, designed with the polish and attention to detail you'd expect from tools like Linear, Frame.io, and Notion.

### Why Reach OS?

- **Stop stitching tools together.** Your portfolio, proposals, client rooms, and financials live under one roof.
- **Zero vendor lock-in.** Fully self-hosted. Your data, your rules.
- **Built for creatives, by creatives.** Every pixel is crafted with the aesthetic sensibility that creative professionals demand.
- **Near-free pricing strategy.** Designed to be accessible to freelancers and small studios who are just getting started.

---

## Features

### Portfolio Builder
Showcase your best work with a structured portfolio system. Organize projects by category, tag them for easy discovery, mark standout pieces as featured, and attach live URLs. Each project tracks hourly rate and hours invested, giving you visibility into what your work is truly worth.

### Case Studies Engine
Go beyond pretty screenshots. Build in-depth case studies with structured sections — challenge, solution, results, and process — that demonstrate the thinking behind your work. Reference specific projects, attach client testimonials, and manage the publication pipeline from draft to published.

### Pitch Deck Generator
Create compelling business proposals and pitch decks tailored to each client. Define the problem, your proposed solution, approach and timeline, investment requirements, and deliverables — all in a structured format that's ready to present. Reference your case studies to build credibility instantly.

### Client Project Rooms
Dedicated, private spaces for each client engagement. Track project phases from discovery through delivery, exchange messages, manage deliverables with status tracking and due dates, and keep every client relationship organized in one place.

### Revenue Intelligence
Real-time revenue dashboard that visualizes your income streams. Track monthly recurring revenue (MRR), project-based income, and one-off payments. Understand where your money comes from and spot trends that inform your business strategy.

### Financial Management
Full income and expense tracking with categorization. Log recurring and one-time transactions, add notes for context, and filter by date range. Built with the foundation for future balance sheet and P&L reporting.

### Capacity Planning
Know your bandwidth before you overcommit. Log daily hours worked against available capacity, reference specific projects, and visualize your utilization rate over time. Make confident decisions about taking on new work.

### Pricing Strategy Designer
Model and compare pricing plans for your services. Define features, target user segments, monthly or annual intervals, and positioning. Visualize your pricing architecture and test different strategies before going to market.

### Shareable Export
Generate unique, shareable links for your portfolios, case studies, pitch decks, and reports. Share professional, read-only snapshots with clients and stakeholders — no account required.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 + CSS Variables |
| **Component System** | shadcn/ui + Radix UI |
| **State Management** | Zustand 5 |
| **Database** | SQLite via Prisma ORM 6 |
| **Authentication** | JWT-based auth (bcrypt + jsonwebtoken) |
| **Charts** | Recharts 2 |
| **Animations** | Framer Motion 12 |
| **Forms** | React Hook Form + Zod 4 |
| **Drag & Drop** | dnd-kit 6 |
| **Rich Text** | MDXEditor 3 |
| **HTTP Client** | TanStack React Query 5 |
| **Runtime** | Bun |

---

## Design System

Reach OS ships with a carefully curated design system inspired by best-in-class creative tools:

- **Dark-first interface** with a `#0A0A0F` background and `#5E6AD2` indigo accent — minimal eye strain for long creative sessions.
- **Light mode** fully supported for daytime use.
- **Custom scrollbars**, smooth transitions, and selection highlighting.
- **5-color chart palette** optimized for data visualization readability.
- **Mobile-first responsive** layout with dedicated header, bottom navigation, and collapsible sidebar.

---

## Architecture

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Main SPA shell (12 dynamic views)
│   ├── layout.tsx              # Root layout with providers
│   ├── login/                  # Authentication pages
│   ├── register/
│   └── api/                    # RESTful API routes
│       ├── auth/               # Login, register, logout, session
│       ├── projects/           # Portfolio CRUD
│       ├── case-studies/       # Case study CRUD
│       ├── pitch-decks/        # Pitch deck CRUD
│       ├── client-rooms/       # Client room + messages + deliverables
│       ├── pricing/            # Pricing plans CRUD
│       ├── capacity/           # Capacity logs CRUD
│       ├── finance/            # Income + expense tracking
│       └── export/             # Shareable link generation
├── components/
│   ├── views/                  # 12 lazy-loaded view components
│   ├── ui/                     # 50+ shadcn/ui primitives
│   ├── app-sidebar.tsx         # Collapsible navigation sidebar
│   ├── auth-provider.tsx       # JWT authentication context
│   ├── error-boundary.tsx      # Graceful error handling
│   └── ...
├── lib/
│   ├── store.ts                # Zustand global state
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # JWT + bcrypt utilities
│   ├── utils.ts                # Shared helpers
│   └── ...
├── hooks/
│   ├── use-crud.ts             # Generic CRUD hook
│   └── use-mobile.ts           # Responsive breakpoint hook
└── prisma/
    └── schema.prisma           # 11 models, full relational schema
```

---

## Database Schema

Reach OS uses **11 interconnected models** powered by Prisma:

| Model | Purpose |
|-------|---------|
| `User` | Account with profile, avatar, and website |
| `Project` | Portfolio pieces with category, tags, cover, and metrics |
| `CaseStudy` | In-depth analyses linked to projects |
| `PitchDeck` | Client proposals with problem/solution/timeline |
| `ClientRoom` | Private client engagement spaces with phases |
| `Message` | Threaded messages within client rooms |
| `Deliverable` | Trackable deliverables with status and due dates |
| `Income` | Revenue entries with categories and recurrence |
| `Expense` | Cost tracking with vendor and categorization |
| `PricingPlan` | Service pricing models with feature lists |
| `CapacityLog` | Daily utilization tracking per project |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- SQLite (bundled with Bun/Prisma)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/reash-os.git
cd reash-os

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize the database
bun run db:push
bun run db:generate

# Seed sample data (optional)
bun run seed.ts

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your account.

### Production Build

```bash
bun run build
bun run start
```

The production server runs on port 3000 by default. Use the included `Caddyfile` for reverse proxy configuration with automatic HTTPS.

---

## Environment Variables

```env
# Database
DATABASE_URL="file:./db/custom.db"

# JWT Authentication
JWT_SECRET="your-secret-key-change-this"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Performance Optimizations

- **Code splitting** — All 12 views are loaded dynamically via `next/dynamic` with skeleton loading states
- **Zustand selector optimization** — Components subscribe only to the state slices they need, preventing unnecessary re-renders
- **Memoized auth context** — Authentication provider uses `useMemo` to stabilize context values
- **Generic CRUD hook** — DRY data fetching with built-in loading/error states and caching via React Query
- **Error boundaries** — Graceful fallback UI prevents white-screen crashes in production

---

## Roadmap

- [ ] Real-time collaboration with WebSocket
- [ ] Client portal (public-facing project status pages)
- [ ] Invoice generation and payment tracking
- [ ] Integration hub (Figma, Google Drive, Slack)
- [ ] AI-powered proposal writing assistant
- [ ] Multi-tenancy for agencies
- [ ] Mobile native app (React Native)
- [ ] Plugin/third-party extension system

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript strict mode for new code
- Follow the existing component patterns (view components in `components/views/`, UI primitives in `components/ui/`)
- Write meaningful commit messages
- Test responsive behavior at mobile (375px), tablet (768px), and desktop (1280px) breakpoints

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with inspiration from the design philosophies of [Linear](https://linear.app), [Frame.io](https://frame.io), and [Notion](https://notion.so). UI components powered by [shadcn/ui](https://ui.shadcn.com).

---

<p align="center">
  <strong>Reach OS</strong> — The operating system for creative businesses.
</p>

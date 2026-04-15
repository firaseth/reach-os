# Contributing to Reach OS

Thank you for your interest in contributing! This guide will help you get set up and submit quality PRs.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Conventions](#commit-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Project Structure](#project-structure)

---

## Code of Conduct

By participating in this project you agree to be respectful, inclusive, and constructive. Harassment of any kind will not be tolerated.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0.0
- Node.js ≥ 20 (for tooling compatibility)
- Git

### Setup

```bash
# 1. Fork & clone
git clone https://github.com/YOUR_USERNAME/reach-os.git
cd reach-os

# 2. Install dependencies
bun install

# 3. Set up environment
cp .env.example .env
# Edit .env with your values

# 4. Initialize the database
bun run db:push

# 5. (Optional) Seed demo data
bun seed.ts

# 6. Start the dev server
bun run dev
```

The app will be available at `http://localhost:3000`.

---

## Development Workflow

```
main         ← stable production branch
  └─ develop ← integration branch (PRs target this)
       └─ feature/your-feature
       └─ fix/your-bugfix
```

1. Branch off `main` for bug fixes, `develop` for features.
2. Keep changes focused — one feature or fix per PR.
3. Run `bun run type-check` and `bun run lint` before pushing.

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

Types: feat | fix | docs | style | refactor | test | chore | perf
```

Examples:
- `feat(finance): add recurring expense toggle`
- `fix(auth): handle expired JWT gracefully`
- `docs: update contributing guide`

---

## Pull Request Guidelines

- Fill out the PR template completely.
- Link any related issues (`Closes #123`).
- Keep PRs small and reviewable (< 400 lines changed where possible).
- Add screenshots for UI changes.
- Ensure the CI checks pass before requesting review.

---

## Project Structure

```
reach-os/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   │   ├── api/          # REST API endpoints
│   │   ├── login/        # Auth pages
│   │   └── register/
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives
│   │   └── views/        # Full-page feature views
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities, auth, DB client, stores
├── prisma/               # Prisma schema & migrations
├── public/               # Static assets
├── Dockerfile            # Multi-stage production image
├── docker-compose.yml    # Local stack (app + Caddy)
└── Caddyfile             # Reverse proxy config
```

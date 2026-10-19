# CRM Pro

A full-stack customer relationship management application built with Next.js, TypeScript, Prisma, and PostgreSQL, featuring AI-assisted lead insights and call follow-up workflows.

## Overview

CRM Pro brings lead management, activity tracking, reminders, and AI-assisted workflows into one web application. The codebase separates business logic into services and validates AI-generated responses against typed schemas.

## Features

- **Lead management:** Lead-related business logic and activity history.
- **AI lead briefs:** Generate structured summaries, key facts, risks, recommended next actions, and questions for future conversations.
- **AI call follow-ups:** Generate suggested call scripts, objection responses, next steps, and reminder recommendations.
- **Structured AI responses:** Validate model output with Zod schemas.
- **Context-aware generation:** Use lead details and recent activity; avoid unnecessary model calls when there is insufficient lead history.
- **AI gateway error handling:** Handle missing or invalid credentials, rate limits, malformed gateway responses, and output validation failures.
- **Reminders and notifications:** Dedicated service and API modules.

## Technology stack

| Area | Technologies |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript |
| Database | PostgreSQL, Prisma |
| AI | Vercel AI SDK, AI Gateway, Zod |
| UI | Tailwind CSS, Radix UI |
| Supporting services | Supabase, Upstash QStash, Redis |
| Data fetching | TanStack Query |

## Architecture and code highlights

The AI implementation lives in `src/services/ai/`:

- [`service.ts`](src/services/ai/service.ts) — AI generation workflows, activity logging, insufficient-context handling, and error mapping.
- [`schema.ts`](src/services/ai/schema.ts) — Zod schemas for lead briefs and call follow-ups.
- [`helpers.ts`](src/services/ai/helpers.ts) — prompt construction and supporting checks.
- [`db.ts`](src/services/ai/db.ts) — data access for AI workflows.
- [`index.ts`](src/services/ai/index.ts) — public service exports.

Other modules include `src/services/lead/`, `src/services/activity/`, `src/services/reminders/`, and `src/app/api/`.

## Local development

### Prerequisites

- Node.js and npm
- PostgreSQL
- Credentials and configuration for the external services used by your environment

```bash
npm install
npx prisma generate
npm run dev
```

Additional commands: `npm run build`, `npm run lint`, and `npm run start`.

Configure required environment variables locally. Do not commit API keys, credentials, or real customer information.

## Engineering highlights

- Typed, service-oriented backend architecture
- Structured LLM generation integrated with application data
- Input/output validation with Zod
- Database-backed business workflows
- Defensive error handling for AI provider failures

## Author

**Omar Elnoamy** — M.Sc. Computer Science student, TU Darmstadt

[GitHub profile](https://github.com/Omarelnoamy)

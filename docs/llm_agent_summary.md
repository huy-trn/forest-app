# Forest Management Web App — Detailed Project Notes

This document provides a detailed summary of the project for LLM agent ingestion, including: all pages, all API endpoints, and the full database schema.

## 1) Overview
- Full-stack Next.js App Router project (frontend + backend API in one codebase).
- Role-based dashboards for admin, partner, investor.
- Public bilingual showcase (EN/VI).
- PostgreSQL + Prisma.
- Map features (Leaflet) with geocoding via Nominatim.
- Docker + Compose, EC2 deployment via GitHub Actions, nginx + certbot.

## 2) All Pages (App Router)

### Root
- `/` → `app/page.tsx`
- `/icon.svg` → `app/icon.svg`

### Locale public routes
- `/:locale` → `app/[locale]/page.tsx` (public showcase landing)
- `/:locale/login` → `app/[locale]/login/page.tsx`
- `/:locale/projects/:id` → `app/[locale]/projects/[id]/page.tsx` (public project detail)
- `/:locale/onboarding` → `app/[locale]/onboarding/page.tsx` (password setup via invite)
- `/:locale/layout` → `app/[locale]/layout.tsx`
- `/:locale/ShowcaseClient` → `app/[locale]/ShowcaseClient.tsx` (client-only UI module)

### Dashboard (protected, role-based)
- `/:locale/admin` → `app/(dashboard)/[locale]/admin/page.tsx`
- `/:locale/partner` → `app/(dashboard)/[locale]/partner/page.tsx`
- `/:locale/investor` → `app/(dashboard)/[locale]/investor/page.tsx`
- Dashboard layout → `app/(dashboard)/layout.tsx`
- Locale dashboard layout → `app/(dashboard)/[locale]/layout.tsx`

### Dashboard project detail
- `/:locale/projects/:id` (authenticated view) → `app/(dashboard)/[locale]/projects/[id]/client.tsx`
- `/:locale/dashboard/projects/:id` → `app/(dashboard)/[locale]/dashboard/projects/[id]/page.tsx`

## 3) All API Endpoints (App Router)

### Auth
- `GET/POST /api/auth/[...nextauth]` → NextAuth credentials login/logout/session
  - `app/api/auth/[...nextauth]/route.ts`

### Users & Onboarding
- `GET /api/users` → list users (admin)
- `POST /api/users` → create/invite user
- `DELETE /api/users?id=...` → delete user
  - `app/api/users/route.ts`
- `POST /api/onboarding` → complete onboarding (set password)
  - `app/api/onboarding/route.ts`

### Projects
- `GET /api/projects` → list projects (auth)
- `GET /api/projects?public=true` → list public projects
- `POST /api/projects` → create project
  - `app/api/projects/route.ts`

- `GET /api/projects/:id` → project detail (auth)
- `GET /api/projects/:id?public=true` → public project detail
- `PUT /api/projects/:id` → update project
  - `app/api/projects/[id]/route.ts`

### Project Locations (Map)
- `GET /api/projects/:id/locations` → list locations for project
- `POST /api/projects/:id/locations` → create location
  - `app/api/projects/[id]/locations/route.ts`

- `PATCH /api/projects/:id/locations/:locId` → update location / rollback to version
- `DELETE /api/projects/:id/locations/:locId` → soft-delete location
  - `app/api/projects/[id]/locations/[locId]/route.ts`

- `GET /api/projects/:id/locations/versions` → project-level history snapshots
- `POST /api/projects/:id/locations/versions?versionId=...` → rollback to snapshot
  - `app/api/projects/[id]/locations/versions/route.ts`

- `GET /api/projects/:id/locations/:locId/versions` → location-specific history
  - `app/api/projects/[id]/locations/[locId]/versions/route.ts`

### Tickets
- `GET /api/tickets` → list tickets (auth)
- `POST /api/tickets` → create ticket
  - `app/api/tickets/route.ts`

- `GET /api/tickets/:id` → ticket detail
  - `app/api/tickets/[id]/route.ts`

- `POST /api/tickets/:id/logs` → add ticket log
  - `app/api/tickets/[id]/logs/route.ts`

- `POST /api/tickets/:id/comments` → add ticket comment
  - `app/api/tickets/[id]/comments/route.ts`

- `POST /api/tickets/:id/attachments` → add ticket attachment
  - `app/api/tickets/[id]/attachments/route.ts`

- `PATCH /api/tickets/:id/status` → update ticket status
  - `app/api/tickets/[id]/status/route.ts`

- `GET /api/tickets/sse` → SSE stream for ticket list updates
  - `app/api/tickets/sse/route.ts`

- `GET /api/tickets/:id/sse` → SSE stream for ticket detail updates
  - `app/api/tickets/[id]/sse/route.ts`

### Investor Requests
- `GET /api/investor-requests` → list requests
- `POST /api/investor-requests` → create request
  - `app/api/investor-requests/route.ts`

- `PATCH /api/investor-requests/:id` → update request
  - `app/api/investor-requests/[id]/route.ts`

### Showcase
- `GET /api/showcase?locale=en|vi` → public showcase content
- `PUT /api/showcase` → update hero (admin only)
  - `app/api/showcase/route.ts`

### Uploads (S3)
- `POST /api/uploads` → create presigned upload URL
  - `app/api/uploads/route.ts`

- `GET /api/uploads/view?key=...` → redirect to signed download URL
  - `app/api/uploads/view/route.ts`

### Geocode
- `GET /api/geocode?q=...` → geocoding proxy (requires auth)
  - `app/api/geocode/route.ts`

### Copilot Runtime
- `POST /api/copilotkit` → CopilotKit runtime endpoint
  - `app/api/copilotkit/route.ts`

### Health
- `GET /api/health` → health check
  - `app/api/health/route.ts`

## 4) Database Schema (Prisma)

### Enums
- `Role`: admin, partner, investor, root
- `ProjectStatus`: active, completed
- `ForestType`: natural, artificial
- `TicketStatus`: open, in_progress, completed, closed
- `RequestStatus`: pending, processing, completed, rejected

### Models

#### User
- `id` (String, PK, uuid)
- `name` (String)
- `email` (String?, unique)
- `phone` (String?, unique)
- `role` (Role)
- `status` (String, default "active")
- `joinDate` (DateTime, default now)
- `emailVerified` (DateTime?)
- `passwordHash` (String?)
- Relations:
  - `projects` (ProjectMember[])
  - `ticketAssignees` (TicketAssignee[])
  - `ticketLogs` (TicketLog[])
  - `ticketComments` (TicketComment[])
  - `investorRequests` (InvestorRequest[])
  - `accounts` (Account[])
  - `sessions` (Session[])
  - `locationVersions` (ProjectLocationVersion[])

#### Project
- `id` (String, PK, uuid)
- `title` (String)
- `description` (String?)
- `status` (ProjectStatus, default active)
- `forestType` (ForestType, default natural)
- `country` (String?)
- `province` (String?)
- `area` (String?)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, updatedAt)
- Relations:
  - `members` (ProjectMember[])
  - `tickets` (Ticket[])
  - `locations` (ProjectLocation[])
  - `locationVersions` (ProjectLocationVersion[])

#### ProjectMember
- `id` (String, PK, uuid)
- `role` (Role)
- `projectId` (String, FK → Project)
- `userId` (String, FK → User)
- Unique: `[projectId, userId]`

#### Ticket
- `id` (String, PK, uuid)
- `title` (String)
- `description` (String?)
- `projectId` (String, FK → Project)
- `status` (TicketStatus, default open)
- `createdAt` (DateTime, default now)
- Relations:
  - `assignees` (TicketAssignee[])
  - `logs` (TicketLog[])
  - `comments` (TicketComment[])
  - `attachments` (TicketAttachment[])

#### TicketAssignee
- `id` (String, PK, uuid)
- `ticketId` (String, FK → Ticket)
- `userId` (String, FK → User)
- Unique: `[ticketId, userId]`

#### TicketLog
- `id` (String, PK, uuid)
- `message` (String)
- `createdAt` (DateTime, default now)
- `ticketId` (String, FK → Ticket)
- `userId` (String?)

#### TicketComment
- `id` (String, PK, uuid)
- `message` (String)
- `createdAt` (DateTime, default now)
- `ticketId` (String, FK → Ticket)
- `userId` (String, FK → User)
- `userRole` (Role)

#### TicketAttachment
- `id` (String, PK, uuid)
- `name` (String)
- `type` (String)
- `url` (String)
- `ticketId` (String, FK → Ticket)

#### InvestorRequest
- `id` (String, PK, uuid)
- `content` (String?)
- `status` (RequestStatus, default pending)
- `response` (String?)
- `createdAt` (DateTime, default now)
- `fromName` (String?)
- `fromEmail` (String?)
- `projectId` (String?)
- `investorId` (String?)

#### VerificationToken
- `identifier` (String)
- `token` (String, unique)
- `expires` (DateTime)
- Unique: `[identifier, token]`

#### ShowcaseHero
- `id` (String, PK, uuid)
- `locale` (String, unique)
- `title` (String?)
- `description` (String?)
- `updatedAt` (DateTime, updatedAt)

#### ProjectLocation
- `id` (String, PK, uuid)
- `projectId` (String, FK → Project)
- `latitude` (Float)
- `longitude` (Float)
- `label` (String?)
- `name` (String?)
- `description` (String?)
- `polygon` (Json?)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, updatedAt)
- `deletedAt` (DateTime?)
- Index: `[projectId]`

#### ProjectLocationVersion
- `id` (String, PK, uuid)
- `projectId` (String, FK → Project)
- `locationId` (String, FK → ProjectLocation)
- `userId` (String?)
- `operation` (String)
- `latitude` (Float)
- `longitude` (Float)
- `label` (String?)
- `name` (String?)
- `description` (String?)
- `polygon` (Json?)
- `createdAt` (DateTime, default now)
- Indexes: `[projectId]`, `[locationId]`

## 5) Deployment Summary
- Docker multi-stage build → Next build + Prisma generate.
- Docker Compose services: web, db, nominatim.
- Production override adds nginx + certbot.
- GitHub Actions deploys to EC2 using SSH, writes `.env` from secrets.

## 6) Auth Notes (NextAuth + Bearer JWT)
- Credentials login via NextAuth; session strategy is JWT.
- API guards accept Bearer tokens using NextAuth JWT (`getToken`) and also work with NextAuth session cookies.
- Secret comes from `AUTH_SECRET` or `NEXTAUTH_SECRET`.

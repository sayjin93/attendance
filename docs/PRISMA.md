# Prisma ORM Setup

This project uses **Prisma 7** with the **MariaDB driver adapter** (`@prisma/adapter-mariadb`) on **Next.js**.

## Architecture

```
prisma/
├── schema.prisma          # Database schema (models, relations, indexes)
├── prisma.ts              # PrismaClient singleton + factory (single source of truth)
├── generated/             # Auto-generated client (gitignored)
├── seed.ts                # Seed orchestrator
├── migrations/            # SQL migration files (gitignored)
└── seeds/                 # Seed data modules
    ├── professors.ts
    ├── programs.ts
    ├── teaching-types.ts
    ├── attendance-statuses.ts
    ├── classes.ts
    ├── subjects.ts
    ├── teaching-assignments.ts
    ├── lectures.ts
    ├── attendance.ts
    └── students/          # Auto-discovered student files
        ├── index.ts       # Scans for students-*.ts files automatically
        ├── students-INF205.ts
        ├── students-MSH1IE.ts
        └── ...
```

## Key Files

### `prisma/prisma.ts` — Client Singleton

All database access flows through this single file. It exports three things:

| Export | Purpose |
|--------|---------|
| `prisma` | Singleton instance for the app (API routes, server components) |
| `createPrismaClient()` | Factory for scripts that need their own instance (seeds) |
| `PrismaClient` | Type re-export for typing function parameters |

The singleton uses the `globalThis` pattern to survive Next.js hot-reloads in development without creating multiple connections.

**Usage in API routes:**
```ts
import { prisma } from "@/prisma/prisma";

const students = await prisma.student.findMany();
```

**Usage in seed files:**
```ts
import type { PrismaClient } from "../prisma";

export async function seedMyData(prisma: PrismaClient) {
  await prisma.myModel.createMany({ ... });
}
```

### `prisma.config.ts` — Prisma Configuration

Configures the schema path, migration directory, seed command, and datasource URL. Loads environment variables via `dotenv/config`.

### `prisma/schema.prisma` — Schema

Defines all models with a MySQL datasource. The generated client output is set to `./generated` (gitignored, rebuilt on every `prisma generate`).

## Environment

The only required database variable is `DATABASE_URL` in your `.env`:

```
DATABASE_URL=mysql://user:pass@localhost:3306/db_name
```

The MariaDB adapter parses this URL into individual connection parameters (`host`, `port`, `user`, `password`, `database`) automatically.

## Commands

### Generate the Prisma Client

```bash
npx prisma generate
```

Rebuilds `prisma/generated/`. Runs automatically on `npm install` via the `postinstall` script.

### Create a Migration

```bash
npx prisma migrate dev --name describe_your_change
```

Creates a new SQL migration file from schema changes and applies it to the database.

### Reset the Database

```bash
npx prisma migrate reset --force
```

Drops all tables, re-applies all migrations from scratch. Does **not** auto-seed — run `prisma db seed` separately.

### Seed the Database

```bash
npx prisma db seed
```

Runs `prisma/seed.ts` which executes all seed steps in dependency order and prints a summary table with timing:

```
┌─────────────────────────────────────────┐
│           🌱 Seed Summary               │
├──────────────────────────┬───────┬───────┤
│ Step                     │ Time  │ Status│
├──────────────────────────┼───────┼───────┤
│ Professors               │  0.7s │  ✅ │
│ Programs                 │  0.1s │  ✅ │
│ ...                      │       │       │
│ Total                    │ 10.3s │  🏁 │
└──────────────────────────┴───────┴───────┘
```

### Full Reset + Seed

```bash
npx prisma migrate reset --force && npx prisma db seed
```

### Open Prisma Studio

```bash
npx prisma studio
```

Visual database browser at `http://localhost:5555`.

## Seed System

The seed orchestrator (`prisma/seed.ts`) runs steps in foreign-key dependency order:

1. Professors
2. Programs
3. Teaching Types
4. Attendance Statuses
5. Classes
6. Subjects
7. Teaching Assignments
8. Students (auto-discovers all `students-*.ts` files)
9. Lectures
10. Attendance (generates a record for every student × every lecture in their class)

### Adding a New Student Class

Just create a new file in `prisma/seeds/students/`:

```ts
// prisma/seeds/students/students-NEWCLASS.ts
import type { PrismaClient } from "../../prisma";

export async function seedStudentsNEWCLASS(prisma: PrismaClient) {
  console.log("🌱 Seeding students for NEWCLASS...");

  await prisma.student.createMany({
    data: [
      { firstName: "...", lastName: "...", institutionEmail: "...", classId: N },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Done!");
}
```

No registration needed — the auto-discovery in `students/index.ts` picks it up automatically.

### Adding a New Seed Step

1. Create the seed file in `prisma/seeds/`
2. Export an async function that takes `prisma: PrismaClient`
3. Import and add it to the `steps` array in `prisma/seed.ts`

## Deployment (Vercel)

The `postinstall` script in `package.json` ensures the Prisma client is generated after `npm install`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "next build"
  }
}
```

This covers Vercel's cached `node_modules` scenario where `install` may be skipped between deploys.

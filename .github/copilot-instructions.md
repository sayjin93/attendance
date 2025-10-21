# Copilot Instructions - Attendance Management System

## Architecture Overview

This is a **Next.js 15 + Prisma + MySQL** attendance management system for educational institutions with role-based access (Admin/Professor). The app uses **App Router** with grouped routes and a hybrid SSR/Client pattern.

### Key Architectural Patterns

- **Grouped Routes**: `(auth)` for login, `(pages)` for protected pages
- **Hybrid SSR Pattern**: Server layouts fetch auth headers, client components handle interactions
- **Authentication Flow**: JWT tokens stored in HTTP-only cookies, middleware validates all protected routes
- **Database**: MySQL with Prisma ORM, complex relationships between Professor/Class/Student/Subject entities

## Development Workflow

### Essential Commands
```bash
# Development (runs on port 9900 with Turbopack)
npm run dev

# Database operations
npx prisma db push          # Push schema changes
npx prisma generate         # Generate client
npx prisma migrate dev --name init  # Create migration

# Password hashing (for seeding)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password', 10).then(console.log);"
```

## Critical Patterns

### 1. Authentication Architecture
- **Middleware** (`middleware.ts`): Validates JWT, injects headers (`X-Professor-Id`, `X-Is-Admin`)
- **Server Auth Utility** (`app/(pages)/utils/getAuthHeaders.ts`): Extracts auth from headers
- **API Auth** (`app/(pages)/utils/authenticateRequest.tsx`): Validates requests in API routes
- **Route Pattern**: All `/api/*` and `/(pages)/*` routes require authentication

### 2. Data Fetching Pattern
```typescript
// Custom hooks in /hooks/fetchFunctions.tsx
export async function fetchClasses() {
  const res = await fetch("/api/classes");
  return res.json();
}

// TanStack Query in components
const { data: classes = [], isLoading } = useQuery<Class[]>({
  queryKey: ["classes"],
  queryFn: () => fetchClasses(),
});
```

### 3. Component Structure
- **Page Components**: Server components in `page.tsx` that pass props to client components
- **Client Components**: Named `ClientComponent.tsx`, handle all interactions
- **Form Pattern**: Dedicated form components like `AddClassForm.tsx` with validation

### 4. API Route Patterns
```typescript
// Standard API structure
export async function GET() {
  const auth = await authenticateRequest();
  if ("error" in auth) return NextResponse.json({...});
  
  // Role-based logic
  const { decoded } = auth;
  if (!decoded.isAdmin) { /* filter by professorId */ }
}
```

### 5. Database Relationships
```prisma
// Core entities: Professor -> TeachingAssignment <- Subject
//                Class -> Student -> Attendance <- Lecture
// Key: Use includes for related data, professorId filtering for non-admins
```

### 6. Role-Based Access
- **Admin**: Full CRUD on all entities (classes, students, subjects, assignments)
- **Professor**: Read lectures/attendance, limited to assigned subjects
- **Navigation**: `adminOnly: true` flag in `constants/navigation.ts`

## Project Conventions

### File Organization
- **Types**: Single `types.ts` file with all interfaces
- **Constants**: Split between `/constants/index.ts` (secrets) and `/constants/navigation.ts`
- **Contexts**: TanStack Query + Custom notification context
- **Styling**: Tailwind + custom components (Card, Alert, Loader)

### Naming Conventions
- **Albanian UI**: Navigation and labels in Albanian ("Klasat", "Studentët", "Leksionet")
- **Database**: English field names, camelCase
- **Components**: PascalCase, descriptive names (AddStudentForm, ClientComponent)

### Error Handling
- **API**: Consistent error objects with status codes
- **Client**: `useNotify()` context for user messages
- **Auth**: Automatic redirects via middleware

## Integration Points

### External Dependencies
- **@tanstack/react-query**: All data fetching
- **jose**: JWT token handling
- **bcryptjs**: Password hashing
- **@heroicons/react**: UI icons
- **jspdf + jspdf-autotable**: Report generation

### Key Files to Reference
- `prisma/schema.prisma`: Complete data model
- `middleware.ts`: Auth validation logic
- `app/(pages)/utils/`: Auth utilities
- `hooks/fetchFunctions.tsx`: Data fetching patterns
- `constants/navigation.ts`: Route definitions and permissions

When working with this codebase, always verify authentication patterns and respect role-based access controls.
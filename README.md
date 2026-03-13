# 📚 Attendance Management System

A modern, full-stack attendance management system built for educational institutions with role-based access control, real-time data synchronization, AI assistant, and comprehensive reporting capabilities.

## 🌟 Features

### For Administrators

- **Complete CRUD Operations**: Manage classes, students, professors, subjects, and teaching assignments
- **Program Management**: Handle multiple academic programs (Bachelor, Master)
- **Subject & Course Management**: Create and assign subjects with unique codes
- **Teaching Assignments**: Assign professors to specific subjects, classes, and teaching types (Lecture/Seminar)
- **User Management**: Create and manage professor accounts with admin privileges
- **Activity Logs**: Track all system actions with detailed audit trail
- **Comprehensive Reports**: Generate detailed attendance reports with PDF/Excel export

### For Professors

- **Lecture Management**: Create and manage lectures for assigned subjects
- **Attendance Tracking**: Mark student attendance with four statuses:
  - ✅ **PRESENT** - Student attended the lecture
  - ❌ **ABSENT** - Student was absent
  - 🎯 **PARTICIPATED** - Student actively participated
  - 🏥 **LEAVE** - Excused absence (not counted toward total)
- **Real-time Dashboard**: View statistics with animated counters and upcoming lectures
- **Student Reports**: Access attendance data for assigned classes
- **AI Assistant**: Chat-powered assistant with function calling for quick data lookups

### General Features

- 🔐 **Secure Authentication**: JWT-based authentication with access token + refresh token rotation, HTTP-only cookies, and database-backed revocation
- 🎨 **Modern UI**: Clean, responsive interface with Albanian language support
- 🔄 **Real-time Updates**: TanStack Query for server state management and cache invalidation
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Performance Optimized**: Service layer architecture, React memoization, smart caching
- 📋 **Registry Management**: Comprehensive student attendance registry with cascade filtering and status tracking (NK/OK)
- 📊 **Export Capabilities**: PDF and Excel export via DevExtreme data grids with standardized export handler
- 🤖 **AI Assistant**: OpenAI-powered chat with function calling for querying attendance data
- 📧 **Email Notifications**: Welcome emails for new professors via Nodemailer

## 🏗️ Architecture

### Tech Stack

**Frontend**

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety (strict mode)
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- [TanStack Query 5](https://tanstack.com/query) - Server state management
- [DevExtreme 25](https://js.devexpress.com/) - Enterprise data grids with export
- [Headless UI 2](https://headlessui.com/) - Accessible UI components
- [Heroicons 2](https://heroicons.com/) - Icon library
- [Framer Motion 12](https://www.framer.com/motion/) - Animations

**Backend**

- [Prisma ORM 7](https://www.prisma.io/) - Database toolkit with MariaDB driver adapter
- [MySQL/MariaDB](https://mariadb.org/) - Relational database (via `@prisma/adapter-mariadb`)
- [jose](https://github.com/panva/jose) - JWT implementation
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [OpenAI](https://platform.openai.com/) - AI assistant with function calling
- [Nodemailer](https://nodemailer.com/) - Email service

**Development Tools**

- [Turbopack](https://turbo.build/pack) - Fast bundler
- [ESLint 10](https://eslint.org/) - Code linting with flat config
- [typescript-eslint](https://typescript-eslint.io/) - TypeScript ESLint rules
- [tsx](https://github.com/esbuild-kit/tsx) - TypeScript execution

### Architecture Patterns

#### Service Layer Architecture

The application uses a centralized service layer that abstracts all API communication:

```
UI Components → Services → API Client → API Routes → Prisma → Database
```

- **`services/api-client.ts`**: Centralized HTTP client with `ApiError` class that throws on non-200 responses
- **`services/*.service.ts`**: Domain-specific services (auth, class, student, professor, subject, assignment, lecture, attendance, report, dashboard)
- **`services/index.ts`**: Barrel exports for clean imports

```typescript
// Service layer pattern
import { classService, studentService } from "@/services";

// Services throw ApiError on failure — no manual response checking needed
const classes = await classService.getAll();
const students = await studentService.getByClass(classId);
```

#### Shared Utility Libraries

- **`lib/auth.ts`**: Server-side auth helpers (`requireAuth()`, `requireAdmin()`) for API routes
- **`lib/utils.ts`**: Shared utilities (`cn()`, `formatDate()`, `getTodayDate()`, `formatName()`, `getLabelColor()`)
- **`lib/export.ts`**: Standardized `createExportHandler()` factory for PDF/Excel export across all data grids

#### Hybrid SSR/Client Pattern

The application uses a hybrid rendering approach:

- **Server Components**: Fetch authentication data and initial page data
- **Client Components**: Handle user interactions and client-side state
- **Data Flow**: Server → Client Component props → TanStack Query → Service Layer

```typescript
// Server page (app/(pages)/classes/page.tsx)
export default async function Page() {
  const { professorId, isAdmin } = await getAuthHeaders();
  return <ClientComponent professorId={professorId} isAdmin={isAdmin} />;
}

// Client component uses services via TanStack Query
const { data } = useQuery({
  queryKey: ["classes"],
  queryFn: () => classService.getAll(),
});
```

#### Mutation Pattern

Since the API client throws `ApiError` on non-200 responses, mutations use a clean pattern:

```typescript
const deleteMutation = useMutation({
  mutationFn: (id: number) => classService.delete(id),
  onSuccess: () => {
    showMessage("Success!", "success");
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  },
  onError: (error) => {
    showMessage(error.message, "error");
  },
});
```

#### Authentication Flow (Access Token + Refresh Token)

The application implements a dual-token authentication architecture:

- **Access Token** (15 min, httpOnly cookie): Short-lived JWT carrying user claims. Verified by proxy and API routes.
- **Refresh Token** (7 days, httpOnly cookie): Long-lived JWT with a `jti` claim stored in the `RefreshToken` DB table. Enables revocation and rotation.

1. **Login**: User credentials → `/api/auth/login` → Issues both access + refresh tokens, stores refresh `jti` in DB
2. **Proxy**: `proxy.ts` validates access token; if expired, transparently creates a new one from the refresh token
3. **Server Auth**: `getAuthHeaders()` extracts auth from proxy-injected headers in Server Components
4. **API Auth**: `requireAuth()` / `requireAdmin()` validates access token in API routes
5. **API Client**: 401 interceptor automatically calls `/api/auth/refresh` and retries the failed request (deduplicated)
6. **Token Rotation**: Each refresh revokes the old token and issues a new pair; reuse of revoked tokens triggers family-wide revocation (theft detection)
7. **Proactive Refresh**: `useSessionRefresh` hook rotates both tokens every 10 min while user is active
8. **Logout**: Revokes refresh token in DB, clears both cookies
9. **Protected Routes**: All `/(pages)/*` and `/api/*` routes require authentication

#### Database Schema

```prisma
Professor ↔ TeachingAssignment ↔ Subject
    ↓              ↓                  ↓
  Lecture    →    Class         ←  Program
    ↓              ↓
Attendance  ←   Student
```

**Key Models**:

- **Professor**: User accounts with admin flag
- **Program**: Academic programs (Bachelor/Master)
- **Subject**: Courses with unique codes
- **Class**: Student groups linked to programs
- **Student**: Enrolled students
- **TeachingAssignment**: Maps professors to subjects, classes, and teaching types
- **Lecture**: Individual lecture sessions
- **Attendance**: Student attendance records

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+, 22.12+, or 24.0+
- MySQL or MariaDB database server
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sayjin93/attendance.git
   cd attendance
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your values:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/attendance"
   SECRET_KEY="your-secure-secret-key-here"
   ```

   See `.env.example` for all available variables (OpenAI, email, DevExtreme).

4. **Set up the database**

   Prisma Client is generated automatically on `npm install` (via `postinstall`). Then apply migrations and seed:

   ```bash
   # Apply migrations and create tables
   npx prisma migrate dev --name init

   # Seed the database
   npx prisma db seed

   # Or reset everything (drop + migrate + seed):
   npx prisma migrate reset --force && npx prisma db seed
   ```

   See [docs/PRISMA.md](docs/PRISMA.md) for the full Prisma documentation.

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:9900](http://localhost:9900)

### Default Admin Credentials (After Seeding)

After running the seed script, use these credentials to log in:

- **Username**: Set in `prisma/seed.ts`
- **Password**: Set in `prisma/seed.ts`

⚠️ **Important**: Change the default admin credentials after first login!

## 📁 Project Structure

```
attendance/
├── app/
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── forgot-password/     # Password reset request
│   │   └── reset-password/      # Password reset via token
│   ├── (pages)/                 # Protected pages (requires auth)
│   │   ├── ClientLayout.tsx     # Client-side layout with navigation
│   │   ├── ai-assistant/        # AI chat assistant
│   │   ├── assignments/         # Teaching assignments (Admin)
│   │   ├── attendance/          # Attendance tracking
│   │   ├── classes/             # Class management (Admin)
│   │   ├── dashboard/           # Dashboard with statistics
│   │   ├── lectures/            # Lecture management
│   │   ├── logs/                # Activity logs (Admin)
│   │   ├── professors/          # Professor management (Admin)
│   │   ├── registry/            # Student registry with cascade filtering
│   │   │   └── components/      # Registry-specific components
│   │   ├── reports/             # Reports and analytics with PDF/Excel export
│   │   ├── students/            # Student management (Admin)
│   │   ├── subjects/            # Subject management (Admin)
│   │   └── utils/               # Server-side auth utilities
│   ├── api/                     # API routes
│   │   ├── ai-chat/             # AI assistant endpoint
│   │   ├── assignments/         # Assignment CRUD + [id] route
│   │   ├── attendance/          # Attendance CRUD
│   │   ├── auth/                # Auth endpoints (login, logout, refresh, session, forgot/reset-password)
│   │   ├── classes/             # Class CRUD
│   │   ├── dashboard/stats/     # Dashboard statistics
│   │   ├── lectures/            # Lecture CRUD
│   │   ├── logs/                # Activity log retrieval
│   │   ├── professors/          # Professor CRUD + [id] route
│   │   ├── registry/            # Registry data with cascade filtering
│   │   ├── reports/             # Report generation with filtering
│   │   ├── students/            # Student CRUD
│   │   ├── subjects/            # Subject CRUD
│   │   └── test-email/          # Email testing endpoint
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                  # Reusable React components
│   ├── ai/                      # AI chat component
│   │   └── AIAgentChat.tsx
│   ├── assignments/             # Assignment forms and data grid
│   │   ├── AddAssignmentCard.tsx
│   │   ├── AddAssignmentForm.tsx
│   │   ├── AssignmentsDataGrid.tsx
│   │   └── EditAssignmentForm.tsx
│   ├── classes/                 # Class forms
│   │   ├── AddClassForm.tsx
│   │   └── EditClassForm.tsx
│   ├── lectures/                # Lecture forms and data grid
│   │   ├── AddLectureCard.tsx
│   │   ├── AddLectureForm.tsx
│   │   ├── EditLectureForm.tsx
│   │   └── LecturesDataGrid.tsx
│   ├── professors/              # Professor forms
│   │   ├── AddProfessorForm.tsx
│   │   └── EditProfessorForm.tsx
│   ├── students/                # Student forms
│   │   ├── AddStudentForm.tsx
│   │   └── EditStudentForm.tsx
│   ├── subjects/                # Subject forms
│   │   ├── AddSubjectForm.tsx
│   │   └── EditSubjectForm.tsx
│   └── ui/                      # Shared UI components
│       ├── Alert.tsx            # Alert notifications
│       ├── Card.tsx             # Card wrapper
│       ├── CommonDataGrid.tsx   # Reusable DevExtreme data grid
│       ├── Header.tsx           # Navigation header
│       ├── Loader.tsx           # Loading spinner
│       ├── Modal.tsx            # Modal dialog
│       ├── Skeleton.tsx         # Loading skeleton
│       └── Tooltip.tsx          # Tooltip component
├── constants/                   # Application constants
│   ├── attendanceStatus.ts      # Attendance status definitions
│   ├── index.ts                 # Secret key config
│   └── navigation.ts           # Navigation menu items
├── contexts/                    # React contexts
│   ├── NotifyContext.tsx        # Notification system (toast messages)
│   └── TanstackProvider.tsx    # TanStack Query client provider
├── docs/                        # Documentation
│   ├── AI_ASSISTANT.md          # AI assistant documentation
│   ├── ATTENDANCE_BACKUP.md     # Backup and restore guide
│   └── SESSION_MANAGEMENT.md   # Auth and session guide
├── hooks/                       # Custom React hooks
│   ├── functions.tsx            # Re-exports (handleLogout, utilities)
│   ├── useAssignments.ts       # Assignments query/mutations
│   ├── useAuth.ts              # Authentication hook
│   ├── useClasses.ts           # Classes query/mutations
│   ├── useProfessors.ts        # Professors query/mutations
│   ├── useSessionRefresh.ts    # Automatic session refresh
│   ├── useStudents.ts          # Students query/mutations
│   └── useSubjects.ts          # Subjects query/mutations
├── lib/                         # Shared utility libraries
│   ├── activityLogger.ts       # Activity logging for audit trail
│   ├── auth.ts                 # Server-side auth (requireAuth, requireAdmin)
│   ├── authUtils.ts            # Auth utility functions
│   ├── tokens.ts               # Token creation, verification, and cookie serialization
│   ├── devextremeConfig.ts     # DevExtreme configuration
│   ├── emailService.ts         # Email sending via Nodemailer
│   ├── export.ts               # createExportHandler() for PDF/Excel
│   ├── utils.ts                # Shared utilities (cn, formatDate, getLabelColor, etc.)
│   └── openai/                  # OpenAI integration
│       ├── functionHandlers.ts  # Function call handlers
│       └── functions.ts         # Function definitions for AI
├── services/                    # Service layer (API abstraction)
│   ├── api-client.ts           # Centralized HTTP client with ApiError
│   ├── index.ts                # Barrel exports
│   ├── assignment.service.ts   # Assignment API operations
│   ├── attendance.service.ts   # Attendance API operations
│   ├── auth.service.ts         # Auth API operations
│   ├── class.service.ts        # Class API operations
│   ├── dashboard.service.ts    # Dashboard API operations
│   ├── lecture.service.ts      # Lecture API operations
│   ├── professor.service.ts    # Professor API operations
│   ├── report.service.ts       # Report API operations
│   ├── student.service.ts      # Student API operations
│   └── subject.service.ts      # Subject API operations
├── prisma/                      # Database configuration
│   ├── schema.prisma           # Prisma schema (14 models)
│   ├── prisma.ts               # Prisma client singleton
│   ├── seed.ts                 # Database seeder
│   ├── backup-attendance.ts    # Attendance backup script
│   ├── backup-lectures.ts     # Lectures backup script
│   ├── seeds/                  # Seed data files
│   │   ├── students/           # Student data by class
│   │   ├── attendance-*.ts     # Attendance seed data
│   │   ├── classes.ts
│   │   ├── professors.ts
│   │   ├── programs.ts
│   │   ├── subjects.ts
│   │   ├── teaching-assignments.ts
│   │   └── teaching-types.ts
│   └── migrations/             # Database migrations
├── public/                      # Static assets
│   └── images/                 # Logo and icons
├── proxy.ts                    # Auth proxy (JWT validation, transparent token refresh)
├── types.ts                    # Centralized TypeScript type definitions
├── eslint.config.mjs           # ESLint flat config
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable              | Description                        | Required |
| --------------------- | ---------------------------------- | -------- |
| `DATABASE_URL`        | MySQL connection string            | Yes      |
| `SHADOW_DATABASE_URL` | Shadow database for migrations     | Yes      |
| `SECRET_KEY`          | JWT signing secret                 | Yes      |
| `OPENAI_API_KEY`      | OpenAI API key (for AI assistant)  | No       |
| `EMAIL_USER`          | Nodemailer email address           | No       |
| `EMAIL_PASS`          | Nodemailer email password          | No       |

### Application Settings

- **Port**: 9900 (configured in package.json)
- **Access Token Duration**: 15 minutes (auto-refreshed by proxy and API client)
- **Refresh Token Duration**: 7 days (rotated on each refresh, stored in DB for revocation)
- **Password Hash Rounds**: 10 (bcrypt)

## 🛠️ Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Clean install dependencies
npm run clean-install

# Seed database
npm run db:seed
```

### Database Operations

```bash
# Push schema changes (no migration file)
npx prisma db push

# Generate Prisma Client after schema changes
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ Development only!)
npx prisma migrate reset
```

### Adding a New Feature

1. **Update Database Schema** (if needed)

   - Edit `prisma/schema.prisma`
   - Run `npx prisma db push`
   - Run `npx prisma generate`
   - Add TypeScript types to `types.ts`

2. **Create Service Layer**

   - Create `services/[feature].service.ts`
   - Use `apiClient` from `services/api-client.ts` for HTTP calls
   - Export from `services/index.ts`

3. **Create API Endpoints**

   - Create route file in `app/api/[feature]/route.ts`
   - Use `requireAuth()` or `requireAdmin()` from `lib/auth.ts`
   - Add `logActivity()` calls for audit trail
   - Add alphabetical sorting with `orderBy` clauses

4. **Create Custom Hook**

   - Create `hooks/use[Feature].ts`
   - Use service functions for `queryFn` / `mutationFn`
   - Follow the mutation pattern: `onSuccess` → invalidate + notify, `onError` → notify error

5. **Create UI Components**

   - Add page in `app/(pages)/[feature]/page.tsx` (Server Component)
   - Add client component in `app/(pages)/[feature]/ClientComponent.tsx`
   - Create forms in `components/[feature]/Add[Feature]Form.tsx` and `Edit[Feature]Form.tsx`
   - Use `CommonDataGrid` from `components/ui/` for data tables
   - Use `createExportHandler()` from `lib/export.ts` for PDF/Excel export

6. **Add Navigation**
   - Update `constants/navigation.ts` with new menu item
   - Set `adminOnly: true` if admin-restricted

### Performance Best Practices

- **Service Layer**: All API calls go through typed service functions — never use raw `fetch` in components
- **Cascade Filtering**: Include filter parameters in queryKey only when they affect the API response
- **Stale Data**: Use `staleTime: 0` for filter-dependent queries; remove cache on filter changes with `queryClient.removeQueries()`
- **Memoization**: Use React.memo(), useCallback(), and useMemo() appropriately
- **Export**: Use `createExportHandler()` factory from `lib/export.ts` for consistent PDF/Excel export

## 📚 Documentation

### Additional Documentation

- **[Session Management](./docs/SESSION_MANAGEMENT.md)** - Detailed guide on authentication, JWT handling, and session refresh mechanisms
- **[Attendance Backup](./docs/ATTENDANCE_BACKUP.md)** - Complete guide for backing up and restoring attendance data
- **[AI Assistant](./docs/AI_ASSISTANT.md)** - AI chat assistant features and function calling integration

## 📝 API Documentation

### Authentication

#### POST `/api/auth/login`

Login with username and password.

**Request Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:

```json
{
  "professorId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": true
}
```

#### POST `/api/auth/logout`

Logout and clear session cookie.

#### POST `/api/auth/refresh`

Rotate access + refresh tokens. Returns a new token pair and revokes the old refresh token in the database. Called automatically by `useSessionRefresh` hook and the API client's 401 interceptor.

#### POST `/api/auth/forgot-password`

Send password reset email.

#### POST `/api/auth/reset-password`

Reset password using token from email.

### Professors (Admin Only)

#### GET `/api/professors`

Get all professors.

#### POST `/api/professors`

Create a new professor.

#### PUT `/api/professors/[id]`

Update professor details.

#### DELETE `/api/professors/[id]`

Delete a professor.

### Classes (Admin Only)

#### GET `/api/classes`

Get all classes with program and student details.

#### POST `/api/classes`

Create a new class.

### Students (Admin Only)

#### GET `/api/students`

Get all students with class details.

#### POST `/api/students`

Create a new student.

### Subjects (Admin Only)

#### GET `/api/subjects`

Get all subjects with program details.

#### POST `/api/subjects`

Create a new subject.

### Teaching Assignments (Admin Only)

#### GET `/api/assignments`

Get all teaching assignments.

#### POST `/api/assignments`

Create a teaching assignment.

### Lectures

#### GET `/api/lectures`

Get lectures (filtered by professor if not admin).

#### POST `/api/lectures`

Create a new lecture.

### Attendance

#### GET `/api/attendance`

Get attendance records.

#### POST `/api/attendance`

Mark attendance for students.

### Reports

#### POST `/api/reports`

Generate attendance report.

## 🌐 Internationalization

The application uses Albanian language labels for the UI:

- **Dashboard** - Paneli
- **Klasat** - Classes
- **Studentët** - Students
- **Profesorët** - Professors
- **Kurset** - Subjects/Courses
- **Caktime** - Assignments
- **Leksionet** - Lectures
- **Listëprezenca** - Attendance
- **Regjistri** - Registry (Student attendance status tracking)
- **Raporte** - Reports
- **NK** - Nuk Kalon (Does not pass - >30% absences)
- **OK** - Student passing (≤30% absences)

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **Dual-Token JWT Authentication**: Short-lived access token (15 min) + long-lived refresh token (7 days) with automatic rotation
- **Database-Backed Revocation**: Refresh tokens stored in DB with `jti` claim for instant revocation
- **Token Rotation & Theft Detection**: Each refresh invalidates the old token; reuse of revoked tokens triggers family-wide revocation
- **HTTP-only Cookies**: Prevents XSS attacks on both tokens
- **Role-based Access Control**: Admin and Professor roles via `requireAuth()` / `requireAdmin()`
- **Protected Routes**: Proxy validates all protected routes with transparent token refresh
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Activity Logging**: All CRUD operations logged for audit trail

## 🧪 Testing

Currently, the project does not include automated tests. Contributions are welcome!

## 📊 Database ERD

```
┌─────────────┐       ┌──────────────────────┐       ┌─────────┐
│  Professor  │──────▶│ TeachingAssignment   │◀──────│ Subject │
│             │       │                      │       │         │
│ id          │       │ professorId          │       │ id      │
│ firstName   │       │ subjectId            │       │ code    │
│ lastName    │       │ classId              │       │ name    │
│ username    │       │ typeId               │       │ program │
│ email       │       └──────────────────────┘       └─────────┘
│ password    │                │                          │
│ isAdmin     │                │                          │
└─────────────┘                │                          │
       │                       │                          │
       │                       ▼                          │
       │                  ┌────────┐                      │
       │                  │ Class  │◀─────────────────────┘
       │                  │        │
       │                  │ id     │
       │                  │ name   │
       │                  │ program│
       │                  └────────┘
       │                       │
       │                       │
       ▼                       ▼
  ┌─────────┐            ┌─────────┐
  │ Lecture │            │ Student │
  │         │            │         │
  │ id      │            │ id      │
  │ date    │            │ name    │
  │ class   │            │ class   │
  │ subject │            └─────────┘
  │ type    │                 │
  └─────────┘                 │
       │                      │
       └──────────┬───────────┘
                  ▼
            ┌────────────┐
            │ Attendance │
            │            │
            │ id         │
            │ studentId  │
            │ lectureId  │
            │ status     │
            └────────────┘
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for type safety (centralized types in `types.ts`)
- Follow the service layer pattern for API calls
- Use Prisma for database operations
- Use `requireAuth()` / `requireAdmin()` for route protection
- Add `logActivity()` for audit trail on mutations
- Implement proper error handling with `ApiError`
- Add comments for complex logic
- Use meaningful variable names

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**sayjin93**

- GitHub: [@sayjin93](https://github.com/sayjin93)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database managed with [Prisma](https://www.prisma.io/)
- Data grids by [DevExtreme](https://js.devexpress.com/)
- AI powered by [OpenAI](https://openai.com/)
- Server state with [TanStack Query](https://tanstack.com/query)
- Icons from [Heroicons](https://heroicons.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for educational institutions**

# 📚 Attendance Management System

A modern, full-stack attendance management system built for educational institutions with role-based access control, real-time data synchronization, and comprehensive reporting capabilities.

## 🌟 Features

### For Administrators

- **Complete CRUD Operations**: Manage classes, students, professors, subjects, and teaching assignments
- **Program Management**: Handle multiple academic programs (Bachelor, Master)
- **Subject & Course Management**: Create and assign subjects with unique codes
- **Teaching Assignments**: Assign professors to specific subjects, classes, and teaching types (Lecture/Seminar)
- **User Management**: Create and manage professor accounts with admin privileges
- **Comprehensive Reports**: Generate detailed attendance reports with PDF export

### For Professors

- **Lecture Management**: Create and manage lectures for assigned subjects
- **Attendance Tracking**: Mark student attendance with three statuses:
  - ✅ **PRESENT** - Student attended the lecture
  - ❌ **ABSENT** - Student was absent
  - 🎯 **PARTICIPATED** - Student actively participated
- **Real-time Dashboard**: View statistics and upcoming lectures
- **Student Reports**: Access attendance data for assigned classes

### General Features

- 🔐 **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- 🎨 **Modern UI**: Clean, responsive interface with Albanian language support
- 🔄 **Real-time Updates**: TanStack Query for optimistic UI updates
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Tech Stack

**Frontend**

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- [TanStack Query 5](https://tanstack.com/query) - Server state management
- [Headless UI 2](https://headlessui.com/) - Accessible UI components
- [Heroicons 2](https://heroicons.com/) - Icon library
- [Framer Motion 12](https://www.framer.com/motion/) - Animations

**Backend**

- [Prisma ORM 6](https://www.prisma.io/) - Database toolkit
- [MySQL](https://www.mysql.com/) - Relational database
- [jose](https://github.com/panva/jose) - JWT implementation
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing

**Development Tools**

- [Turbopack](https://turbo.build/pack) - Fast bundler
- [ESLint 9](https://eslint.org/) - Code linting
- [tsx](https://github.com/esbuild-kit/tsx) - TypeScript execution

### Architecture Patterns

#### Hybrid SSR/Client Pattern

The application uses a hybrid rendering approach:

- **Server Components**: Fetch authentication data and initial page data
- **Client Components**: Handle user interactions and client-side state
- **Data Flow**: Server → Client Component props → TanStack Query hooks

```typescript
// Server Layout (app/(pages)/layout.tsx)
export default async function RootLayout({ children }) {
  const { professorId, isAdmin } = await getAuthHeaders();
  return (
    <ClientLayout professorId={professorId} isAdmin={isAdmin}>
      {children}
    </ClientLayout>
  );
}

// Client Component
export default function PageClient({ professorId }: { professorId: string }) {
  const { data } = useQuery({
    queryKey: ["data", professorId],
    queryFn: fetchData,
  });
}
```

#### Authentication Flow

1. **Login**: User credentials → `/api/auth/login` → JWT stored in HTTP-only cookie
2. **Middleware**: `proxy.ts` validates JWT, injects auth headers (`X-Professor-Id`, `X-Is-Admin`)
3. **Server Auth**: `getAuthHeaders()` extracts auth from headers in Server Components
4. **API Auth**: `authenticateRequest()` validates JWT in API routes
5. **Protected Routes**: All `/(pages)/*` and `/api/*` routes require authentication

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

- Node.js 18+ and npm/yarn
- MySQL database server
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
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/attendance"
   SHADOW_DATABASE_URL="mysql://username:password@localhost:3306/attendance_shadow"
   SECRET_KEY="your-secure-secret-key-here"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Migrationn creation
   npx prisma migrate dev --name init

   # Migrate reset & Seed
   npx prisma migrate reset --force

   # Seed initial data (optional)
   npx tsx prisma/seed.ts
   ```

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
│   ├── (auth)/              # Authentication pages
│   │   └── login/           # Login page
│   ├── (pages)/             # Protected pages (requires auth)
│   │   ├── dashboard/       # Dashboard with statistics
│   │   ├── classes/         # Class management (Admin)
│   │   ├── students/        # Student management (Admin)
│   │   ├── professors/      # Professor management (Admin)
│   │   ├── subjects/        # Subject management (Admin)
│   │   ├── assignments/     # Teaching assignments (Admin)
│   │   ├── lectures/        # Lecture management
│   │   ├── attendance/      # Attendance tracking
│   │   ├── reports/         # Reports and analytics
│   │   └── utils/           # Server utilities
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── classes/         # Class CRUD
│   │   ├── students/        # Student CRUD
│   │   ├── professors/      # Professor CRUD
│   │   ├── subjects/        # Subject CRUD
│   │   ├── assignments/     # Assignment CRUD
│   │   ├── lectures/        # Lecture CRUD
│   │   ├── attendance/      # Attendance CRUD
│   │   └── reports/         # Report generation
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
│   ├── Add*Form.tsx         # Create entity forms
│   ├── Edit*Form.tsx        # Update entity forms
│   ├── Header.tsx           # Navigation header
│   ├── Modal.tsx            # Modal dialog
│   ├── Card.tsx             # Card component
│   ├── Alert.tsx            # Alert notifications
│   └── Loader.tsx           # Loading spinner
├── constants/               # Application constants
│   ├── index.ts             # Secret key config
│   └── navigation.ts        # Navigation menu items
├── contexts/                # React contexts
│   ├── NotifyContext.tsx    # Notification system
│   └── TanstackProvider.tsx # Query client provider
├── hooks/                   # Custom React hooks
│   ├── fetchFunctions.tsx   # API fetch functions
│   ├── functions.tsx        # Utility functions
│   └── useAuth.ts           # Authentication hook
├── prisma/                  # Database configuration
│   ├── schema.prisma        # Prisma schema
│   ├── seed.ts              # Database seeder
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── proxy.ts                 # Authentication middleware
├── types.ts                 # TypeScript type definitions
└── package.json             # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable              | Description                    | Required |
| --------------------- | ------------------------------ | -------- |
| `DATABASE_URL`        | MySQL connection string        | Yes      |
| `SHADOW_DATABASE_URL` | Shadow database for migrations | Yes      |
| `SECRET_KEY`          | JWT signing secret             | Yes      |

### Application Settings

- **Port**: 9900 (configured in package.json)
- **Session Duration**: 1 hour (JWT expiry)
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

2. **Create API Endpoints**

   - Create route file in `app/api/[feature]/route.ts`
   - Implement authentication with `authenticateRequest()`
   - Add role-based access control

3. **Create UI Components**

   - Add page in `app/(pages)/[feature]/page.tsx` (Server Component)
   - Add client component in `app/(pages)/[feature]/ClientComponent.tsx`
   - Create forms in `components/Add[Feature]Form.tsx` and `components/Edit[Feature]Form.tsx`

4. **Add Navigation**
   - Update `constants/navigation.ts` with new menu item
   - Set `adminOnly: true` if admin-restricted

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

- **Klasat** - Classes
- **Studentët** - Students
- **Profesorët** - Professors
- **Kurset** - Subjects/Courses
- **Caktime** - Assignments
- **Leksionet** - Lectures
- **Listëprezenca** - Attendance
- **Raporte** - Reports

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth
- **HTTP-only Cookies**: Prevents XSS attacks
- **Role-based Access Control**: Admin and Professor roles
- **Protected Routes**: Middleware validates all protected routes
- **SQL Injection Prevention**: Prisma ORM parameterized queries

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

- Use TypeScript for type safety
- Follow the existing project structure
- Use Prisma for database operations
- Implement proper error handling
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
- UI components from [Headless UI](https://headlessui.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for educational institutions**

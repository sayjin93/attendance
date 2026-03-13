# Attendance Data Backup & Restore

## Qëllimi

Ky sistem mundëson backup dhe restore të të dhënave të prezencës (attendance) për t'u mbrojtur nga humbja e të dhënave gjatë operacioneve të database reset ose migration.

## Si të Krijoni Backup

### Hapi 1: Ekzekuto Script-in e Backup

Për të krijuar një backup të të dhënave aktuale të attendance:

```bash
npx tsx prisma/backup-attendance.ts
```

Ky komandë do të:
1. Lexojë të gjitha të dhënat e attendance nga databaza
2. Krijojë një skedar `prisma/seeds/attendance.ts`
3. Përfshijë metadata (emrat e studentëve, klasat, datat, subjektet) si komente
4. Gjenerojë një funksion `seedAttendance()` për restore

### Hapi 2: Verifiko Backup-in

Kontrollo që skedari është krijuar:

```bash
ls prisma/seeds/attendance.ts
```

Shiko përmbajtjen:

```bash
cat prisma/seeds/attendance.ts
```

## Si të Riktheni (Restore) Backup

### Automatik (Gjatë Seed)

Backup-i do të rikthehet automatikisht kur ekzekutoni:

```bash
npx prisma db seed
```

Seed script-i kontrollon nëse ekziston `attendance.ts` dhe e importon automatikisht.

### Manual

Nëse doni të riktheni vetëm attendance pa ekzekutuar gjithë seed:

```typescript
import { PrismaClient } from "@prisma/client";
import { seedAttendance } from "./prisma/seeds/attendance";

const prisma = new PrismaClient();

seedAttendance(prisma)
  .then(() => {
    console.log("✅ Attendance restored successfully");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error("❌ Error restoring attendance:", e);
    prisma.$disconnect();
    process.exit(1);
  });
```

## Workflow i Rekomanduar

### Para Database Reset

```bash
# 1. Krijo backup
npx tsx prisma/backup-attendance.ts

# 2. Verifiko që backup është krijuar
ls prisma/seeds/attendance.ts

# 3. Tani mund të resetosh database-n me siguri
npx prisma migrate reset
```

### Pas Database Reset

Backup-i do të rikthehet automatikisht kur seed ekzekutohet nga `prisma migrate reset`.

### Para Schema Changes

```bash
# 1. Krijo backup të attendance
npx tsx prisma/backup-attendance.ts

# 2. Bëj ndryshimet në schema.prisma
code prisma/schema.prisma

# 3. Krijo migration
npx prisma migrate dev --name "your_change_description"

# 4. Nëse diçka shkon gabim, restore backup
npx prisma db seed
```

## Struktura e Backup

Skedari i gjeneruar ka këtë strukturë:

```typescript
export interface AttendanceBackup {
  studentId: number;
  lectureId: number;
  statusId: number;
}

export const attendanceBackupData: AttendanceBackup[] = [
  // Student: Emri Mbiemri | Class: Klasa | Date: 2024-01-15 | Subject: Matematika | Status: PRESENT
  { studentId: 1, lectureId: 1, statusId: 1 },
  // ...
];

export async function seedAttendance(prisma: PrismaClient) {
  console.log("📝 Seeding attendance data...");
  
  for (const attendance of attendanceBackupData) {
    await prisma.attendance.upsert({
      where: {
        studentId_lectureId: {
          studentId: attendance.studentId,
          lectureId: attendance.lectureId,
        },
      },
      update: {
        statusId: attendance.statusId,
      },
      create: attendance,
    });
  }
  
  console.log(`✅ Seeded ${attendanceBackupData.length} attendance records`);
}
```

## Best Practices

### 1. Backup i Rregullt

Krijo backup para çdo operacioni të rrezikshëm:
- Database reset
- Schema changes
- Bulk data operations
- Testing në production data

### 2. Version Control

**RIKUJDES:** Mos i vendos backup files në Git nëse përmbajnë të dhëna sensitive.

Shto në `.gitignore`:
```
prisma/seeds/attendance.ts
```

### 3. Dokumentimi

Skedari i backup përfshin metadata si komente për lexueshmëri:
```typescript
// Student: Agon Bytyqi | Class: 1A | Date: 2024-01-15 | Subject: Matematika | Status: PRESENT
```

### 4. Testing

Para se të përdorësh backup në production:
1. Testo në development database
2. Verifiko që të gjitha records janë rikthyer
3. Kontrollo integritetin e të dhënave

## Troubleshooting

### Error: Module not found './seeds/attendance'

Kjo është normale nëse nuk ke krijuar backup akoma. Seed script-i do të anashkalojë backup-in nëse skedari nuk ekziston.

**Zgjidhja:** Krijo backup me `npx tsx prisma/backup-attendance.ts`

### Error: Foreign key constraint fails

Sigurohu që të gjitha entities tjera janë seeded para attendance:
- Professors
- Programs
- Teaching Types
- Attendance Statuses
- Classes
- Subjects
- Teaching Assignments
- Students

Seed script-i në `prisma/seed.ts` e respekton këtë rend automatikisht.

### Duplicate key errors

Backup përdor `upsert` në vend të `create`, kështu që nuk krijon duplicate records. Nëse megjithatë ndodh:

1. Kontrollo që `studentId_lectureId` unique constraint ekziston
2. Verifiko që backup data nuk ka duplicates

## Statistikat

Script-i i backup shfaq statistika për çdo status:

```
Attendance by Status:
  PRESENT: 150 records
  ABSENT: 23 records
  PARTICIPATED: 45 records
  LEAVE: 12 records
Total: 230 attendance records backed up
```

Kjo të ndihmon të verifikosh që të gjitha të dhënat janë exportuar.

## Shembuj Përdorimi

### Scenario 1: Development Reset

```bash
# Krijo backup
npx tsx prisma/backup-attendance.ts

# Reset për të testuar migrations
npx prisma migrate reset

# Attendance rikthehet automatikisht
```

### Scenario 2: Production Migration

```bash
# 1. Krijo backup në production
npx tsx prisma/backup-attendance.ts

# 2. Download backup file lokalisht
scp user@server:/path/to/attendance.ts ./local-backup/

# 3. Test migration në development
npx prisma migrate dev

# 4. Nëse sukses, apliko në production
npx prisma migrate deploy

# 5. Restore backup nëse nevojitet
npx prisma db seed
```

### Scenario 3: Data Recovery

```bash
# Nëse attendance është fshirë aksidentalisht
npx prisma db seed  # Restore nga backup-i i fundit
```

## Shënime Teknike

- **Database:** MySQL
- **ORM:** Prisma 6
- **Language:** TypeScript
- **Runtime:** Node.js (tsx)
- **Backup Method:** Upsert-based restoration
- **Foreign Keys:** Preserved via ID references
- **Unique Constraint:** studentId + lectureId composite key

## Supporti

Për probleme ose pyetje, referohu dokumentacionit kryesor në `README.md` ose kontakto development team.

# Student Seed Files

This directory contains separate seed files for each class. You can run them individually to seed students for specific classes.

## Available Seed Files

### Bachelor Program
- `students-INF205.ts` - Seeds 19 students for class INF205 (Class ID: 5)
- `students-INF206.ts` - Seeds 1 student for class INF206 (Class ID: 6)
- `students-Infoek202.ts` - Seeds 31 students for class Infoek202 (Class ID: 8)

### Master Program
- `students-MSH1IE.ts` - Seeds 31 students for class MSH1IE (Class ID: 11)
- `students-MSH1TI.ts` - Seeds 15 students for class MSH1TI (Class ID: 14)

## How to Run

To seed students for a specific class, run:

```bash
# Bachelor Classes
npx tsx prisma/seeds/students-INF205.ts
npx tsx prisma/seeds/students-INF206.ts
npx tsx prisma/seeds/students-Infoek202.ts

# Master Classes
npx tsx prisma/seeds/students-MSH1IE.ts
npx tsx prisma/seeds/students-MSH1TI.ts
```

## Run All Seeds

To seed all students at once:

```bash
npx tsx prisma/seeds/students-INF205.ts; npx tsx prisma/seeds/students-INF206.ts; npx tsx prisma/seeds/students-Infoek202.ts; npx tsx prisma/seeds/students-MSH1IE.ts; npx tsx prisma/seeds/students-MSH1TI.ts
```

## Notes

- Each seed file uses `skipDuplicates: true` to prevent errors if students already exist
- You can modify the student data in each file independently
- Make sure the class IDs exist in your database before running these seeds
- Total students across all classes: 97

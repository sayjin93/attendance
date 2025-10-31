# Student Seed Files

This directory contains separate seed files for each class. You can run them individually to seed students for specific classes.

## Available Seed Files

### Bachelor Program
- `students-INF205.ts` - Seeds 21 (-3 to 206) students for class INF205 (Class ID: 5)
- `students-INF206.ts` - Seeds 12 students for class INF206 (Class ID: 6)
- `students-Infoek202.ts` - Seeds 35 students for class Infoek202 (Class ID: 8)

### Master Program
- `students-MSH1IE.ts` - Seeds 51 students for class MSH1IE (Class ID: 11)
- `students-MSH1TI.ts` - Seeds 17 students for class MSH1TI (Class ID: 14)
- `students-MSH1INFA.ts` - Seeds 1 students for class MSH1INFA (Class ID: 15)
- `students-MSH1INFB.ts` - Seeds 1 students for class MSH1INFB (Class ID: 16)

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
npx tsx prisma/seeds/students-MSH1INFA.ts
npx tsx prisma/seeds/students-MSH1INFB.ts
```

## Run All Seeds

To seed all students at once:

```bash
npx tsx prisma/seeds/students-INF205.ts; npx tsx prisma/seeds/students-INF206.ts; npx tsx prisma/seeds/students-Infoek202.ts; npx tsx prisma/seeds/students-MSH1IE.ts; npx tsx prisma/seeds/students-MSH1TI.ts; npx tsx prisma/seeds/students-MSH1INFA.ts; npx tsx prisma/seeds/students-MSH1INFB.ts
```

## Notes

- Each seed file uses `skipDuplicates: true` to prevent errors if students already exist
- You can modify the student data in each file independently
- Make sure the class IDs exist in your database before running these seeds
- Total students across all classes: 138

## Getting Started

To create a hashed password:

```bash
node

const bcrypt = require("bcryptjs");

bcrypt.hash("supersecurepassword", 10).then(console.log);
```
<br />

Params should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis

```bash
npx @next/codemod@canary next-async-request-api .
```

<br />

Regenerate prisma schema

```bash
npx prisma generate

```
<br />


Rikrijo databazen

```bash
npx prisma migrate dev --name init
```
<br />

### API calls:

| Request | Behavior |
|---------|----------|
| `/api/classes?professorId=123` | 🚀 Returns **only classes** |
| `/api/classes?professorId=123&includeStudents=true` | ✅ Returns **classes with students** |
| `/api/classes?professorId=123&includeLectures=true` | ✅ Returns **classes with lectures** |
| `/api/classes?professorId=123&includeStudents=true&includeLectures=true` | ✅ Returns **classes with students + lectures** |

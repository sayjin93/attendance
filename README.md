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

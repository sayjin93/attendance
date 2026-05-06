import { PrismaClient } from "./generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export { PrismaClient };

function parseDatabaseUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `Invalid DATABASE_URL: expected a connection string like "mysql://user:password@host:3306/database", but got ${JSON.stringify(url)}. Check your .env file.`,
    );
  }
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace("/", ""),
  };
}

export function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL environment variable. Define it in your .env file (e.g. DATABASE_URL=\"mysql://user:password@localhost:3306/attendance\").",
    );
  }
  const adapter = new PrismaMariaDb(parseDatabaseUrl(url));
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

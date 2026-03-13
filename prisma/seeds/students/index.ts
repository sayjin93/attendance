import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { PrismaClient } from "../../prisma";

export async function seedAllStudents(prisma: PrismaClient) {
  console.log("👥 Seeding all students...");

  const dir = path.dirname(__filename);
  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith("students-") && f.endsWith(".ts"))
    .sort();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const mod = await import(pathToFileURL(filePath).href);
    const fn = Object.values(mod).find((v) => typeof v === "function") as
      | ((prisma: PrismaClient) => Promise<void>)
      | undefined;
    if (fn) await fn(prisma);
  }

  console.log("✅ All students seeded successfully!");
}
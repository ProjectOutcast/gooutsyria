import { defineConfig } from "prisma/config";

// load .env when present (no-op in containers where env comes from the platform)
try {
  process.loadEnvFile();
} catch {
  // no .env file — fine
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

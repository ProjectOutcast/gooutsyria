/**
 * CLI demo seed for Go Out Syria (destructive: wipes all data first).
 * For a non-destructive insert on a live database, use the admin panel's
 * "توليد بيانات تجريبية" button instead.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDemoData } from "../src/lib/demo-seed";

try {
  process.loadEnvFile();
} catch {
  // no .env file — env comes from the platform
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("seeding (destructive)…");

  // wipe (order matters for FKs without cascade)
  await db.metricDaily.deleteMany();
  await db.featuredPlacement.deleteMany();
  await db.sponsorSlot.deleteMany();
  await db.collectionItem.deleteMany();
  await db.collection.deleteMany();
  await db.ownerClaim.deleteMany();
  await db.review.deleteMany();
  await db.offer.deleteMany();
  await db.photo.deleteMany();
  await db.menuItem.deleteMany();
  await db.menuSection.deleteMany();
  await db.restaurant.deleteMany();
  await db.neighborhood.deleteMany();
  await db.cuisine.deleteMany();
  await db.feature.deleteMany();
  await db.city.deleteMany();
  await db.user.deleteMany();

  await db.user.create({
    data: {
      name: "إدارة المنصة",
      email: "admin@gooutsyria.com",
      passwordHash: await bcrypt.hash("Admin1234!", 10),
      role: "ADMIN",
    },
  });

  const result = await seedDemoData(db);

  console.log(`
✓ seeded: ${result.createdRestaurants} restaurants, ${result.createdCollections} collections

  demo accounts:
  admin: admin@gooutsyria.com / Admin1234!
  owner: owner@gooutsyria.com / Owner1234!  (owns 3 restaurants)
  user:  user@gooutsyria.com  / User1234!
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

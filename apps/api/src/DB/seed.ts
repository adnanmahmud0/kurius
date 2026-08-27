import { logger } from "../shared/logger";
import prisma from "../shared/prisma";
import { seedSuperAdmin } from "./seedAdmin";

async function run() {
  try {
    await prisma.$connect();
    await seedSuperAdmin();
    logger.info("Database seeding completed successfully.");
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

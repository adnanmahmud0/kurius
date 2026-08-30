import colors from "colors";

import { logger } from "../shared/logger";
import prisma from "../shared/prisma";

/**
 * Self-healing schema synchronization to ensure new columns and tables
 * are present in production databases even if migrations were not manually run.
 */
export async function syncDatabaseSchema(): Promise<void> {
  try {
    // 1. Ensure Category.thumbnail column exists
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "thumbnail" TEXT;`
    );

    // 2. Ensure LegalPolicy table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LegalPolicy" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LegalPolicy_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "LegalPolicy_type_key" ON "LegalPolicy"("type");
    `);

    // 3. Ensure MotivationalMessage table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MotivationalMessage" (
        "id" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "author" TEXT,
        "status" "Status" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MotivationalMessage_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "MotivationalMessage_status_idx" ON "MotivationalMessage"("status");
    `);

    // 4. Ensure User security columns exist
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authOneTimeCodeAttempts" INTEGER DEFAULT 0;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authLockUntil" TIMESTAMP(3);`
    );

    // 5. Ensure Performance Indexes exist
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Video_status_createdAt_idx" ON "Video"("status", "createdAt");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Video_categoryId_status_idx" ON "Video"("categoryId", "status");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Video_createdBy_idx" ON "Video"("createdBy");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "VideoView_userId_videoId_viewedAt_idx" ON "VideoView"("userId", "videoId", "viewedAt");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "VideoView_viewedAt_idx" ON "VideoView"("viewedAt");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Comment_videoId_status_createdAt_idx" ON "Comment"("videoId", "status", "createdAt");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "Comment"("userId");`
    );

    logger.info(colors.green("✅ Database schema synchronized"));
  } catch (error) {
    logger.warn(colors.yellow(`⚠️ Schema sync warning: ${(error as Error).message}`));
  }
}

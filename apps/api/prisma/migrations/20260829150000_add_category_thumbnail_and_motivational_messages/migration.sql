-- AlterTable
ALTER TABLE "Category" ADD COLUMN "thumbnail" TEXT;

-- CreateTable
CREATE TABLE "MotivationalMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotivationalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MotivationalMessage_status_idx" ON "MotivationalMessage"("status");

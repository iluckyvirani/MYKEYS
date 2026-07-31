CREATE TYPE "DiaryPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "DiaryStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE "DiaryTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "DiaryPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "DiaryStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DiaryTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DiaryTask_userId_idx" ON "DiaryTask"("userId");
CREATE INDEX "DiaryTask_userId_status_idx" ON "DiaryTask"("userId", "status");
CREATE INDEX "DiaryTask_dueDate_status_idx" ON "DiaryTask"("dueDate", "status");
CREATE INDEX "DiaryTask_reminderSentAt_idx" ON "DiaryTask"("reminderSentAt");

ALTER TABLE "DiaryTask" ADD CONSTRAINT "DiaryTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

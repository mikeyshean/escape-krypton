-- DropIndex
DROP INDEX "HighScores_submittedAt_score_idx";

-- AlterTable
ALTER TABLE "HighScores" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "Taunt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Taunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMS" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "dateSent" TIMESTAMP(3),
    "dateFailed" TIMESTAMP(3),

    CONSTRAINT "SMS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HighScores_score_submittedAt_idx" ON "HighScores"("score" DESC, "submittedAt" ASC);

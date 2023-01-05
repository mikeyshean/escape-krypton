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
    "highScoreId" TEXT NOT NULL,
    "tauntId" TEXT NOT NULL,

    CONSTRAINT "SMS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SMS_highScoreId_key" ON "SMS"("highScoreId");

-- AddForeignKey
ALTER TABLE "SMS" ADD CONSTRAINT "SMS_highScoreId_fkey" FOREIGN KEY ("highScoreId") REFERENCES "HighScores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMS" ADD CONSTRAINT "SMS_tauntId_fkey" FOREIGN KEY ("tauntId") REFERENCES "Taunt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

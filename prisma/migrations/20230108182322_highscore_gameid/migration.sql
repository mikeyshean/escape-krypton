/*
  Warnings:

  - You are about to drop the column `highScore` on the `GameSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId]` on the table `HighScores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GameSession" DROP COLUMN "highScore";

-- AlterTable
ALTER TABLE "HighScores" ADD COLUMN     "gameId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HighScores_gameId_key" ON "HighScores"("gameId");

-- AddForeignKey
ALTER TABLE "HighScores" ADD CONSTRAINT "HighScores_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "HighScores_score_idx";

-- CreateIndex
CREATE INDEX "HighScores_submittedAt_score_idx" ON "HighScores"("submittedAt" DESC, "score" DESC);

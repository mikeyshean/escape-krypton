import { z } from "zod";
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from "../trpc";

const defaultScoreSelect = Prisma.validator<Prisma.HighScoresSelect>()({
  id: true,
  score: true,
  playerName: true
});

const defaultGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true,
  score: true,
  sessionId: true
});

export const scoreRouter = router({
  list: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx, input }) => {
      
      const scores = await ctx.prisma.highScores.findMany({
        select: defaultScoreSelect,
        take: 10,
        orderBy: {
          score: 'desc',
        },
      })
      return scores
    }),
  submit: publicProcedure
    .input(z.object({gameId: z.string(), sessionId: z.string(), playerName: z.string()}))
    .mutation(async ({ctx, input}) => {
      const gameId = input.gameId
      const sessionId = input.sessionId
      const playerName = input.playerName
      
      const game = await ctx.prisma.game.findUnique({
        where: {
          id: gameId,
          sessionId: sessionId,
          validated: true,
          score: {
            gt: 0
          }
        },
        select: defaultGameSelect
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Game not found`
        })
      }
      
      const highScore = await ctx.prisma.highScores.create({
        data: {
          score: game.score!,
          playerName: playerName,
          submittedAt: new Date()
        },
        select: defaultScoreSelect
      })
      return highScore
    })
})

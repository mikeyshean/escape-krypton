import { z } from "zod";
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from "../trpc";
import ScoreService from "../../score_service";

const defaultScoreSelect = Prisma.validator<Prisma.HighScoresSelect>()({
  id: true,
  score: true,
  playerName: true
});

const internalScoreSelect = Prisma.validator<Prisma.HighScoresSelect>()({
  id: true,
  score: true,
  playerName: true,
  phoneNumber: true
});

const defaultGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true,
  score: true,
  sessionId: true
});

export const scoreRouter = router({
  top10: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx, input }) => {
      
      // Get top 10 distinct scores
      const top10scores = await ctx.prisma.highScores.findMany({
        select: defaultScoreSelect,
        orderBy: {score: 'desc'},
        take: 10,
        distinct: ['score']
      })
      const topScores = top10scores.flatMap((obj) => obj.score)
      
      // Get all highscores in the top 10 values (to display duplicates)
      const scores = await ctx.prisma.highScores.findMany({
        select: defaultScoreSelect,
        where: {
          score: {
            in: topScores
          }
        },
        orderBy: [
          {score: 'desc'},
          {submittedAt: 'asc'}
        ],
      })
      let current = scores[0]?.score as number
      let rank = 1
      const rankedScores = scores.map((score) => {
        if (current != score.score) {
          current = score.score
          rank += 1
        }
        return { ...score, rank: rank}
      })

      return rankedScores
    }),

  //  For internal SMS delivery use
  top11: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx, input }) => {
      
      // Get top 11 distinct scores
      const top11scores = await ctx.prisma.highScores.findMany({
        select: internalScoreSelect,
        orderBy: {score: 'desc'},
        take: 11,
        distinct: ['score']
      })
      const topScores = top11scores.flatMap((obj) => obj.score)
      
      // Get all highscores in the top 11 values with phoneNumbers
      const scores = await ctx.prisma.highScores.findMany({
        select: internalScoreSelect,
        where: {
          score: {
            in: topScores
          }
        },
        orderBy: [
          {score: 'desc'},
          {submittedAt: 'asc'}
        ],
      })
      let current = scores[0]?.score as number
      let rank = 1
      const rankedScores = scores.map((score) => {
        if (current != score.score) {
          current = score.score
          rank += 1
        }
        return { ...score, rank: rank}
      })

      return rankedScores
    }),

  submit: publicProcedure
    .input(z.object({
      gameId: z.string(),
      sessionId: z.string(),
      playerName: z.string(),
      phoneNumber: z.string().nullable(),
      tauntId: z.string().nullable(),
    }))
    .mutation(async ({ctx, input}) => {
      const gameId = input.gameId
      const sessionId = input.sessionId
      const playerName = input.playerName
      const playerPhoneNumber = input.phoneNumber ? "+1"+input.phoneNumber : null
      const tauntId = input.tauntId
      
      const [highScore, game] = await ctx.prisma.$transaction(async () => {
        
        // Verify Game belongs to session
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

        // Save High Score
        const highScore = await ctx.prisma.highScores.create({
          data: {
            score: game.score!,
            phoneNumber: playerPhoneNumber,
            playerName: playerName,
            submittedAt: new Date(),
          },
          select: internalScoreSelect
        })

        return [highScore, game] as const
      })

      if (highScore) {
        const service = new ScoreService(highScore)
        service.sendSmsNotifications(tauntId)
      }
      const { phoneNumber, ...scoreWithoutPhone } = highScore
      
      return scoreWithoutPhone
    }),
})

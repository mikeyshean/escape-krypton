import { z } from "zod";
import { Prisma } from '@prisma/client';
import { router, publicProcedure } from "../trpc";
import { TRPCError } from '@trpc/server';
import isValidGame from '../../validate_game'

const startGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true
});

const endGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true,
  startedAt: true,
  endedAt: true,
  sessionId: true,
  score: true
});

export const gameRouter = router({
  start: publicProcedure
    .input(z.object({sessionId: z.string()}))
    .mutation(async ({ ctx, input }) => {
      const sessionId = input.sessionId
      
      const game = await ctx.prisma.game.create({
        data: {
          sessionId: sessionId
        },
        select: startGameSelect
      })
      return game
    }),
  end: publicProcedure
    .input(z.object({
      id: z.string(), 
      score: z.number(), 
      sessionId: z.string(),
      gameStartedAt: z.number(), 
      gameEndedAt: z.number(), 
      stepCount: z.number()
    }))
    .mutation(async ({ctx, input}) => {
      const id = input.id
      const score = input.score
      const sessionId = input.sessionId
      const endedAt = new Date()
      const gameStartedAt = input.gameStartedAt
      const gameEndedAt = input.gameEndedAt
      const stepCount = input.stepCount

      return await ctx.prisma.$transaction(async () => {
        const existingGame = ctx.prisma.game.findUnique({
          where: {
            id: id,
            sessionId: sessionId,
            endedAt: null
          }
        })
  
        if (!existingGame) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Valid game not found, update failed'
  
          })
        }

        const game = await ctx.prisma.game.update({
          where: {
            id: id,
            sessionId: sessionId
          },
          data: {
            endedAt: endedAt,
            score: score
          },
          select: endGameSelect
        })
        
        if (!isValidGame(game, gameStartedAt, gameEndedAt, stepCount)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `GameID: ${game.id} is invalid! Are you trying to hack my game?!`
          })
        }

        const validatedGame = ctx.prisma.game.update({
          where: {
            id: id
          },
          data: {
            validated: true
          }
        })

        return validatedGame
      })

    })

    

  
});

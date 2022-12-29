import { z } from "zod";
import { Prisma } from '@prisma/client';
import isValidScore from '../../validateGame'

import { router, publicProcedure } from "../trpc";

const startGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true
});

const endGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true,
  startedAt: true,
  endedAt: true
});

export const gameRouter = router({
  start: publicProcedure
    .input(z.object({sessionId: z.string(), startedAt: z.string().datetime()}))
    .mutation(async ({ ctx, input }) => {
      const startedAt = input.startedAt
      const sessionId = input.sessionId
      
      const game = await ctx.prisma.game.create({
        data: {
          startedAt: startedAt,
          sessionId: sessionId
        },
        select: startGameSelect
      })
      return game
    }),
  end: publicProcedure
    .input(z.object({id: z.string(), endedAt: z.string().datetime(), score: z.number()}))
    .mutation(async ({ctx, input}) => {
      const id = input.id
      const score = input.score
      const endedAt = input.endedAt

      // TODO: maybe validate session too
      const game = await ctx.prisma.game.update({
        where: {
          id: id,
        },
        data: {
          endedAt: endedAt,
          score: score
        },
        select: endGameSelect
      })
      
      // TODO: Do some validation on score
      if (isValidScore(game.startedAt, game.endedAt, score)) {
        return game 
      } else {
        console.log("H4x0r")
      }
    })
});

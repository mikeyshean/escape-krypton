import { z } from "zod";
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from "../trpc";

const defaultSessionSelect = Prisma.validator<Prisma.GameSessionSelect>()({
  id: true,
  highScore: true
});


export const gameSessionRouter = router({
  create: publicProcedure
    .input(z.boolean())
    .mutation(async ({ ctx }) => {
      const game = await ctx.prisma.gameSession.create({
        data: {},
        select: defaultSessionSelect
      })
      return game
    }),
  get: publicProcedure
    .input(z.object({id: z.string()}))
    .query(async ({ctx, input}) => {
      const id = input.id
      if (id) {
        const session = await ctx.prisma.gameSession.findUnique({
          where: {
            id: id
          },
          select: defaultSessionSelect
        })
        if (!session) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found',
          })
        }
        return session
      } else {
        return null
      }
    }),
  count: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx }) => {
      const count = await ctx.prisma.gameSession.aggregate({
        _count: {
          id: true
        }
      })
      return count._count.id
    })
});

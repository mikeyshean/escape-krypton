import { z } from "zod";
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from "../trpc";

const defaultSessionSelect = Prisma.validator<Prisma.GameSessionSelect>()({
  id: true,
  phoneNumber: true,
  playerName: true
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
  update: publicProcedure
    .input(z.object({id: z.string(), phoneNumber: z.string().optional(), playerName: z.string().optional()}))
    .mutation(async ({ctx, input}) => {
      const id = input.id
      const data: {[key: string]: string} = {}
      const phoneNumber = input.phoneNumber
      const playerName = input.playerName
      
      if (playerName) {
        data.playerName = playerName
      }
      if (phoneNumber) {
        data.phoneNumber = phoneNumber
      }

      const gameSession = await ctx.prisma.gameSession.update({
        where: {
          id: id,
        },
        data: data,
        select: defaultSessionSelect
      })
      return gameSession
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

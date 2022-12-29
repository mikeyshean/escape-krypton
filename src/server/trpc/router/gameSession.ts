import { contextProps } from "@trpc/react-query/dist/internals/context";
import { z } from "zod";
import { Prisma } from '@prisma/client';
import isValidScore from '../../validateGame'

import { router, publicProcedure } from "../trpc";

const defaultSessionSelect = Prisma.validator<Prisma.GameSessionSelect>()({
  id: true,
  highScore: true
});


export const gameSessionRouter = router({
  create: publicProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
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
      const session = await ctx.prisma.gameSession.findUnique({
        where: {
          id: id
        },
        select: defaultSessionSelect
      })
      return session
    })
});

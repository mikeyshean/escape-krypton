import { z } from "zod";
import { Prisma } from '@prisma/client';
import { router, publicProcedure } from "../trpc";

const defaultTauntSelect = Prisma.validator<Prisma.TauntSelect>()({
  id: true,
  text: true,
});

export const tauntRouter = router({
  list: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx }) => {
      
      const taunts = await ctx.prisma.taunt.findMany({
        select: defaultTauntSelect,
        take: 3
      })
      return taunts
    }),
  get: publicProcedure
    .input(z.object({id: z.string()}))
    .query(async ({ ctx, input}) => {
      const id = input.id

      const taunt = await ctx.prisma.taunt.findUnique({
        where: {
          id: id
        },
        select: defaultTauntSelect,
      })
      return taunt
    }),
})

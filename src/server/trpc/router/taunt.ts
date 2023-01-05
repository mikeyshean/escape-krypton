import { string, z } from "zod";
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
})

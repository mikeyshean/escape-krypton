import { z } from "zod";
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from "../trpc";
import { tauntRouter } from './taunt'

const defaultSmsSelect = Prisma.validator<Prisma.SMSSelect>()({
  id: true
});

export const smsRouter = router({
  create: publicProcedure
    .input(z.object({phoneNumber: z.string(), fields: z.object({}), highScoreId: z.string(), tauntId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const phoneNumber = input.phoneNumber
      const fields = input.fields
      const highScoreId = input.highScoreId
      const tauntId = input.tauntId

      return await ctx.prisma.sMS.create({
        data: {
          phoneNumber: phoneNumber,
          fields: fields,
          highScoreId: highScoreId,
          tauntId: tauntId,
        },
        select: defaultSmsSelect
      })
    })
})



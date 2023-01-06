import { z } from "zod";
import { Prisma } from '@prisma/client';
import { router, publicProcedure } from "../trpc";

const defaultSmsSelect = Prisma.validator<Prisma.SMSSelect>()({
  id: true,
  phoneNumber: true,
  fields: true
});

export const smsRouter = router({
  create: publicProcedure
    .input(z.object({phoneNumber: z.string(), fields: z.object({})}))
    .mutation(async ({ctx, input}) => {
      const phoneNumber = input.phoneNumber
      const fields = input.fields

      return await ctx.prisma.sMS.create({
        data: {
          phoneNumber: phoneNumber,
          fields: fields,
        },
        select: defaultSmsSelect
      })
    }),
  bulkCreate: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      fields: z.object({
        taunt: z.string(),
        playerName: z.string(),
        newRank: z.string(),
        newHighScore: z.number(),
        beatenScore: z.number(),
        beatenPlayer: z.string(),
        messageId: z.number()
      })}).array())
    .mutation(async ({ctx, input}) => {
      
      return await ctx.prisma.sMS.createMany({
        data: input,
      })
    }),
  update: publicProcedure
    .input(z.object({id: z.string(), dateSent: z.date()}))
    .mutation(async ({ctx, input}) => {
      const id = input.id
      const dateSent = input.dateSent

      return await ctx.prisma.sMS.update({
        where: {
          id: id
        },
        data: {
          dateSent: dateSent,
        },
        select: defaultSmsSelect
      })
    }),
  getPending: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx, input }) => {
      
      const pendingSms = await ctx.prisma.sMS.findMany({
        select: defaultSmsSelect,
        where: {
          dateSent: null,
          dateFailed: null
        },
      })
      
      return pendingSms
    }),
})



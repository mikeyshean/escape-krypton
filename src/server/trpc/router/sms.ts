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
    .input(z.object({id: z.string(), dateSent: z.date().nullable().optional(), dateFailed: z.date().nullable().optional()}))
    .mutation(async ({ctx, input}) => {
      const id = input.id
      const dateSent = input.dateSent
      const dateFailed = input.dateFailed

      return await ctx.prisma.sMS.update({
        where: {
          id: id
        },
        data: {
          dateSent: dateSent,
          dateFailed: dateFailed
        },
        select: defaultSmsSelect
      })
    }),
  getPending: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx }) => {
      
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



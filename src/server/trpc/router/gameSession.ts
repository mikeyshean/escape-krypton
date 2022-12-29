import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const gameSessionRouter = router({
  startGame: publicProcedure
    .input(z.object({startedAt: z.string()}))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.startedAt ?? "world"}`,
      };
    }),
});

import { router } from "../trpc";
import { exampleRouter } from "./example";
import { gameSessionRouter } from "./gameSession";

export const appRouter = router({
  example: exampleRouter,
  game: gameSessionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

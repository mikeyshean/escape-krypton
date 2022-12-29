import { router } from "../trpc";
import { gameRouter } from "./game";
import { gameSessionRouter } from "./gameSession";

export const appRouter = router({
  game: gameRouter,
  gameSession: gameSessionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

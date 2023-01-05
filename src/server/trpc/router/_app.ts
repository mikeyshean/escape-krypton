import { router } from "../trpc";
import { gameRouter } from "./game";
import { gameSessionRouter } from "./gameSession";
import { scoreRouter } from "./score";
import { tauntRouter } from "./taunt";

export const appRouter = router({
  game: gameRouter,
  gameSession: gameSessionRouter,
  score: scoreRouter,
  taunt: tauntRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { mailRouter } from "./routers/mail";
import { router } from "./trpc";

export const appRouter = router({
  mail: mailRouter,
});

export type AppRouter = typeof appRouter;

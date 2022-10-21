// src/server/router/_app.ts
import { router } from "../trpc";
import { authRouter } from "./auth";

import { exampleRouter } from "./example";
import { formRouter } from "./form";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  form: formRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

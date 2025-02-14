import { initTRPC, TRPCError } from "@trpc/server";
import { SuperJSON } from "superjson";
import { auth } from "@/lib/auth";
import { DrizzleDB } from "@/db";

export type TrpcContext = {
  request: Request;
  db: DrizzleDB;
};

const t = initTRPC.context<TrpcContext>().create({ transformer: SuperJSON });

export const router = t.router;
export const publicProcedure = t.procedure;

export const userProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: ctx.request.headers });
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" });
  return next({ ctx: { ...ctx, session } });
});

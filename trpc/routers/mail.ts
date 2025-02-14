import { mailAccessibleProcedure, router } from "../trpc";
import { z } from "zod";

export const mailRouter = router({
  getMessages: mailAccessibleProcedure
    .input(
      z.object({
        folder: z.string(),
        q: z.string().optional(),
        maxResults: z.number().optional(),
        labelIds: z.string().array().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { driver } = ctx;
      return {
        messages: await driver.list(input.folder, input.q, input.maxResults, input.labelIds),
        connectionId: ctx.session.connectionId,
      };
    }),
  getSingleMessage: mailAccessibleProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { driver } = ctx;
      return {
        message: await driver.get(input.id),
        connectionId: ctx.session.connectionId,
      };
    }),
});

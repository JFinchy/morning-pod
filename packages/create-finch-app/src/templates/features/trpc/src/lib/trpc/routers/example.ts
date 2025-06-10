import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../server";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getCurrentTime: publicProcedure.query(() => {
    return {
      time: new Date().toISOString(),
    };
  }),
});

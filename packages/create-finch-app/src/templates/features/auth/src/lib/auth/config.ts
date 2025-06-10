import { betterAuth } from "better-auth";
{{#if hasDatabase}}import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";{{/if}}

export const auth = betterAuth({
{{#if hasDatabase}}  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),{{/if}}
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    `https://${process.env.VERCEL_URL}` ||
    "http://localhost:3000",

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossOrigin: true,
    disableCSRFCheck: true,
    disableOriginCheck: true,
  },
  trustedOrigins: ["https://vercel.app", `https://${process.env.VERCEL_URL}`],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      const getLocaleFromRequest = (req?: Request) => {
        if (!req) return "en";
        const cookieHeader = req.headers.get("cookie") || "";
        const nextLocaleCookie = cookieHeader
          .split("; ")
          .find((row) => row.startsWith("NEXT_LOCALE="))
          ?.split("=")[1];
        if (nextLocaleCookie === "fr" || nextLocaleCookie === "en")
          return nextLocaleCookie;

        const acceptLanguage = req.headers.get("accept-language") || "";
        return acceptLanguage.startsWith("fr") ? "fr" : "en";
      };

      const locale = getLocaleFromRequest(request);

      await sendPasswordResetEmail({
        userEmail: data.user.email,
        userName: data.user.name,
        url: data.url,
        locale,
      });
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/request-password-reset": {
        window: 60 * 60, // 1 hour
        max: 3, // 3 attempts per hour
      },
      "/sign-up/email": {
        window: 60 * 60, // 1 hour
        max: 3, // 3 attempts per hour
      },
      "/sign-in/email": {
        window: 60 * 5, // 5 minutes
        max: 5, // 5 attempts
      },
      "/change-password": {
        window: 60 * 60, // 1 hour
        max: 5, // 5 attempts per hour
      },
      "/send-verification-email": {
        window: 60 * 60, // 1 hour
        max: 3, // 3 attempts per hour
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
  },
  callbacks: {
    session: async (session: any) => {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true } as any,
      });
      return {
        ...session,
        user: {
          ...session.user,
          role: (user as any)?.role || "user",
        },
      };
    },
  },
});

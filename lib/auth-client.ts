"use client";

import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  fetchOptions: {
    onError: async (ctx) => {
      if (ctx.response.status === 429) {
        const retryAfter = ctx.response.headers.get("X-Retry-After");
        if (retryAfter) {
          const seconds = parseInt(retryAfter);
          if (seconds >= 60) {
            const minutes = Math.ceil(seconds / 60);
            toast.error(
              `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}. ⏳`,
            );
          } else {
            toast.error(
              `Too many requests. Please try again in ${seconds} second${seconds > 1 ? "s" : ""}. ⏳`,
            );
          }
        } else {
          toast.error("Too many requests. Please try again later. ⏳");
        }
      }
    },
  },
});

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  changePassword,
  requestPasswordReset,
  resetPassword,
} = authClient;

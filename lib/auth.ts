import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "@/lib/db";
import nodemailer from "nodemailer";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const escapeHtml = (str: string) =>
        str.replace(
          /[&<>"']/g,
          (m) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[m] || m,
        );

      const mailOptions = {
        from: `"Flora Access" <${process.env.SMTP_USER}>`,
        to: data.user.email,
        subject: "Reset your Flora password",
        html: `
          <div style="background-color: #fafafa; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <div style="padding: 40px; text-align: center;">
                <div style="margin-bottom: 24px;">
                  <span style="font-size: 32px;">🎀</span>
                </div>
                <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 16px; color: #000;">Reset your password</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 32px;">
                  Hi ${escapeHtml(data.user.name)}, we received a request to reset your password. Click the button below to choose a new one.
                </p>
                <a href="${data.url}" style="display: inline-block; background-color: #FF5A96; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 90, 150, 0.2);">
                  Reset Password
                </a>
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f0f0f0;">
                  <p style="font-size: 14px; color: #999; margin: 0;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              </div>
              <div style="background-color: #fafafa; padding: 24px; text-align: center;">
                <p style="font-size: 12px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
                  Sent with love from Flora
                </p>
              </div>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Reset password email sent to", data.user.email);
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }
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

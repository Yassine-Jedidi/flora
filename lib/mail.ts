import nodemailer from "nodemailer";
import { escapeHtml } from "@/lib/utils";

/**
 *
 * CONFIGURATION & TYPES
 *
 */

const SMTP_USER = process.env.SMTP_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

if (!SMTP_USER || !GMAIL_APP_PASSWORD || !EMAIL_FROM_ADDRESS) {
  throw new Error(
    "SMTP configuration error: SMTP_USER, GMAIL_APP_PASSWORD, and EMAIL_FROM environment variables must be defined.",
  );
}

const EMAIL_FROM = `"Flora Access" <${EMAIL_FROM_ADDRESS}>`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

interface OrderEmailData {
  orderId: string;
  userEmail: string;
  userName: string;
  totalPrice: number;
  shippingCost: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    fullName: string;
    governorate: string;
    city: string;
    detailedAddress: string;
  };
  locale?: string;
}

interface PasswordResetData {
  userEmail: string;
  userName: string;
  url: string;
  locale?: string;
}

type Locale = "en" | "fr";

/**
 *
 * TRANSLATIONS
 *
 */

const TRANSLATIONS = {
  en: {
    common: {
      sentWithLove: "Sent with love from Flora",
      visitFaq: "Visit our FAQ",
      somethingWrong: "Something not right?",
      ignore: "If you didn't request this, you can safely ignore this email.",
    },
    orderConfirmation: {
      subject: (id: string) => `Order Received! #${id}`,
      title: "Order Received!",
      subtitle: "We've received your order and we're getting it ready.",
      confirmationNote: "✨ We will call you soon for confirmation! ✨",
      orderNumber: "Order Number",
      date: "Date",
      summary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping Cost",
      total: "Total",
      shippingTo: "Shipping To",
      viewDetails: "View Order Details",
    },
    orderDelivered: {
      subject: "Your Flora treasure has arrived! 🌸",
      title: "It's Here!",
      message: (name: string, id: string) =>
        `Hi ${name}, your order <b>#${id}</b> has been delivered.`,
      note: "We hope your new treasures bring a little extra sparkle to your day! ✨ <br> Thank you for choosing Flora Access.",
      viewDetails: "View Order Details",
    },
    passwordReset: {
      subject: "Reset your Flora password",
      title: "Reset your password",
      message: (name: string) =>
        `Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.`,
      button: "Reset Password",
    },
  },
  fr: {
    common: {
      sentWithLove: "Envoyé avec amour par Flora",
      visitFaq: "Visitez notre FAQ",
      somethingWrong: "Quelque chose ne va pas ?",
      ignore:
        "Si vous n'avez pas demandé cela, vous pouvez ignorer cet e-mail en toute sécurité.",
    },
    orderConfirmation: {
      subject: (id: string) => `Commande reçue ! #${id}`,
      title: "Commande reçue !",
      subtitle: "Nous avons bien reçu votre commande et nous la préparons.",
      confirmationNote:
        "✨ Nous vous appellerons bientôt pour confirmation ! ✨",
      orderNumber: "Numéro de commande",
      date: "Date",
      summary: "Résumé de la commande",
      subtotal: "Sous-total",
      shipping: "Frais de livraison",
      total: "Total",
      shippingTo: "Livrer à",
      viewDetails: "Voir les détails de la commande",
    },
    orderDelivered: {
      subject: "Votre trésor Flora est arrivé ! 🌸",
      title: "C'est ici !",
      message: (name: string, id: string) =>
        `Bonjour ${name}, votre commande <b>#${id}</b> a été livrée.`,
      note: "Nous espérons que vos nouveaux trésors apporteront un peu plus d'éclat à votre journée ! ✨ <br> Merci d'avoir choisi Flora Access.",
      viewDetails: "Voir les détails de la commande",
    },
    passwordReset: {
      subject: "Réinitialisez votre mot de passe Flora",
      title: "Réinitialisez votre mot de passe",
      message: (name: string) =>
        `Bonjour ${name}, nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.`,
      button: "Réinitialiser le mot de passe",
    },
  },
};

/**
 *
 * HELPERS
 *
 */

const getLocale = (locale?: string): Locale => (locale === "fr" ? "fr" : "en");

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} [${subject}]`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

const EmailLayout = ({
  children,
  title,
  subtitle,
  confirmationNote,
  footerContent,
  brandingText,
  icon = "🌸",
}: {
  children: string;
  title: string;
  subtitle?: string;
  confirmationNote?: string;
  footerContent?: string;
  brandingText: string;
  icon?: string;
}) => `
  <div style="background-color: #fafafa; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      
      <!-- Header -->
      <div style="padding: 40px 40px 20px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 40px;">${icon}</span>
        </div>
        <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px; color: #000;">${title}</h1>
        ${subtitle ? `<p style="font-size: 16px; color: #666; margin: 0;">${subtitle}</p>` : ""}
        ${confirmationNote ? `<p style="font-size: 14px; color: #FF5A96; font-weight: 700; margin-top: 12px; font-style: italic;">${confirmationNote}</p>` : ""}
      </div>

      <!-- Main Content -->
      ${children}

      <!-- Footer Help / Actions -->
      ${
        footerContent
          ? `
      <div style="padding: 30px 40px; text-align: center; background-color: #fdfdfd; border-top: 1px solid #f0f0f0;">
        <p style="font-size: 13px; color: #999; margin: 0;">
          ${footerContent}
        </p>
      </div>`
          : ""
      }

      <!-- Branding -->
      <div style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #f0f0f0;">
        <p style="font-size: 12px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
          ${brandingText}
        </p>
      </div>
      
    </div>
  </div>
`;

const Button = (url: string, text: string) => `
  <div style="text-align: center; padding: 20px 0;">
    <a href="${url}" style="display: inline-block; background-color: #FF5A96; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 90, 150, 0.2);">
      ${text}
    </a>
  </div>
`;

/**
 *
 * EXPORTED FUNCTIONS
 *
 */

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const locale = getLocale(data.locale);
  const t = TRANSLATIONS[locale];
  const itemsSubtotal = data.totalPrice - data.shippingCost;
  const orderIdShort = data.orderId.slice(-8).toUpperCase();
  const dateFormatted = new Date().toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB",
  );

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding-bottom: 12px;">
        <div style="font-size: 15px; color: #333;">
          <span style="font-weight: 700;">${item.quantity}x</span> ${escapeHtml(item.name)}
        </div>
      </td>
      <td align="right" style="padding-bottom: 12px; font-size: 15px; color: #666;">
        ${(item.price * item.quantity).toFixed(3)} TND
      </td>
    </tr>
  `,
    )
    .join("");

  const content = `
    <!-- Order Stats -->
    <div style="padding: 20px 40px; border-bottom: 1px solid #f0f0f0; border-top: 1px solid #f0f0f0; background-color: #fdfdfd;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">${t.orderConfirmation.orderNumber}</p>
            <p style="font-size: 16px; font-weight: 700; margin: 0;">#${orderIdShort}</p>
          </td>
          <td align="right">
              <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">${t.orderConfirmation.date}</p>
              <p style="font-size: 16px; font-weight: 700; color: #333; margin: 0;">${dateFormatted}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    <div style="padding: 30px 40px;">
      <h3 style="font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">${t.orderConfirmation.summary}</h3>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        ${itemsHtml}
        
        <!-- Divider -->
        <tr><td colspan="2" style="padding: 10px 0; border-top: 1px solid #f0f0f0;"></td></tr>

        <!-- Subtotal -->
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #999;">${t.orderConfirmation.subtotal}</td>
          <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #999;">${itemsSubtotal.toFixed(3)} TND</td>
        </tr>

        <!-- Shipping -->
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #999;">${t.orderConfirmation.shipping}</td>
          <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #999;">${data.shippingCost.toFixed(3)} TND</td>
        </tr>

        <!-- Total -->
        <tr>
          <td style="padding-top: 8px; font-size: 16px; font-weight: 700; color: #333;">${t.orderConfirmation.total}</td>
          <td align="right" style="padding-top: 8px; font-size: 16px; font-weight: 700; color: #FF5A96;">${data.totalPrice.toFixed(3)} TND</td>
        </tr>
      </table>
    </div>

    <!-- Shipping Info -->
    <div style="padding: 0 40px 10px;">
      <div style="background-color: #f9f9f9; border-radius: 16px; padding: 20px;">
        <h3 style="font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">${t.orderConfirmation.shippingTo}</h3>
        <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
          <span style="font-weight: 700;">${escapeHtml(data.shippingAddress.fullName)}</span><br>
          ${escapeHtml(data.shippingAddress.detailedAddress)}<br>
          ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.governorate)}
        </p>
      </div>
    </div>

    ${Button(`${APP_URL}/orders/${data.orderId}`, t.orderConfirmation.viewDetails)}
  `;

  const html = EmailLayout({
    children: content,
    title: t.orderConfirmation.title,
    subtitle: t.orderConfirmation.subtitle,
    confirmationNote: t.orderConfirmation.confirmationNote,
    brandingText: t.common.sentWithLove,
    icon: "🌸",
  });

  await sendEmail(
    data.userEmail,
    t.orderConfirmation.subject(orderIdShort),
    html,
  );
}

export async function sendOrderDeliveredEmail(data: {
  orderId: string;
  userEmail: string;
  userName: string;
  locale?: string;
}) {
  const locale = getLocale(data.locale);
  const t = TRANSLATIONS[locale];
  const orderIdShort = data.orderId.slice(-8).toUpperCase();

  const content = `
    <div style="padding: 20px 40px; text-align: center;">
      <p style="font-size: 15px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        ${t.orderDelivered.note}
      </p>
      ${Button(`${APP_URL}/orders/${data.orderId}`, t.orderDelivered.viewDetails)}
    </div>
  `;

  const footerContent = `
    ${t.common.somethingWrong} <a href="${APP_URL}/faq" style="color: #FF5A96; text-decoration: none; font-weight: 700;">${t.common.visitFaq}</a>.
  `;

  const html = EmailLayout({
    children: content,
    title: t.orderDelivered.title,
    subtitle: t.orderDelivered.message(escapeHtml(data.userName), orderIdShort),
    brandingText: t.common.sentWithLove,
    footerContent,
    icon: "🎁",
  });

  await sendEmail(data.userEmail, t.orderDelivered.subject, html);
}

export async function sendPasswordResetEmail(data: PasswordResetData) {
  const locale = getLocale(data.locale);
  const t = TRANSLATIONS[locale];

  const content = `
    <div style="padding: 20px 40px; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 32px;">
        ${t.passwordReset.message(escapeHtml(data.userName))}
      </p>
      ${Button(data.url, t.passwordReset.button)}
    </div>
  `;

  const footerContent = t.common.ignore;

  const html = EmailLayout({
    children: content,
    title: t.passwordReset.title,
    brandingText: t.common.sentWithLove,
    footerContent,
    icon: "🎀",
  });

  await sendEmail(data.userEmail, t.passwordReset.subject, html);
}

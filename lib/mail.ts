import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface OrderEmailData {
  orderId: string;
  userEmail: string;
  userName: string;
  totalPrice: number;
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
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const shippingCost = 7.0;
  const itemsSubtotal = data.totalPrice - shippingCost;

  const mailOptions = {
    from: `"Flora Access" <${process.env.SMTP_USER}>`,
    to: data.userEmail,
    subject: `Order Confirmed! #${data.orderId.slice(-6).toUpperCase()}`,
    html: `
      <div style="background-color: #fafafa; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <!-- Header -->
          <div style="padding: 40px 40px 20px; text-align: center;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 40px;">🌸</span>
            </div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px; color: #000;">Thank you for your order!</h1>
            <p style="font-size: 16px; color: #666; margin: 0;">We've received your order and we're getting it ready.</p>
            <p style="font-size: 14px; color: #FF5A96; font-weight: 700; margin-top: 12px; font-style: italic;">
              ✨ We will call you soon for confirmation! ✨ 
            </p>
          </div>

          <!-- Order Stats -->
          <div style="padding: 20px 40px; border-bottom: 1px solid #f0f0f0; border-top: 1px solid #f0f0f0; background-color: #fdfdfd;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">Order Number</p>
                  <p style="font-size: 16px; font-weight: 700; margin: 0;">#${data.orderId.slice(-6).toUpperCase()}</p>
                </td>
                <td align="right">
                  <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">Total Amount</p>
                  <p style="font-size: 16px; font-weight: 700; color: #FF5A96; margin: 0;">${data.totalPrice.toFixed(3)} TND</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Items -->
          <div style="padding: 30px 40px;">
            <h3 style="font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">Order Summary</h3>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              ${data.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding-bottom: 12px;">
                    <div style="font-size: 15px; color: #333;">
                      <span style="font-weight: 700;">${item.quantity}x</span> ${item.name}
                    </div>
                  </td>
                  <td align="right" style="padding-bottom: 12px; font-size: 15px; color: #666;">
                    ${(item.price * item.quantity).toFixed(3)} TND
                  </td>
                </tr>
              `,
                )
                .join("")}
              
              <!-- Divider -->
              <tr>
                <td colspan="2" style="padding: 10px 0; border-top: 1px solid #f0f0f0;"></td>
              </tr>

              <!-- Subtotal -->
              <tr>
                <td style="padding-bottom: 8px; font-size: 14px; color: #999;">Subtotal</td>
                <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #999;">${itemsSubtotal.toFixed(3)} TND</td>
              </tr>

              <!-- Shipping -->
              <tr>
                <td style="padding-bottom: 8px; font-size: 14px; color: #999;">Shipping Cost</td>
                <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #999;">${shippingCost.toFixed(3)} TND</td>
              </tr>

              <!-- Total -->
              <tr>
                <td style="padding-top: 8px; font-size: 16px; font-weight: 700; color: #333;">Total</td>
                <td align="right" style="padding-top: 8px; font-size: 16px; font-weight: 700; color: #FF5A96;">${data.totalPrice.toFixed(3)} TND</td>
              </tr>
            </table>
          </div>

          <!-- Shipping -->
          <div style="padding: 0 40px 40px;">
            <div style="background-color: #f9f9f9; border-radius: 16px; padding: 20px;">
              <h3 style="font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">Shipping To</h3>
              <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
                <span style="font-weight: 700;">${data.shippingAddress.fullName}</span><br>
                ${data.shippingAddress.detailedAddress}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.governorate}
              </p>
            </div>
          </div>

          <!-- Footer Action -->
          <div style="padding: 0 40px 40px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/orders" style="display: inline-block; background-color: #FF5A96; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 90, 150, 0.2);">
              View Order Status
            </a>
          </div>

          <!-- Branding -->
          <div style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #f0f0f0;">
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
    console.log(
      `Order confirmation email sent to ${data.userEmail} for order ${data.orderId}`,
    );
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

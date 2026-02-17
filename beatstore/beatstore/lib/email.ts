import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendPurchaseEmailParams {
  to: string;
  customerName: string;
  downloadToken: string;
  orderItems: Array<{
    title: string;
    licenseType: string;
    price: number;
  }>;
  total: number;
  licensePdfBuffer?: Buffer;
}

export async function sendPurchaseEmail({
  to,
  customerName,
  downloadToken,
  orderItems,
  total,
  licensePdfBuffer,
}: SendPurchaseEmailParams) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const downloadUrl = `${baseUrl}/api/download/${downloadToken}`;

  const itemsHtml = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #232329; color: #e5e5e5;">${item.title}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #232329; color: #a3a3a3;">${item.licenseType}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #232329; color: #c8ff00; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const attachments: nodemailer.SendMailOptions["attachments"] = [];
  if (licensePdfBuffer) {
    attachments.push({
      filename: "license-agreement.pdf",
      content: licensePdfBuffer,
      contentType: "application/pdf",
    });
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your Beat Purchase - Download Ready`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #c8ff00; font-size: 28px; margin: 0;">Thank You for Your Purchase</h1>
          </div>
          
          <div style="background-color: #131316; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Hey ${customerName || "there"},
            </p>
            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Your beats are ready to download. Click the button below to access your files.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background-color: #c8ff00; color: #0a0a0b; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
                Download Your Beats
              </a>
            </div>
            
            <p style="color: #737373; font-size: 12px; text-align: center; margin: 0;">
              This link expires in 7 days. You have up to 5 downloads.
            </p>
          </div>
          
          <div style="background-color: #131316; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #fafafa; font-size: 16px; margin: 0 0 16px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px 16px; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Beat</th>
                  <th style="text-align: left; padding: 8px 16px; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">License</th>
                  <th style="text-align: right; padding: 8px 16px; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 16px; color: #fafafa; font-weight: 700;">Total</td>
                  <td style="padding: 16px; color: #c8ff00; font-weight: 700; text-align: right;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <p style="color: #525252; font-size: 12px; text-align: center; line-height: 1.6;">
            If you have any questions, reply to this email.<br>
            License agreement attached as PDF.
          </p>
        </div>
      </body>
      </html>
    `,
    attachments,
  });
}

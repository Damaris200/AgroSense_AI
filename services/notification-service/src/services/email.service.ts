import nodemailer from 'nodemailer';
import type { RecommendationGeneratedEvent, EmailPayload } from '../models/notification.model';

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const smtpHost = process.env.SMTP_HOST ?? 'smtp.ethereal.email';
    const smtpPort = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);
    const smtpUser = process.env.SMTP_USER ?? '';
    const smtpPass = process.env.SMTP_PASS ?? '';

    _transporter = nodemailer.createTransport({
      host:   smtpHost,
      port:   smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return _transporter;
}

export function buildRecommendationEmail(event: RecommendationGeneratedEvent): EmailPayload {
  const formattedDate = new Date(event.generatedAt).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const subject = `Your AgroSense AI Farm Recommendation is Ready, ${event.userName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AgroSense AI Recommendation</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#2d6a4f;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🌱 AgroSense AI</h1>
              <p style="margin:8px 0 0;color:#b7e4c7;font-size:14px;">Smart farming insights, delivered</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#1b4332;font-size:18px;font-weight:600;">Hello, ${event.userName}!</p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Your personalized farm analysis is complete. Here is your AI-generated recommendation:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f0faf4;border-left:4px solid #2d6a4f;padding:20px 24px;border-radius:4px;">
                    <p style="margin:0;color:#1b4332;font-size:15px;line-height:1.7;">${event.recommendation}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;color:#888;font-size:13px;">Generated on ${formattedDate}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f7f4;padding:24px 40px;border-top:1px solid #e8f5e9;">
              <p style="margin:0;color:#888;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} AgroSense AI · You received this because you submitted a farm analysis request.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { to: event.userEmail, subject, html };
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const transporter = getTransporter();
  const smtpFrom = process.env.SMTP_FROM ?? 'AgroSense AI <noreply@agrosense.ai>';
  const info = await transporter.sendMail({
    from:    smtpFrom,
    to:      payload.to,
    subject: payload.subject,
    html:    payload.html,
  });
  console.log(`[notification-service] email sent to ${payload.to} — messageId: ${info.messageId}`);
}

import nodemailer from 'nodemailer';
import type { RecommendationGeneratedEvent, EmailPayload } from '../models/notification.model';

export function buildRecommendationEmail(event: RecommendationGeneratedEvent): EmailPayload {
  const displayName = event.userName?.trim() || 'Farmer';
  const formattedDate = new Date(event.generatedAt).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const subject = "Your AgroSense AI Farm Recommendation is Ready, " + displayName;
  const html = "<!DOCTYPE html><html><head><meta charset=UTF-8/></head><body style='margin:0;padding:0;background:#f4f7f4;font-family:Arial,sans-serif;'><table width=100% cellpadding=0 cellspacing=0 style='background:#f4f7f4;padding:40px 0;'><tr><td align=center><table width=600 cellpadding=0 cellspacing=0 style='background:#fff;border-radius:8px;'><tr><td style='background:#2d6a4f;padding:32px 40px;'><h1 style='margin:0;color:#fff;font-size:24px;'>AgroSense AI</h1><p style='margin:8px 0 0;color:#b7e4c7;font-size:14px;'>Smart farming insights</p></td></tr><tr><td style='padding:40px;'><p style='color:#1b4332;font-size:18px;font-weight:600;'>Hello, " + displayName + "!</p><p style='color:#555;font-size:15px;line-height:1.6;'>Your farm analysis is complete:</p><table width=100%><tr><td style='background:#f0faf4;border-left:4px solid #2d6a4f;padding:20px 24px;border-radius:4px;'><p style='color:#1b4332;font-size:15px;line-height:1.7;'>" + event.recommendation + "</p></td></tr></table><p style='color:#888;font-size:13px;margin-top:32px;'>Generated on " + formattedDate + "</p></td></tr></table></td></tr></table></body></html>";
  return { to: event.userEmail, subject, html };
}

// A single reusable SMTP transporter (created lazily on first send).
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.ethereal.email",
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = process.env.SMTP_FROM ?? "AgroSense AI <noreply@agrosense.ai>";

  await getTransporter().sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  console.log("[notification-service] email sent via SMTP to " + payload.to);
}

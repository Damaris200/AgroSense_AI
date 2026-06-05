import { prisma } from '../config/prisma';
import { buildRecommendationEmail, sendEmail } from './email.service';
import type { RecommendationGeneratedEvent } from '../models/notification.model';

export async function processRecommendation(event: RecommendationGeneratedEvent): Promise<void> {
  const hasEmail  = typeof event.userEmail === 'string' && event.userEmail.includes('@');
  const isRealUser = event.userId !== 'anonymous';

  // Persist the notification FIRST. This must never depend on the email send:
  // if SMTP is slow/unreachable, the notification still appears for the user and
  // the Kafka consumer is free to commit and move on (no rebalance loop).
  if (isRealUser) {
    await prisma.notification.create({
      data: {
        userId:  event.userId,
        farmId:  event.farmId,
        message: event.recommendation,
        channel: 'email',
      },
    });
    console.log(`[notification-service] notification saved for userId=${event.userId} farmId=${event.farmId}`);
  }

  // Email is a best-effort side-effect. A failure here is logged but never thrown,
  // so it cannot block the consumer's heartbeat or cause the message to be redelivered.
  if (hasEmail) {
    try {
      const emailPayload = buildRecommendationEmail(event);
      await sendEmail(emailPayload);
    } catch (err) {
      console.error(`[notification-service] email send failed for ${event.userEmail} (notification already saved):`, err);
    }
  } else {
    console.log(`[notification-service] no valid email for userId=${event.userId} — skipping email send`);
  }
}
